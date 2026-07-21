const messages = {
  'rateLimit.adminOperation': 'Too many administrative actions. Please try again later.',
  'rateLimit.announcementInteraction': 'Too many announcement interactions. Please try again later.',
  'rateLimit.avatarUpdate': 'Avatar updates are too frequent. Please try again later.',
  'rateLimit.backgroundProcessing': 'Background processing is being requested too frequently. Please try again later.',
  'rateLimit.commentCreate': 'Comment limit reached. Please try again later.',
  'rateLimit.facilityAffected': 'Facility actions are too frequent. Please try again later.',
  'rateLimit.facilityCreate': 'Today’s facility report limit has been reached.',
  'rateLimit.facilityStatus': 'Facility status updates are too frequent. Please try again later.',
  'rateLimit.healthcheck': 'Service checks are too frequent. Please try again later.',
  'rateLimit.imageRead': 'Image requests are too frequent. Please try again later.',
  'rateLimit.imageSync': 'Image synchronization is too frequent. Please try again later.',
  'rateLimit.imageUploadDaily': 'Today’s image upload quota has been used.',
  'rateLimit.imageWrite': 'Image actions are too frequent. Please try again later.',
  'rateLimit.issueCreate': 'Daily proposal limit reached. Please try again tomorrow.',
  'rateLimit.loginSync': 'Sign-in synchronization is too frequent. Please try again later.',
  'rateLimit.operation': 'Too many actions. Please try again later.',
  'rateLimit.pushToken': 'Notification device settings are being changed too frequently. Please try again later.',
  'rateLimit.read': 'Too many requests. Please try again later.',
  'rateLimit.support': 'Support actions are too frequent. Please try again later.',
} as const;

export default messages;
