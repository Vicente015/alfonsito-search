import { Result } from "./types";

function parseRegex(htmlString: string) {
  const results: Result[] = [];
  const html = htmlString.replace(/\s\s+/g, " ");
  const regex =
    /<tr>\s*<td valign="top">(\d+)\.&nbsp;<\/td>\s*<td>\s*<a rel="nofollow" href="([^"]+)" class='result-link'>([^<]+)<\/a>\s*<\/td>\s*<\/tr>\s*<tr>\s*<td>&nbsp;&nbsp;&nbsp;<\/td>\s*<td class='result-snippet'>(.*?)<\/td>\s*<\/tr>\s*<tr>\s*<td>&nbsp;&nbsp;&nbsp;<\/td>\s*<td>\s*<span class='link-text'>([^<]+)<\/span>\s*(?:&nbsp;&nbsp;&nbsp;<span class='timestamp'>([^<]*))?\s*<\/td>\s*<\/tr>/gim

  let match: string[] | null;
  while ((match = regex.exec(html)) !== null) {
    const url = match[2].trim();
    const title = match[3].trim();
    const description = match[4].trim();
    const date = match[6] ? match[6].trim() : undefined

    results.push({ title, description, url, date });
  }

  return results;
}
export default parseRegex
