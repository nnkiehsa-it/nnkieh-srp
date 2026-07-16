const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/u, '');

export function hasApiGatewayConfig() {
  return Boolean(apiBaseUrl);
}

export function apiGatewayUrl(path: string) {
  if (!apiBaseUrl) throw new Error('API Gateway 設定尚未完成。');
  return `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
