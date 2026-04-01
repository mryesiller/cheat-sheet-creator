import slugify from "slugify";
import { nanoid } from "nanoid";

export function slugBase(title: string): string {
  return slugify(title, { lower: true, strict: true, trim: true });
}

export function generateSlug(title: string): string {
  const base = slugBase(title);
  const suffix = nanoid(8);
  return base ? `${base}-${suffix}` : suffix;
}
