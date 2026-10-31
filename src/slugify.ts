// Artist and title become the light show folder name, the .fseq name,
// and the .wav name. Tesla expects those names to match.
export function slugify(value: string): string {
  const withoutAccents = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

  const slug = withoutAccents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (slug.length === 0) {
    return "untitled";
  }

  return slug;
}
