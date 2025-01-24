// https://duckduckgo.com/bangs 

interface BangContext {
    userLanguage: string
    userAgent: string
}

export const BANGS: Record<string, (query: string, context: BangContext) => string> = {
    "!g": (query, { userLanguage }) => {
        const lang = userLanguage.split("-")[0]
        return `https://www.google.com/search?hl=${lang}&gl=${lang.toUpperCase()}&q=${encodeURIComponent(query)}`
    },
    "!w": (query, { userLanguage }) => {
        const lang = userLanguage.startsWith("es") ? "es" : "en"
        return `https://${lang}.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`
    },
    "!yt": (query, { userLanguage }) => {
        return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=${userLanguage}`
    },
}

export const processBang = (query: string, context: BangContext): string | undefined => {
    const [bang, ...restQuery] = query.trim().split(" ")
    const searchQuery = restQuery.join(" ").trim()

    const bangHandler = BANGS[bang?.toLowerCase()]
    if (!bangHandler || !searchQuery) return undefined

    return bangHandler(searchQuery, context)
}

export default processBang