import { describe, expect, it } from 'vitest'
import { splitAppraisal } from './appraisalText'

describe('splitAppraisal', () => {
  it('takes the score out of a doe\'s titles', () => {
    expect(splitAppraisal('5*M (pending) VVEV 88')).toEqual({
      titles: '5*M (pending)',
      appraisal: { general_appearance: 'V', dairy_strength: 'V', body_capacity: 'E', mammary_system: 'V', final_score: 88, age: null },
    })
  })

  it('reads a buck\'s three-letter score', () => {
    expect(splitAppraisal('*B VGV 85')).toEqual({
      titles: '*B',
      appraisal: { general_appearance: 'V', dairy_strength: 'G', body_capacity: 'V', mammary_system: null, final_score: 85, age: null },
    })
  })

  it('keeps the age at appraisal and drops it from the titles', () => {
    expect(splitAppraisal('GGVG 82 (@ 2 yo)')).toMatchObject({ titles: null, appraisal: { final_score: 82, age: '@ 2 yo' } })
    expect(splitAppraisal('GGGA 80 (@ < 2 yo)')?.appraisal?.age).toBe('@ < 2 yo')
  })

  it('reads "+" as Good Plus and scores written without a space', () => {
    expect(splitAppraisal('3*M +EEE 89')).toMatchObject({ titles: '3*M', appraisal: { general_appearance: 'G', dairy_strength: 'E', final_score: 89 } })
    expect(splitAppraisal('4*M VEEV90')).toMatchObject({ titles: '4*M', appraisal: { final_score: 90 } })
  })

  it('handles titles after the score, and titles with no score', () => {
    expect(splitAppraisal('VGEG 84 5*M')).toMatchObject({ titles: '5*M', appraisal: { final_score: 84 } })
    expect(splitAppraisal('6*M VEEE 90 ELITE')).toMatchObject({ titles: '6*M ELITE', appraisal: { final_score: 90 } })
    expect(splitAppraisal('+*B *S **Elite Sire** 2015/16')).toEqual({ titles: '+*B *S **Elite Sire** 2015/16', appraisal: null })
    expect(splitAppraisal(null)).toEqual({ titles: null, appraisal: null })
  })
})
