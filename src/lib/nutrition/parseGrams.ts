export function parseGrams(value: string | null | undefined): number {
  if (!value) return 0
  const match = value.match(/[\d.]+/)
  return match ? parseFloat(match[0]) : 0
}
