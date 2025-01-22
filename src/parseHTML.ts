import { DomHandler, DomUtils, parseDocument, Parser } from "htmlparser2";
import clean from "./clean";
import { Option, Result } from "./types";
// import serializer from "dom-serializer";

const { getText, getElementsByTagName, getAttributeValue } = DomUtils;

function parseHTML(html: string): {
  searchResults: Result[];
  formEntries: Option[];
  dateFilterOptions: Option[];
  regionOptions: Option[];
} {
  const results: Result[] = [];
  const formEntriesSet: Set<string> = new Set();
  const dateFilterOptionsSet: Set<string> = new Set();
  const regionOptionsSet: Set<string> = new Set();

  const handler = new DomHandler((error, dom) => {
    if (error) {
      throw new Error("Error parsing HTML");
    }
    console.time("table");
    // Extract search results
    const table = getElementsByTagName("table", dom).at(2);
    if (!table) return false;
    const rows = getElementsByTagName("tr", table).filter(
      (row) => row.children && row.children.length > 0,
    );

    for (let i = 0; i < rows.length; i += 4) {
      if (!rows[i] || !rows[i + 1] || !rows[i + 2]) continue;

      // Clean the specific rows before accessing their elements
      const cleanedFirstRow = clean(rows[i]);
      const cleanedSecondRow = clean(rows[i + 1]);
      const cleanedThirdRow = clean(rows[i + 2]);

      const titleElement = cleanedFirstRow.children?.[1]?.children?.[0];
      const descriptionElement = cleanedSecondRow.children?.[1];
      const linkElement = cleanedThirdRow.children?.[1]?.children?.[0];

      if (
        titleElement?.attribs?.class === "result-link" &&
        descriptionElement?.attribs?.class === "result-snippet" &&
        linkElement?.attribs?.class === "link-text"
      ) {
        results.push({
          title: getText(titleElement),
          description: getText(descriptionElement),
          url: getText(linkElement),
        });
      }
    }

    // Extract form entries
    const inputs = getElementsByTagName("input", dom);
    inputs.forEach((input) => {
      const inputName = getAttributeValue(input, "name");
      const inputValue = getAttributeValue(input, "value");
      if (inputName && inputValue) {
        formEntriesSet.add(JSON.stringify({ inputName, inputValue }));
      }
    });

    // Extract date filter options
    const dateSelect = getElementsByTagName("select", dom).find(
      (elem) => elem.attribs.name === "df",
    );
    if (dateSelect) {
      const options = getElementsByTagName("option", dateSelect);
      options.forEach((option) => {
        const value = getAttributeValue(option, "value") || "";
        const text = getText(option);
        dateFilterOptionsSet.add(JSON.stringify({ value, text }));
      });
    }

    // Extract region options
    const regionSelect = getElementsByTagName("select", dom).find(
      (elem) => elem.attribs.name === "kl",
    );
    if (regionSelect) {
      const options = getElementsByTagName("option", regionSelect);
      options.forEach((option) => {
        const value = getAttributeValue(option, "value") || "";
        const text = getText(option);
        regionOptionsSet.add(JSON.stringify({ value, text }));
      });
    }
    console.timeEnd("table");
  });

  const parser = new Parser(handler);
  parser.write(html);
  parser.end();

  const formEntries = Array.from(formEntriesSet).map((str) => JSON.parse(str));
  const dateFilterOptions = Array.from(dateFilterOptionsSet).map((str) =>
    JSON.parse(str)
  );
  const regionOptions = Array.from(regionOptionsSet).map((str) =>
    JSON.parse(str)
  );

  return {
    searchResults: results,
    formEntries,
    dateFilterOptions,
    regionOptions,
  };
}
export default parseHTML
