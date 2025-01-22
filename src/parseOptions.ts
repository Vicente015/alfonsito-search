import { Option } from "./types";

function parseOptions(htmlString: string): Set<Option> {
  const formFields = new Set<Option>();
  const regex = /<input type="hidden" name="([^"]+)" value="([^"]*)">/gim;

  let match;
  while ((match = regex.exec(htmlString)) !== null) {
    const name = match[1].trim();
    const value = match[2].trim();

    formFields.add({ name, value });
  }

  return formFields;
}

export default parseOptions
