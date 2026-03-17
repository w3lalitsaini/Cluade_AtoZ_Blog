import slugify from "slugify";

export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
}

export function generateUniqueSlug(text: string): string {
  const base = generateSlug(text);
  const timestamp = Date.now().toString(36);
  return `${base}-${timestamp}`;
}
