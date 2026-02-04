/**
 * CDN Configuration Constants
 */

export const CDN_CONFIG = {
  PRODUCT_IMAGE_BASE_URL:
    'https://cdn2.cellphones.com.vn/insecure/rs:fill:300:300/q:90/plain/https://cellphones.com.vn/media/catalog/product',

  /**
   * Generate full CDN URL for product image
   * @param imagePath - Relative path to the product image (e.g., '/i/iphone-14-pro.jpg')
   * @returns Full CDN URL
   */
  getProductImageUrl: (imagePath?: string): string | undefined => {
    if (!imagePath) return undefined;

    // If the path already includes the full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Ensure path starts with /
    const normalizedPath = imagePath.startsWith('/')
      ? imagePath
      : `/${imagePath}`;

    return `${CDN_CONFIG.PRODUCT_IMAGE_BASE_URL}${normalizedPath}`;
  },
};
