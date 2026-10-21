import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { supabase, unwrap } from '@/lib/supabase'
import { useHerd } from './useHerd'

export const herdMembersKey = (herdId: string) => ['herdMembers', herdId] as const

export function useHerdMembers() {
  const { herdId } = useHerd()
  const members = useQuery({
    queryKey: computed(() => herdMembersKey(herdId.value)),
    queryFn: async () =>
      unwrap(await supabase.from('herd_members').select('*').eq('herd_id', herdId.value).order('created_at')),
    enabled: computed(() => !!herdId.value),
  })
  const nameOf = computed(() => {
    const names = new Map((members.data.value ?? []).map((m) => [m.user_id, m.display_name]))
    return (userId: string | null | undefined) => (userId ? names.get(userId) : undefined)
  })
  return { members, membersKey: computed(() => herdMembersKey(herdId.value)), nameOf }
}
