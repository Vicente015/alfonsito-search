import { DomHandler, DomUtils, Parser } from "htmlparser2";

const { getText, getElementsByTagName, getAttributeValue } = DomUtils;

interface SearchResult {
  title: string;
  description: string;
  link: string;
}

interface FormEntry {
  inputName: string;
  inputValue: string;
}

interface Option {
  value: string;
  text: string;
}

// Function to remove comments and empty nodes within a specific subtree
function clean(node: any): any {
  if (Array.isArray(node)) {
    return node.map(clean).filter(Boolean);
  }

  if (node.type === "comment") {
    return null;
  }

  if (node.type === "text" && /^\s*$/.test(node.data)) {
    return null;
  }

  if (node.children) {
    node.children = node.children.map(clean).filter(Boolean);
  }

  return node;
}

function parseHTML(html: string): {
  searchResults: SearchResult[];
  formEntries: FormEntry[];
  dateFilterOptions: Option[];
  regionOptions: Option[];
} {
  const results: SearchResult[] = [];
  const formEntriesSet: Set<string> = new Set();
  const dateFilterOptionsSet: Set<string> = new Set();
  const regionOptionsSet: Set<string> = new Set();

  const handler = new DomHandler((error, dom) => {
    if (error) {
      throw new Error("Error parsing HTML");
    }
    const cleanDom = dom;

    // Extract search results
    const table = getElementsByTagName("table", cleanDom).at(2);
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
          link: getText(linkElement),
        });
      }
    }

    // Extract form entries
    const inputs = getElementsByTagName("input", cleanDom);
    inputs.forEach((input) => {
      const inputName = getAttributeValue(input, "name");
      const inputValue = getAttributeValue(input, "value");
      if (inputName && inputValue) {
        formEntriesSet.add(JSON.stringify({ inputName, inputValue }));
      }
    });

    // Extract date filter options
    const dateSelect = getElementsByTagName("select", cleanDom).find(
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
    const regionSelect = getElementsByTagName("select", cleanDom).find(
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

const queryDuckDuckGo = async (query: string) => {
  console.time("fetch");
  const response = await fetch(`https://lite.duckduckgo.com/lite/`, {
    method: "POST",
    body: `q=${query}`,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64; rv:134.0) Gecko/20100101 Firefox/134.0",
      "Accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Content-Type": "application/x-www-form-urlencoded",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-User": "?1",
      "Priority": "u=0, i",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache",
    },
  });
  console.timeEnd("fetch");

  console.time("parse");
  const doc = parseHTML(await response.text());
  console.timeEnd("parse");

  return doc;
};

const main: Deno.ServeHandler<Deno.NetAddr> = async (request) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  if (!query) return new Response("No query searchParams", { status: 400 });
  const result = await queryDuckDuckGo(query);
  if (!result) return new Response("No results", { status: 501 });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
      html {
        box-sizing: border-box;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
        font-family: serif;
      }

      * {
        line-height: calc(1ex / 0.32);
      }

      table {
        max-width: 80ch;
        margin: auto;
      }
    </style>
</head>
<body>
${JSON.stringify(result, null, 2)}
</body>
</html>
`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=UTF-8",
    },
  });
};

Deno.serve(
  {
    port: 3000,
    // hostname: "0.0.0.0",
  },
  main,
);
