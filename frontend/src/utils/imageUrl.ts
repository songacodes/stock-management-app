/**
 * Constructs the full URL for an image
 * @param imageUrl - The image URL (can be relative like /uploads/tile-xxx.jpg or full URL)
 * @returns The full URL to the image
 */
export const getImageUrl = (imageUrl: string | undefined | null): string => {
  if (!imageUrl) return '';

  // If it's already a full URL, return it
  // If it's already a full URL, return it
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Clean up the path: replace backslashes (Windows) with forward slashes
  const cleanPath = imageUrl.replace(/\\/g, '/');

  // Get base URL (remove /api suffix if present)
  let baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  baseUrl = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;

  // Ensure the URL starts with / if it doesn't already
  const path = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  return `${baseUrl}${path}`;
};

