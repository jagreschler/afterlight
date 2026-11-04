export function frameAt(
  seconds: number,
  startSeconds: number,
  frameMs: number,
  frameCount: number,
): number {
  const step = frameMs / 1000;
  if (!Number.isFinite(seconds) || !Number.isFinite(startSeconds) || !(step > 0) || frameCount < 1) {
    return 0;
  }

  const elapsedMs = Math.round((seconds - startSeconds) * 1000);
  const index = Math.floor(elapsedMs / frameMs);
  if (index < 0) {
    return 0;
  }
  const last = frameCount - 1;
  if (index > last) {
    return last;
  }
  return index;
}
