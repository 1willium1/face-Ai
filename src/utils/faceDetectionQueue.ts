/**
 * Global Face Detection Request Queue
 * Limits concurrent requests to prevent backend overload.
 * Only MAX_CONCURRENT requests are processed in parallel;
 * the rest wait in a FIFO queue.
 */

const MAX_CONCURRENT = 3; // Max parallel requests to backend
let activeCount = 0;
const queue: Array<() => void> = [];

function enqueue(): Promise<void> {
  return new Promise((resolve) => {
    if (activeCount < MAX_CONCURRENT) {
      activeCount++;
      resolve();
    } else {
      queue.push(() => {
        activeCount++;
        resolve();
      });
    }
  });
}

function release(): void {
  activeCount--;
  if (queue.length > 0) {
    const next = queue.shift()!;
    next();
  }
}

/**
 * Run an async face detection function with concurrency limiting.
 * Ensures at most MAX_CONCURRENT requests hit the backend simultaneously.
 */
export async function queuedFaceDetection<T>(fn: () => Promise<T>): Promise<T> {
  await enqueue();
  try {
    return await fn();
  } finally {
    release();
  }
}

/**
 * Check how many requests are currently active (for UI display).
 */
export function getActiveRequestCount(): number {
  return activeCount;
}

/**
 * Check how many requests are queued (for UI display).
 */
export function getQueuedRequestCount(): number {
  return queue.length;
}
