const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/u, '');

export function hasApiGatewayConfig() {
  return Boolean(apiBaseUrl);
}

export function apiGatewayUrl(path: string) {
  if (!apiBaseUrl) throw new Error('text.215f3cc291aa');
  return `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
