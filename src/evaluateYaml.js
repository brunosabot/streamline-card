import { parse } from "yaml";

export default function evaluateYaml(yamlString) {
  return parse(yamlString);
}
