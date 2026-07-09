import { getSupabaseClient } from '@/lib/supabase';
import { withRequestTimeout } from '@/lib/request';
import { auth } from '@/lib/firebase';
import { readSupabaseFunctionError } from '@/services/supabase-function-error';
import type { BackendActionName } from '@/services/backend-action-contract';

interface BackendActionSuccessEnvelope<TResponse> {
  data: TResponse;
  requestId: string;
  success: true;
}

interface BackendActionErrorEnvelope {
  error?: {
    code?: string;
    message?: string;
  };
  requestId?: string;
  success: false;
}

type BackendActionEnvelope<TResponse> =
  | BackendActionSuccessEnvelope<TResponse>
  | BackendActionErrorEnvelope;

function formatEnvelopeError(envelope: BackendActionErrorEnvelope) {
  const message = envelope.error?.message?.trim() || '服務暫時無法處理請求，請稍後再試。';
  const requestId = envelope.requestId?.trim();
  return requestId ? `${message} 錯誤追蹤碼：${requestId}` : message;
}

export function invokeBackendAction<TRequest = Record<string, unknown>, TResponse = unknown>(
  name: BackendActionName,
  options: { signal?: AbortSignal; timeoutMs?: number } = {},
) {
  const client = getSupabaseClient();

  return (payload: TRequest): Promise<TResponse> => withRequestTimeout(
    async () => {
      const token = await auth?.currentUser?.getIdToken();
      if (!token) {
        throw new Error('請先登入後再操作。');
      }

      const result = await client.functions.invoke<BackendActionEnvelope<TResponse>>('backendAction', {
        body: { action: name, payload },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (result.error) {
        throw new Error(await readSupabaseFunctionError(result));
      }
      if (result.data === null) {
        throw new Error('服務沒有回傳資料。');
      }
      if (result.data.success !== true) {
        throw new Error(formatEnvelopeError(result.data));
      }
      return result.data.data;
    },
    { label: name, signal: options.signal, timeoutMs: options.timeoutMs },
  );
}
