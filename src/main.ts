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
      ...Object.fromEntries(request.headers.entries()),
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

const searchPage = async (request: Request, parameters: Parameters) => {
  const t0 = performance.now()
  const query = parameters.q

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
  <link rel="stylesheet" href="main.css">
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
  <h2><span class="result-index mono">${index + 1}</span><a rel="nofollow" href="${result.url}">${result.title}</a></h2>
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

const homePage =
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alfonsito Search</title>
  <link rel="stylesheet" href="main.css">
</head>
<body>
<main>
<section class="home">
  <form action="/" method="post">
    <h1>Search something in Alfonsito!</h1>
    <div class="search-bar">
      <input class='query' type="search" name="q">
      <button type="submit">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="lucide lucide-search">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>
    </div>
  </form>
</section>
</main>
</body>
</html>`

Bun.serve({
  port: 3000,
  static: {
    "/main.css": new Response(await Bun.file("./dist/main.css").bytes(), {
      headers: {
        "Content-Type": "text/css",
      },
    }),
  },

  async fetch(request: Request) {
    let parameters: Parameters
    if (request.headers.get('content-type')?.includes('form')) {
      const formData = await request.formData();
      parameters = Object.fromEntries(formData.entries()) as unknown as Parameters
    } else {
      const url = new URL(request.url);
      parameters = Object.fromEntries(url.searchParams.entries()) as unknown as Parameters
    }
    if (!parameters.q) {
      return new Response(homePage, {
        headers: {
          "content-type": "text/html; charset=UTF-8",
        }
      })
    }

    return searchPage(request, parameters)
  }
})
