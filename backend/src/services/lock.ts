let running = false;

export async function withLock<T>(fn: () => Promise<T>): Promise<T | null> {
  if (running) return null;
  running = true;
  try {
    return await fn();
  } finally {
    running = false;
  }
}