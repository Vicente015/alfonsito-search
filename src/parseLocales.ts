import { Option } from "./types";

function parseLocales(htmlString: string) {
    const options: Option[] = [];
    const regex = /<option value="([^"]*)"\s*>([^<]*)<\/option>/g;

    let match;
    while ((match = regex.exec(htmlString)) !== null) {
        const value = match[1].trim();
        const name = match[2].trim();

        options.push({ value, name });
    }

    return options;
}
export default parseLocales
