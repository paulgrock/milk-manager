import { computed } from 'vue'
import { refreshQueries } from '@/lib/queryClient'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { supabase, unwrap } from '@/lib/supabase'
import { resizeImage } from '@/lib/images'
import type { Appraisal, Goat, GoatInsert, GoatPhoto } from '@/lib/goats'
import type { Database } from '@/lib/database.types'
import { useHerd } from './useHerd'

type AppraisalInsert = Database['public']['Tables']['linear_appraisals']['Insert']
type PhotoKind = 'conformation' | 'head' | 'udder' | 'other'

const BUCKET = 'goat-photos'

export const goatKeys = {
  goats: (herdId: string) => ['goats', herdId] as const,
  appraisals: (herdId: string) => ['appraisals', herdId] as const,
  photos: (herdId: string) => ['goatPhotos', herdId] as const,
  photoUrls: (paths: string[]) => ['photoUrls', ...paths] as const,
}

/** All goats, appraisals and photos for the current herd. A herd is small enough to load whole. */
export function useHerdGoats() {
  const { herdId } = useHerd()
  const enabled = computed(() => !!herdId.value)

  const goats = useQuery({
    queryKey: computed(() => goatKeys.goats(herdId.value)),
    queryFn: async (): Promise<Goat[]> =>
      unwrap(await supabase.from('goats').select('*').eq('herd_id', herdId.value)),
    enabled,
  })

  const appraisals = useQuery({
    queryKey: computed(() => goatKeys.appraisals(herdId.value)),
    queryFn: async (): Promise<Appraisal[]> =>
      unwrap(
        await supabase
          .from('linear_appraisals')
          .select('*')
          .eq('herd_id', herdId.value)
          .order('appraised_on', { ascending: false }),
      ),
    enabled,
  })

  const photos = useQuery({
    queryKey: computed(() => goatKeys.photos(herdId.value)),
    queryFn: async (): Promise<GoatPhoto[]> =>
      unwrap(
        await supabase.from('goat_photos').select('*').eq('herd_id', herdId.value).order('created_at'),
      ),
    enabled,
  })

  const byId = computed(() => new Map((goats.data.value ?? []).map((g) => [g.id, g])))

  return { herdId, goats, appraisals, photos, byId }
}

/** Short-lived signed URLs for private photo files. */
export function usePhotoUrls(paths: () => string[]) {
  const sorted = computed(() => [...new Set(paths())].sort())
  const urls = useQuery({
    queryKey: computed(() => goatKeys.photoUrls(sorted.value)),
    queryFn: async () => {
      const rows = unwrap(await supabase.storage.from(BUCKET).createSignedUrls(sorted.value, 60 * 60))
      const entries: [string, string][] = []
      for (const r of rows) if (r.path && r.signedUrl) entries.push([r.path, r.signedUrl])
      return Object.fromEntries(entries)
    },
    enabled: computed(() => sorted.value.length > 0),
    staleTime: 50 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })
  return computed<Record<string, string>>(() => urls.data.value ?? {})
}

export function useGoatMutations() {
  const { herdId } = useHerd()

  const refresh = (key: readonly unknown[]) => refreshQueries(key)

  const saveGoat = useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Omit<GoatInsert, 'herd_id'> }): Promise<Goat> => {
      if (id) {
        return unwrap(await supabase.from('goats').update(values).eq('id', id).select().single())
      }
      return unwrap(
        await supabase
          .from('goats')
          .insert({ ...values, herd_id: herdId.value })
          .select()
          .single(),
      )
    },
    onSuccess: () => refresh(goatKeys.goats(herdId.value)),
  })

  const deleteGoat = useMutation({
    mutationFn: async (goat: Goat) => {
      const files = unwrap(await supabase.storage.from(BUCKET).list(`${goat.herd_id}/${goat.id}`))
      if (files.length) {
        unwrap(await supabase.storage.from(BUCKET).remove(files.map((f) => `${goat.herd_id}/${goat.id}/${f.name}`)))
      }
      unwrap(await supabase.from('goats').delete().eq('id', goat.id))
    },
    onSuccess: () =>
      Promise.all([
        refresh(goatKeys.goats(herdId.value)),
        refresh(goatKeys.appraisals(herdId.value)),
        refresh(goatKeys.photos(herdId.value)),
      ]),
  })

  const saveAppraisal = useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Omit<AppraisalInsert, 'herd_id'> }) => {
      if (id) return unwrap(await supabase.from('linear_appraisals').update(values).eq('id', id))
      return unwrap(await supabase.from('linear_appraisals').insert({ ...values, herd_id: herdId.value }))
    },
    onSuccess: () => refresh(goatKeys.appraisals(herdId.value)),
  })

  const deleteAppraisal = useMutation({
    mutationFn: async (id: string) => unwrap(await supabase.from('linear_appraisals').delete().eq('id', id)),
    onSuccess: () => refresh(goatKeys.appraisals(herdId.value)),
  })

  const uploadPhoto = useMutation({
    mutationFn: async ({ goat, file, kind, makePrimary }: { goat: Goat; file: File; kind: PhotoKind; makePrimary: boolean }) => {
      const blob = await resizeImage(file, 1600)
      const id = crypto.randomUUID()
      const path = `${goat.herd_id}/${goat.id}/${id}.jpg`
      unwrap(await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg' }))
      unwrap(
        await supabase
          .from('goat_photos')
          .insert({ id, herd_id: goat.herd_id, goat_id: goat.id, storage_path: path, kind, is_primary: makePrimary }),
      )
    },
    onSuccess: () => refresh(goatKeys.photos(herdId.value)),
  })

  const deletePhoto = useMutation({
    mutationFn: async (photo: GoatPhoto) => {
      unwrap(await supabase.storage.from(BUCKET).remove([photo.storage_path]))
      unwrap(await supabase.from('goat_photos').delete().eq('id', photo.id))
    },
    onSuccess: () => refresh(goatKeys.photos(herdId.value)),
  })

  const setPrimaryPhoto = useMutation({
    mutationFn: async (photoId: string) => unwrap(await supabase.rpc('set_primary_photo', { photo_id: photoId })),
    onSuccess: () => refresh(goatKeys.photos(herdId.value)),
  })

  return { saveGoat, deleteGoat, saveAppraisal, deleteAppraisal, uploadPhoto, deletePhoto, setPrimaryPhoto }
}
