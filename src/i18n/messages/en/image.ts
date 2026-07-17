const messages = {
  'image.decodeFailed': 'Unable to load image; {details}',
  'image.empty': 'The image file is empty; {details}',
  'image.invalidType': 'Please select a valid image file; {details}',
  'image.outputTooLarge': 'The image still exceeds {kilobytes} KB after compression. Please use a smaller image instead.',
  'image.sourceTooLarge': 'The original image cannot exceed {megabytes} MB; {details}',
  'image.webpEncodeFailed': 'WebP encoding failed; nativeType={type}',
  'image.webpInvalid': 'The browser did not generate a valid WebP; type={type}, size={size}',
  'image.unableToReadImageDimensions': 'Unable to read image dimensions.',
  'image.theImageUploadIsNotCompletelyCompleted': 'The image upload is not completely completed.',
  'image.enlargeImageImageAltFallbackalt': '`Enlarge image: ${image.alt || fallbackAlt}`',
  'image.imagesMustBeConvertedToWebpBeforeUploading': 'Images must be converted to WebP before uploading.',
  'image.thisBrowserCannotHandleImages': 'This browser cannot handle images.',
  'image.uploadVerificationTimeout': 'The image upload verification has timed out, please select another image and try again.',
  'image.unsupportedFormat': 'The image format is not supported, please select another image.',
  'image.theImageUploadJobIsNotSetUpCompletely': 'The image upload job is not set up completely.',
  'image.imageSizeExceedsUploadLimit': 'Image size exceeds upload limit.',
  'image.imageProcessingFailedPleaseTryAgainLater': 'Image processing failed, please try again later.',
  'image.resultImageForTitle': 'Result image for {title}',
  'image.imgCanvasTheBrowserCannotOutputTheImage': '[IMG-CANVAS] The browser cannot output the image.',
} as const;

export default messages;
