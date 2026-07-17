const messages = {
  'rateLimit.adminOperation': 'Too many administrative actions. Try again later.',
  'rateLimit.announcementInteraction': 'Too many announcement interactions. Try again later.',
  'rateLimit.avatarUpdate': 'Avatar updates are too frequent. Try again later.',
  'rateLimit.backgroundProcessing': 'Background processing is being requested too frequently. Try again later.',
  'rateLimit.commentCreate': 'Comment limit reached. Try again later.',
  'rateLimit.facilityAffected': 'Facility actions are too frequent. Try again later.',
  'rateLimit.facilityCreate': 'Today’s facility report limit has been reached.',
  'rateLimit.facilityStatus': 'Facility status updates are too frequent. Try again later.',
  'rateLimit.healthcheck': 'Service checks are too frequent. Try again later.',
  'rateLimit.imageRead': 'Image requests are too frequent. Try again later.',
  'rateLimit.imageSync': 'Image synchronization is too frequent. Try again later.',
  'rateLimit.imageUploadDaily': 'Today’s image upload quota has been used.',
  'rateLimit.imageWrite': 'Image actions are too frequent. Try again later.',
  'rateLimit.issueCreate': 'Daily proposal limit reached. Try again tomorrow.',
  'rateLimit.loginSync': 'Sign-in synchronization is too frequent. Try again later.',
  'rateLimit.operation': 'Too many actions. Try again later.',
  'rateLimit.pushToken': 'Notification device settings are being changed too frequently. Try again later.',
  'rateLimit.read': 'Too many requests. Try again later.',
  'rateLimit.support': 'Support actions are too frequent. Try again later.',
} as const;

export default messages;
