const messages = {
  'image.decodeFailed': '無法載入圖片；{details}',
  'image.empty': '圖片檔案是空的；{details}',
  'image.invalidType': '請選擇有效的圖片檔案；{details}',
  'image.outputTooLarge': '圖片壓縮後仍超過 {kilobytes} KB，請改用較小的圖片。',
  'image.sourceTooLarge': '原始圖片不能超過 {megabytes} MB；{details}',
  'image.webpEncodeFailed': 'WebP 編碼失敗；nativeType={type}',
  'image.webpInvalid': '瀏覽器未產生有效的 WebP；type={type}, size={size}',
  'image.unableToReadImageDimensions': '無法讀取圖片尺寸。',
  'image.theImageUploadIsNotCompletelyCompleted': '圖片上傳工作未完整完成。',
  'image.enlargeImageImageAltFallbackalt': '`放大圖片：${image.alt || fallbackAlt}`',
  'image.imagesMustBeConvertedToWebpBeforeUploading': '圖片必須轉換為 WebP 後才能上傳。',
  'image.thisBrowserCannotHandleImages': '此瀏覽器無法處理圖片。',
  'image.uploadVerificationTimeout': '圖片上傳驗證已逾時，請重新選擇圖片後再試。',
  'image.unsupportedFormat': '圖片格式不受支援，請重新選擇圖片。',
  'image.theImageUploadJobIsNotSetUpCompletely': '圖片上傳工作建立不完整。',
  'image.imageSizeExceedsUploadLimit': '圖片大小超過上傳限制。',
  'image.imageProcessingFailedPleaseTryAgainLater': '圖片處理失敗，請稍後再試。',
  'image.resultImageForTitle': '{title} 的處理結果圖片',
  'image.imgCanvasTheBrowserCannotOutputTheImage': '[IMG-CANVAS] 瀏覽器無法輸出圖片。',
} as const;

export default messages;
