function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer)).map((value) => value.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(left: string, right: string) {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);
  if (leftBytes.length !== rightBytes.length) return false;
  let difference = 0;
  for (let index = 0; index < leftBytes.length; index += 1) difference |= leftBytes[index] ^ rightBytes[index];
  return difference === 0;
}

export async function verifyCloudinarySignature(request: Request, body: Uint8Array, secret: string) {
  const signature = request.headers.get('x-cld-signature') ?? '';
  const timestamp = request.headers.get('x-cld-timestamp') ?? '';
  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds) || Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds) > 3600) {
    return false;
  }
  const content = new Uint8Array(body.byteLength + new TextEncoder().encode(`${timestamp}${secret}`).byteLength);
  content.set(body);
  content.set(new TextEncoder().encode(`${timestamp}${secret}`), body.byteLength);
  const digest = await crypto.subtle.digest('SHA-1', content);
  return timingSafeEqual(toHex(digest), signature);
}
