const messages = {
  'service.errorTrackingCode': '{message} 錯誤追蹤碼：{requestId}',
  'service.httpUnavailable': '服務暫時無法處理請求（{status}）。',
  'service.supabaseAuthFailed': 'Supabase 登入初始化失敗（{status}）。',
} as const;

export default messages;
