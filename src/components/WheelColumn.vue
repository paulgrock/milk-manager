<script setup lang="ts" generic="T extends string | number">
// One column of an iOS-style picker wheel: a list that scrolls and snaps
// so the chosen item sits in the band in the middle. Scrolling, tapping an
// item or the arrow keys choose.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const ROW = 36
const VISIBLE = 5
const PAD = ((VISIBLE - 1) / 2) * ROW

const props = defineProps<{ items: { label: string; value: T }[]; label: string }>()
const model = defineModel<T>({ required: true })

const list = ref<HTMLElement>()
const id = `wheel-${Math.random().toString(36).slice(2, 8)}`
const index = computed(() => Math.max(0, props.items.findIndex((i) => i.value === model.value)))

function scrollTo(i: number, smooth: boolean) {
  list.value?.scrollTo({ top: i * ROW, behavior: smooth ? 'smooth' : 'instant' })
}

onMounted(() => nextTick(() => scrollTo(index.value, false)))
watch(index, (i) => {
  if (list.value && Math.round(list.value.scrollTop / ROW) !== i) scrollTo(i, true)
})

// Chosen once scrolling settles, so flicking past items doesn't pick each one.
let settle: ReturnType<typeof setTimeout> | undefined
function onScroll() {
  clearTimeout(settle)
  settle = setTimeout(() => {
    if (!list.value) return
    const i = Math.min(props.items.length - 1, Math.max(0, Math.round(list.value.scrollTop / ROW)))
    if (props.items[i]!.value !== model.value) model.value = props.items[i]!.value
  }, 120)
}
onBeforeUnmount(() => clearTimeout(settle))

function choose(i: number) {
  const item = props.items[Math.min(props.items.length - 1, Math.max(0, i))]
  if (item) model.value = item.value
}

function onKey(e: KeyboardEvent) {
  const moves: Record<string, number> = { ArrowUp: index.value - 1, ArrowDown: index.value + 1, Home: 0, End: props.items.length - 1 }
  if (!(e.key in moves)) return
  e.preventDefault()
  choose(moves[e.key]!)
}
</script>

<template>
  <div class="relative" :style="{ height: `${ROW * VISIBLE}px` }">
    <div class="pointer-events-none absolute inset-x-1 rounded-md bg-elevated" :style="{ top: `${PAD}px`, height: `${ROW}px` }" />
    <div
      ref="list"
      role="listbox"
      tabindex="0"
      :aria-label="label"
      :aria-activedescendant="`${id}-${index}`"
      class="wheel relative h-full overflow-y-auto snap-y snap-mandatory rounded-md focus-visible:outline-2 focus-visible:outline-primary"
      :style="{ paddingBlock: `${PAD}px` }"
      @scroll.passive="onScroll"
      @keydown="onKey"
    >
      <div
        v-for="(item, i) in items"
        :id="`${id}-${i}`"
        :key="item.value"
        role="option"
        :aria-selected="i === index"
        class="snap-center flex items-center justify-center px-3 cursor-pointer select-none tabular-nums text-lg"
        :class="i === index ? 'font-semibold text-highlighted' : 'text-muted'"
        :style="{ height: `${ROW}px` }"
        @click="choose(i)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.wheel {
  scrollbar-width: none;
  mask-image: linear-gradient(transparent, black 30%, black 70%, transparent);
}
.wheel::-webkit-scrollbar {
  display: none;
}
</style>
