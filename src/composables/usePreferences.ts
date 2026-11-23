import { computed } from 'vue'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { useToast } from '@nuxt/ui/composables'
import { supabase, unwrap } from '@/lib/supabase'
import { queryClient } from '@/lib/queryClient'
import { useAuth } from './useAuth'
import type { Database } from '@/lib/database.types'

export type Preferences = Database['public']['Tables']['user_preferences']['Row']
type Changes = Pick<Database['public']['Tables']['user_preferences']['Update'], 'nav_tabs'>

const preferencesKey = (userId: string) => ['preferences', userId] as const

/**
 * The signed-in person's own settings, shared by every herd and device. Null
 * until they first change one; each field is null while it's the default.
 */
export function usePreferences() {
  const { user } = useAuth()
  const userId = computed(() => user.value?.id ?? '')
  const key = computed(() => preferencesKey(userId.value))
  const toast = useToast()

  const preferences = useQuery({
    queryKey: key,
    queryFn: async (): Promise<Preferences | null> => {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId.value)
        .maybeSingle()
      if (error) throw new Error(error.message)
      return data
    },
    enabled: computed(() => !!userId.value),
  })

  // Shown at once; put back if the save fails.
  const save = useMutation({
    mutationFn: async (changes: Changes) =>
      unwrap(
        await supabase
          .from('user_preferences')
          .upsert({ ...changes, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }),
      ),
    onMutate: async (changes) => {
      const k = key.value
      await queryClient.cancelQueries({ queryKey: k })
      const before = queryClient.getQueryData<Preferences | null>(k)
      queryClient.setQueryData<Preferences | null>(k, {
        user_id: userId.value,
        nav_tabs: null,
        updated_at: new Date().toISOString(),
        ...before,
        ...changes,
      })
      return { k, before }
    },
    onError: (e: Error, _changes, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.k, ctx.before)
      toast.add({ color: 'error', title: 'Could not save that setting', description: e.message })
    },
    onSettled: (_d, _e, _c, ctx) => queryClient.invalidateQueries({ queryKey: ctx?.k ?? key.value }),
  })

  return { preferences, save: save.mutate }
}
