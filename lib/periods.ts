export const PERIODS = [7, 30, 90] as const
export type Period = (typeof PERIODS)[number]

export function parsePeriod(value: string | undefined): Period {
  const n = Number(value)
  return (PERIODS as readonly number[]).includes(n) ? (n as Period) : 30
}
