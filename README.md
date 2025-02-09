## *alfonsito*

*Alfonsito[^1]* is a minimal, fast, javascript-free web search page.
Based on [DuckDuckGo Lite](https://lite.duckduckgo.com/lite).

![Alfonsito fish](.github/alfonsito.jpg)

### Public instance
There is a public instance hosted in Cloudflare workers, but it's often being blocked from DuckDuckGo.

[Public Instance](https://alfonsito.vicente015.workers.dev/)

### Self-host
Runs on port 3000

Docker:
```shell
docker run -p 3000:3000 --restart=unless-stopped ghcr.io/vicente015/alfonsito:latest
```

Docker compose:

```yaml
name: alfonsito-search
services:
    alfonsito:
        container_name: alfonsito
        ports:
            - 3000:3000
        restart: unless-stopped
        image: ghcr.io/vicente015/alfonsito:latest
```

### Roadmap

- [X] Fast search result parse
- [X] Format, normalize, strip titles and descriptions
- [X] Search bar, filters, language
- [X] Minimal good-looking styles
- [X] Research accesilibity and font disambiguation options specially in url
- [X] Homepage
- [X] Bundle, minify output
- [X] Docker image
- [ ] Pagination
- [ ] Header with ASCII fish? and description
- [ ] No results page

[^1]: Name of a [Canarian fish](https://www3.gobiernodecanarias.org/medusa/mediateca/ecoescuela/?attachment_id=7054)
