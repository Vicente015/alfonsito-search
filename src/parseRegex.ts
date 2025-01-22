import { Result } from "./types";

function parseRegex(htmlString: string) {
  const results: Result[] = [];
  const html = htmlString.replace(/\s\s+/g, " ");
  const regex =
    /<tr>\s*<td[^>]*>\d+\.&nbsp;<\/td>\s*<td>\s*<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>\s*<\/td>\s*<\/tr>\s*<tr>\s*<td[^>]*>[^<]*<\/td>\s*<td[^>]*class='result-snippet'[^>]*>(.*?)<\/td>\s*<\/tr>\s*<tr>\s*<td[^>]*>[^<]*<\/td>\s*<td[^>]*>\s*<span[^>]*>([^<]+)<\/span>\s*<\/td>\s*<\/tr>/gim;

  let match;
  while ((match = regex.exec(html)) !== null) {
    //console.debug(match);
    const url = match[1].trim();
    const title = match[2].trim();
    const description = match[3].trim();

    results.push({ title, description, url });
  }

  return results;
}
export default parseRegex
