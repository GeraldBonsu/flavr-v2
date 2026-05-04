export async function trackEvent(
  name: string,
  properties?: Record<string, unknown>
): Promise<void> {
  try {
    // Fire and forget — never block the UI
    void fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_name: name, properties }),
    })
  } catch {
    // Analytics should never throw
  }
}
