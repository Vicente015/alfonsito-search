import parseLocales from "./parseLocales";
import parseOptions from "./parseOptions";
import parseRegex from "./parseRegex";

const queryDuckDuckGo = async (query: string) => {
  console.time("fetch");
  const response = await fetch(`https://lite.duckduckgo.com/lite/`, {
    method: "POST",
    body: `q=${query}`,
    headers: {
      "User-Agent": "",
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

  const text = await response.text()
  console.time("parse");
  const results = parseRegex(text);
  console.timeEnd("parse");
  console.time("parse2");
  const localeOptions = parseLocales(text)
  console.timeEnd("parse2");
  console.time("parse3");
  const options = parseOptions(text)
  console.timeEnd("parse3");

  return { results, localeOptions, options: [...options] };
};

const main = async (request: Request) => {
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
  <title>Alfonsito Search</title>
  <style>
      :root {
        --flexoki-black: #100F0F;
        --flexoki-paper: #FFFCF0;

        --flexoki-bg-main: #100F0F;
        --flexoki-bg-alt: #1C1B1A;
        --flexoki-border-base: #282726;
        --flexoki-border-hover: #343331;
        --flexoki-border-active: #403E3C;

        --flexoki-text-faint: #B7B5AC;
        --flexoki-text-muted: #6F6E69;
        --flexoki-text-primary: #100F0F;

        --flexoki-text-error: #D14D41;
        --flexoki-text-warning: #DA702C;
        --flexoki-text-success: #879A39;

        --flexoki-link: #24837B;
        --flexoki-link-hover: #3AA99F;
        --flexoki-link-active: #205EA6;
      }
      html {
        box-sizing: border-box;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
        font-family: "Inter", system-ui;
        font-size: .9rem;
      }

      p,h2 {
        line-height: calc(1ex / 0.32);
      }

      body {
        background-color: var(--flexoki-paper);
      }

      main {
        max-width: 80ch;
        margin: auto;
      }

      article {
        margin-top: 1rem;

        & h2 {
          margin: 0;
          font-size: 1.2rem;
          text-wrap: pretty;
          font-weight: 700;
        }

        & a {
          color: var(--flexoki-link);
          text-decoration: none;
          &:hover {
            color: var(--flexoki-link-hover);
          }
          &:visited {
            color: var(--flexoki-link-active);
          }
        }

        & div {
          margin-left: 1.7rem;
        }
        & p {
          margin: 0;
          color: var(--flexoki-text-primary);
          font-size: 1rem;
        }

        & .result-index {
          margin-right: 1rem;
          font-family: "Berkeley Mono", monospace;
          font-variant-numeric: tabular-nums;
        }

        & .result-url {
          margin-top: .8rem;
          color: #BC5215;
        }
      }

      h2 {

      }
    </style>
</head>
<body>
<main>
<section id="search-results">
${result.results.map((result, index) => `
  <article>
  <h2><span class="result-index">${index + 1}</span><a href="${result.url}" target="_blank">${result.title}</a></h2>
  <div>
  <p>${result.description}</p>
  <span class="result-url">${new URL(result.url).hostname}</span>
  </div>
  </article>`
  ).join('')}
</section>
</main>
</body>
</html>
`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=UTF-8",
    },
  });
};

Bun.serve(
  {
    port: 3000,
    // hostname: "0.0.0.0",
    fetch: main,
  },
);
