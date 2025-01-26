import { Option } from "./types";

function parseLocales(htmlString: string) {
    const options: Option[] = [];
    const regex = /<option value="([^"]*)"\s*(selected)?>([^<]*)<\/option>/g;

    let match;
    while ((match = regex.exec(htmlString)) !== null) {
        const value = match[1].trim();
        const name = match[3].trim();

        options.push({ value, name });
    }

    return { locales: options.slice(0, -5), times: options.slice(-5, options.length) };
}
export default parseLocales
