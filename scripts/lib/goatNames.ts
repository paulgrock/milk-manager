// Goat names as pedigrees and the farm website write them, with titles and
// appraisal scores around the name: "GCH Diji Farm JRB Typhoon *B VGV 85".
// Shared by the Sanity import and sync scripts.

const PREFIX_TITLES = new Set(['SGCH', 'GCH', 'ARMCH', 'MCH', 'CH', 'SG'])
/** A word that starts the titles/scores after a name: *B, 5*M, VEEV, VEEV90, (pending), ELITE… */
const isTitleWord = (w: string) => /\*|^\(|^[EVGAFP+]{3,4}\d*$|^ELITE$/i.test(w) && !/^[A-Z][a-z]/.test(w)

export function splitName(raw: string) {
  const words = raw
    .replace(/ /g, ' ')
    .replace(/[’‘]/g, "'")
    .replace(/^[\s:]+/, '')
    .trim()
    .split(/\s+/)
  const prefix: string[] = []
  while (words.length > 1 && PREFIX_TITLES.has(words[0]!)) prefix.push(words.shift()!)
  const cut = words.findIndex((w, i) => i > 0 && isTitleWord(w))
  const name = (cut < 0 ? words : words.slice(0, cut)).join(' ')
  // "VEEV90" and "VEEV 90" are the same score.
  const suffix =
    cut < 0
      ? ''
      : words
          .slice(cut)
          .join(' ')
          .replace(/\b([EVGAFP+]{3,4})(\d{2})\b/g, '$1 $2')
          .replace(/\s+/g, ' ')
  return { name, prefix: prefix.join(' ') || null, suffix: suffix || null }
}

/** Matching key: lower case, no sire initials (JRB, AH…), plain apostrophes and spaces. */
export function nameKey(name: string) {
  return splitName(name)
    .name.split(' ')
    .filter((w, i) => i === 0 || !/^[A-Z0-9]{2,3}$/.test(w))
    .join(' ')
    .toLowerCase()
}
