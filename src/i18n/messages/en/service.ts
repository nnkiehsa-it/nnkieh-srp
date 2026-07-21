const messages = {
  'service.errorTrackingCode': '{message} Error tracking code: {requestId}',
  'service.httpUnavailable': 'The service is temporarily unable to process the request ({status}).',
  'service.supabaseAuthFailed': 'Sign-in could not be started ({status}).',
} as const;

export default messages;
