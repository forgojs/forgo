import { readFileSync } from "fs";
import { JSDOM } from "jsdom";

export default function loadScript(dom: JSDOM, scriptPath: string) {
  const window = dom.window;
  const js = readFileSync(scriptPath, { encoding: "utf-8" }).toString();
  const scriptTag = window.document.createElement("script");
  scriptTag.textContent = js;
  window.document.head.appendChild(scriptTag);
}
