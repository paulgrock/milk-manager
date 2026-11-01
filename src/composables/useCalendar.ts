import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useHerdGoats } from './useGoats'
import { useBreedingData } from './useBreeding'
import { useHealthData } from './useHealth'
import { useLactations } from './useMilk'
import { useMilkTests } from './useMilkTests'
import { useCheeseData } from './useCheese'
import { useChoresData } from './useChores'
import { todayISO } from '@/lib/dates'
import { buildEvents } from '@/lib/calendar'

/** Calendar events between two dates, from every part of the app. */
export function useCalendarEvents(from: MaybeRefOrGetter<string>, to: MaybeRefOrGetter<string>) {
  const { goats } = useHerdGoats()
  const breeding = useBreedingData()
  const health = useHealthData()
  const lactations = useLactations()
  const tests = useMilkTests()
  const cheese = useCheeseData()
  const chores = useChoresData()

  const loading = computed(
    () =>
      goats.isPending.value ||
      breeding.query.isPending.value ||
      health.query.isPending.value ||
      lactations.isPending.value ||
      tests.query.isPending.value ||
      cheese.query.isPending.value ||
      chores.query.isPending.value,
  )

  const events = computed(() =>
    buildEvents(
      {
        goats: goats.data.value ?? [],
        breeding: breeding.data.value,
        careTypes: health.data.value.careTypes,
        careEvents: health.data.value.careEvents,
        treatments: health.data.value.treatments,
        lactations: lactations.data.value ?? [],
        tests: tests.data.value.tests,
        cheeseTypes: cheese.data.value.types,
        cheeseMakes: cheese.data.value.makes,
        chores: chores.data.value.chores,
        choresDone: chores.data.value.done,
        today: todayISO(),
      },
      toValue(from),
      toValue(to),
    ),
  )

  return { events, loading }
}
