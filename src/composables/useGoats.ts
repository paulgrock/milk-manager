import { computed, watch } from 'vue'
import { useOnline } from '@vueuse/core'
import { refreshQueries } from '@/lib/queryClient'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { fetchAll, supabase, unwrap } from '@/lib/supabase'
import { resizeImage } from '@/lib/images'
import { forgetPhoto, loadPhoto, photoUrl, savePhoto } from '@/lib/photoCache'
import { THUMB_SIZE, type Appraisal, type Goat, type GoatInsert, type GoatPhoto } from '@/lib/goats'
import type { Database } from '@/lib/database.types'
import { useHerd } from './useHerd'

type AppraisalInsert = Database['public']['Tables']['linear_appraisals']['Insert']
type PhotoKind = 'conformation' | 'head' | 'udder' | 'other'

const BUCKET = 'goat-photos'

export const goatKeys = {
  goats: (herdId: string) => ['goats', herdId] as const,
  appraisals: (herdId: string) => ['appraisals', herdId] as const,
  photos: (herdId: string) => ['goatPhotos', herdId] as const,
}

/** All goats, appraisals and photos for the current herd. A herd is small enough to load whole. */
export function useHerdGoats() {
  const { herdId } = useHerd()
  const enabled = computed(() => !!herdId.value)

  const goats = useQuery({
    queryKey: computed(() => goatKeys.goats(herdId.value)),
    // Paged, like every list: reference goats from pedigree imports add up past Supabase's 1,000-row limit.
    queryFn: () =>
      fetchAll<Goat>((from, to) => supabase.from('goats').select('*').eq('herd_id', herdId.value).order('id').range(from, to)),
    enabled,
  })

  const appraisals = useQuery({
    queryKey: computed(() => goatKeys.appraisals(herdId.value)),
    queryFn: () =>
      fetchAll<Appraisal>((from, to) =>
        supabase
          .from('linear_appraisals')
          .select('*')
          .eq('herd_id', herdId.value)
          .order('appraised_on', { ascending: false })
          .order('id')
          .range(from, to),
      ),
    enabled,
  })

  const photos = useQuery({
    queryKey: computed(() => goatKeys.photos(herdId.value)),
    queryFn: () =>
      fetchAll<GoatPhoto>((from, to) =>
        supabase.from('goat_photos').select('*').eq('herd_id', herdId.value).order('created_at').order('id').range(from, to),
      ),
    enabled,
  })

  const byId = computed(() => new Map((goats.data.value ?? []).map((g) => [g.id, g])))
  const bySlug = computed(() => new Map((goats.data.value ?? []).map((g) => [g.slug, g])))
  /** A goat from its page address: the slug, or the id that older links used. */
  const find = (ref: string | undefined) => (ref ? (bySlug.value.get(ref) ?? byId.value.get(ref)) : undefined)
  /** Her page, when only her id is to hand. */
  const pathOf = (id: string) => `/goats/${byId.value.get(id)?.slug ?? id}`

  return { herdId, goats, appraisals, photos, byId, find, pathOf }
}

const downloadPhoto = async (path: string) => unwrap(await supabase.storage.from(BUCKET).download(path))

/**
 * Displayable URLs for private photo files, by storage path. Photos are kept
 * on the device once seen, so they show offline (see photoCache.ts); ones not
 * saved yet load when there's signal.
 */
export function usePhotoUrls(paths: () => string[]) {
  const online = useOnline()
  const wanted = computed(() => [...new Set(paths())])
  watch([wanted, online], () => wanted.value.forEach((p) => void loadPhoto(p, downloadPhoto)), { immediate: true })
  return computed<Record<string, string>>(() => {
    const out: Record<string, string> = {}
    for (const p of wanted.value) {
      const url = photoUrl(p)
      if (url) out[p] = url
    }
    return out
  })
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
      const [blob, thumb] = await Promise.all([resizeImage(file, 1600), resizeImage(file, THUMB_SIZE, 0.8)])
      const id = crypto.randomUUID()
      const path = `${goat.herd_id}/${goat.id}/${id}.jpg`
      const thumbPath = `${goat.herd_id}/${goat.id}/${id}-thumb.jpg`
      unwrap(await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg' }))
      unwrap(await supabase.storage.from(BUCKET).upload(thumbPath, thumb, { contentType: 'image/jpeg' }))
      await Promise.all([savePhoto(path, blob), savePhoto(thumbPath, thumb)])
      unwrap(
        await supabase.from('goat_photos').insert({
          id,
          herd_id: goat.herd_id,
          goat_id: goat.id,
          storage_path: path,
          thumb_path: thumbPath,
          kind,
          is_primary: makePrimary,
        }),
      )
    },
    onSuccess: () => refresh(goatKeys.photos(herdId.value)),
  })

  const deletePhoto = useMutation({
    mutationFn: async (photo: GoatPhoto) => {
      const files = [photo.storage_path, ...(photo.thumb_path ? [photo.thumb_path] : [])]
      unwrap(await supabase.storage.from(BUCKET).remove(files))
      unwrap(await supabase.from('goat_photos').delete().eq('id', photo.id))
      await Promise.all(files.map(forgetPhoto))
    },
    onSuccess: () => refresh(goatKeys.photos(herdId.value)),
  })

  const setPrimaryPhoto = useMutation({
    mutationFn: async (photoId: string) => unwrap(await supabase.rpc('set_primary_photo', { photo_id: photoId })),
    onSuccess: () => refresh(goatKeys.photos(herdId.value)),
  })

  return { saveGoat, deleteGoat, saveAppraisal, deleteAppraisal, uploadPhoto, deletePhoto, setPrimaryPhoto }
}
