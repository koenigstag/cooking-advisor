export type ServerBaseUrlValidation =
  | { ok: true; origin: string }
  | { ok: false; error: 'invalidUrl' | 'httpsRequired' };

// pageProtocol is passed in (rather than reading window.location directly)
// so this stays a pure, unit-testable function.
export function validateServerBaseUrl(
  value: string,
  pageProtocol: string
): ServerBaseUrlValidation {
  const trimmed = value.trim();
  if (!trimmed) {
    // An empty value disables server sync entirely.
    return { ok: true, origin: '' };
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, error: 'invalidUrl' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, error: 'invalidUrl' };
  }
  if (pageProtocol === 'https:' && parsed.protocol !== 'https:') {
    return { ok: false, error: 'httpsRequired' };
  }
  return { ok: true, origin: parsed.origin };
}
