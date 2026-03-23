/**
 * Generate a URL-friendly slug from a string
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

/**
 * Generate a unique slug by appending a number if needed
 */
export const generateUniqueSlug = async (
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};
