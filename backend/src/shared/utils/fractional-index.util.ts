const BASE_POSITION = 1024;

export function calculatePosition(
  before?: number | null,
  after?: number | null,
): number {
  if (before != null && after != null) {
    return (before + after) / 2;
  }

  if (before != null) {
    return before + 1;
  }

  if (after != null) {
    return after - 1;
  }

  return BASE_POSITION;
}
