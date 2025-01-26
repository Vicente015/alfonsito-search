import parseLocales from "./parseLocales";
import parseOptions from "./parseOptions";
import parseRegex from "./parseRegex";

type Parameters = Partial<{
  s: string
  nextParams: string
  v: string
  o: "json"
  dc: string
  api: "d.js"
  vqd: string
  kl: string
  df: string
}> & {
  q: string
}

const queryDuckDuckGo = async (parameters: Parameters, request: Request) => {
  const searchParams = new URLSearchParams(parameters)

  console.time("fetch");
  const response = await fetch(`https://lite.duckduckgo.com/lite/`, {
    method: "POST",
    body: searchParams.toString(),
    redirect: "manual",
    headers: {
      ...request.headers,
      "host": "lite.duckduckgo.com",
      "origin": "https://lite.duckduckgo.com",
      "referer": "https://lite.duckduckgo.com/",
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  console.timeEnd("fetch");

  if ([301, 302, 303].includes(response.status)) {
    const redirectUrl = response.headers.get("Location")
    return { redirect: redirectUrl }
  }

  const text = await response.text()
  const results = parseRegex(text);
  const localeOptions = parseLocales(text)
  const options = parseOptions(text)

  return { results, localeOptions, options: [...options] };
};

const main = async (request: Request) => {
  const t0 = performance.now()
  let parameters: Parameters
  if (request.headers.get('content-type')?.includes('form')) {
    const formData = await request.formData();
    parameters = Object.fromEntries(formData.entries()) as unknown as Parameters
  } else {
    const url = new URL(request.url);
    parameters = Object.fromEntries(url.searchParams.entries()) as unknown as Parameters
  }
  const query = parameters.q
  if (!query) return new Response("No query searchParams", { status: 400 })

  const result = await queryDuckDuckGo(parameters, request);

  if (result.redirect) {
    return Response.redirect(result.redirect)
  }
  if (!result.results) return new Response("No results", { status: 501 });

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

        --flexoki-bg: #FFFCF0;
        --flexoki-bg-2: #F2F0E5;
        --flexoki-ui: #E6E4D9;
        --flexoki-ui-2: #DAD8CE;
        --flexoki-ui-3: #CECDC3;
        --flexoki-tx-3: #B7B5AC;
        --flexoki-tx-2: #6F6E69;
        --flexoki-tx: #100F0F;

        --flexoki-red: #AF3029;
        --flexoki-orange: #BC5215;
        --flexoki-yellow: #AD8301;
        --flexoki-green: #66800B;
        --flexoki-cyan: #24837B;
        --flexoki-blue: #205EA6;
        --flexoki-purple: #5E409D;
        --flexoki-magenta: #A02F6F;
      }

      html {
        box-sizing: border-box;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
        font-family: Inter, 'Adwaita Sans', Roboto, 'Helvetica Neue', Arial, Nimbus Sans, system-ui, sans-serif;
        font-feature-settings: "ss01", "ss02", "ss03", "case", "tnum";
        font-size: .9rem;
      }

      p,
      h2 {
        line-height: calc(1ex / 0.32);
      }

      body {
        max-width: 80ch;
        margin: 0 auto;
        background-color: var(--flexoki-bg);
      }

      main {
        padding: 1rem;
      }

      article {
        margin-bottom: 1.2rem;

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
          color: black;
          margin-right: 1rem;
          font-variant-numeric: tabular-nums;
        }

        & .result-url {
          color: var(--flexoki-orange);
        }
      }


      .mono {
        font-family: 'Berkeley Mono', 'Fira Code', 'JetBrains Mono', ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
      }

      .timestamp {
        color: var(--flexoki-red);
      }

      b {
        font-weight: 600;
      }

      .search-bar {
        display: flex;
        justify-items: center;
        gap: 7px;
        border-radius: 1.5rem;
        border: 1px solid var(--flexoki-ui);
        background-color: var(--flexoki-bg-2);
        padding: .5rem 1.2rem;

        & button {
          margin: 0;
          padding: 0;
          outline: none;
          border: 0;
          background: transparent;
        }

        & svg {
          color: var(--flexoki-tx);
          width: 1.2rem;
        }

        & input {
          border: none;
          padding: none;
          margin: 0;
          width: 100%;
          color: var(--flexoki-tx);
          background-color: transparent;
          outline: none;
          font-size: 1rem;
        }

        &:hover {
          border-color: var(--flexoki-ui-2);
        }

        &:focus-within {
          border-color: var(--flexoki-ui-3);
        }
      }

      .time {
        font-size: .9rem;
        color: var(--flexoki-tx-2);
      }

      select {
        border: 0;
        margin: 0;
        padding: 0;
        outline: none;
        border-radius: .5rem;
        padding: .4rem;
        color: var(--flexoki-tx);
        background-color: var(--flexoki-bg-2);
        border: 1px solid var(--flexoki-ui);
      }

      .search-footer {
        margin-top: .4rem;
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-bottom: 1.4rem;

        & .search-selects {
          margin-left: auto;
          & select {
            &:hover {
              border-color: var(--flexoki-ui-2);
            }

            &:focus-within {
              border-color: var(--flexoki-ui-3);
            }
          }
        }
      }
    </style>
</head>
<body>
<main>
<section>
  <form action="/" method="post">
    <div class="search-bar">
      <input class='query' type="search" name="q" value="${query}">
      <button type="submit">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="lucide lucide-search">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>
    </div>
    <div class="search-footer">
      <span class="time">took <span class="mono">${Math.floor(performance.now() - t0)}</span>ms</span>
      <div class="search-selects">
        <select class="submit" name="kl">
        ${result.localeOptions.locales.map((option) => `<option value="${option.value}" ${parameters.kl === option.value ? "selected='true'" : " "}>${option.name}</option>`).join('')}
        </select>
        <select name="df">
        ${result.localeOptions.times.map((option) => `<option value="${option.value}" ${parameters.df === option.value ? "selected='true'" : " "}>${option.name}</option>`).join('')}
        </select>
      </div>
    </div>
  </form>
</section>
<section id="search-results">
${result.results.map((result, index) => `
  <article>
  <h2><span class="result-index mono">${index + 1}</span><a rel="nofollow" href="${result.url}" target="_blank">${result.title}</a></h2>
  <div>
  <p>${result.date ? `<span class="timestamp">${new Date(result.date).toISOString().split('T')[0]}</span> — ` : ''}${result.description}</p>
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

export default {
  async fetch(request: Request) {
    return await main(request)
  }
}
