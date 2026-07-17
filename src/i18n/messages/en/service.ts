const messages = {
  'service.errorTrackingCode': '{message} Error tracking code: {requestId}',
  'service.httpUnavailable': 'The service is temporarily unable to process the request ({status}).',
  'service.supabaseAuthFailed': 'Supabase Login initialization failed ({status}).',
} as const;

export default messages;
