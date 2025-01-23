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
      "Accept": "*",
      "Accept-Language": "en-US,en",
      "Content-Type": "application/x-www-form-urlencoded",
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
  const t0 = performance.now()
  let parameters: Record<string, string>
  console.debug(request.headers)
  if (request.headers.get('content-type')?.includes('form')) {
    const formData = await request.formData();
    console.debug('formData', formData)
    parameters = Object.fromEntries(formData.entries())
  } else {
    const url = new URL(request.url);
    parameters = Object.fromEntries(url.searchParams.entries())
  }
  const query = parameters.q
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
        --flexoki-link: #24837B;
        --flexoki-link-hover: #3AA99F;

        --flexoki-bg:      #FFFCF0;
        --flexoki-bg-2:    #F2F0E5;
        --flexoki-ui:      #E6E4D9;
        --flexoki-ui-2:    #DAD8CE;
        --flexoki-ui-3:    #CECDC3;
        --flexoki-tx-3:    #B7B5AC;
        --flexoki-tx-2:    #6F6E69;
        --flexoki-tx:      #100F0F;

        --flexoki-red:     #AF3029;
        --flexoki-orange:  #BC5215;
        --flexoki-yellow:  #AD8301;
        --flexoki-green:   #66800B;
        --flexoki-cyan:    #24837B;
        --flexoki-blue:    #205EA6;
        --flexoki-purple:  #5E409D;
        --flexoki-magenta: #A02F6F;
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
        background-color: var(--flexoki-bg);
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
            color: var(--flexoki-purple);
          }
        }

        & div {
          margin-left: 1.7rem;
        }
        & p {
          margin: 0;
          color: var(--flexoki-tx);
          font-size: 1rem;
        }

        & .result-index {
          margin-right: 1rem;
          font-variant-numeric: tabular-nums;
        }

        & .result-url {
          color: var(--flexoki-orange);
        }
      }

      .mono {
        font-family: "Berkeley Mono", monospace;
      }

      .search-bar {
        display: flex;
        justify-items: center;
        gap: 7px;
        border-radius: 1.5rem;
        background-color: var(--flexoki-bg-2);
        padding: .5rem 1rem;

        & svg {
          width: 1.2rem;
        }

        & input {
          border: none;
          padding: none;
          margin: 0;
          width: 100%;
          background-color: transparent;
          outline: none;
        }
      }

      .time {
        font-size: .9rem;
      }
    </style>
</head>
<body>
<main>
<section>
<form action="/" method="post">
<div class="search-bar">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
<input class='query' type="search" name="q" value="${query}" >
</div>
<span class="time">took <span class="mono">${Math.floor(performance.now() - t0)}</span>ms</span>
</form>
</section>
<section id="search-results">
${result.results.map((result, index) => `
  <article>
  <h2><span class="result-index mono">${index + 1}</span><a rel="nofollow" href="${result.url}" target="_blank">${result.title}</a></h2>
  <div>
  <p>${result.description}</p>
  <p class="result-url">${new URL(result.url).hostname}</p>
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
/*
Bun.serve(
  {
    port: 3000,
    // hostname: "0.0.0.0",
    fetch: main,
  },
);
 */

export default {
  async fetch(request: Request) {
    return await main(request)
  }
}
