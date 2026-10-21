import type { BreedingStatus } from './breeding'

/** Badge colors per status. Status always shows its label too, never color alone. */
export const STATUS_COLOR: Record<BreedingStatus, 'primary' | 'success' | 'warning' | 'neutral'> = {
  bred: 'primary',
  confirmed: 'success',
  open: 'neutral',
  kidded: 'neutral',
  overdue: 'warning',
}
