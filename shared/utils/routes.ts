import kebabcase from "lodash.kebabcase";
import slugify from "slugify";

export function slugifyStr(value: string): string {
  return Array.from(value).some(character => character.charCodeAt(0) > 127) ? kebabcase(value) : slugify(value, { lower: true });
}

export function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
