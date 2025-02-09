## *alfonsito* <img src="https://github.com/user-attachments/assets/38b8b3a9-b1bd-48e7-aba9-abe417eb99c3" height="20px"></img> 

*Alfonsito[^1]* is a minimal, fast, javascript-free web search page.
Based on [DuckDuckGo Lite](https://lite.duckduckgo.com/lite).
Needs [Inter font](https://rsms.me/inter/) installed on your system to look good, it doesn't load external fonts to keep it fast.

<img src="https://github.com/user-attachments/assets/8b664e94-25a0-4c79-90bb-769d2eb2182a" height="500px"></img>

### Public instance
There is a public instance, but it's often being blocked from DuckDuckGo.

[Public Instance](https://alfonsito.vicente015.dev/)

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

## Roadmap

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
