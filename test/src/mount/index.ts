import { JSDOM } from "jsdom";
import { join } from "path";
import htmlFile from "../htmlFile";
import loadScript from "../loadScript";
import "should";

export default function () {
  it("mounts a component", async () => {
    const scriptPath = join(__dirname, "script.js");
    const dom = new JSDOM(htmlFile(), {
      runScripts: "dangerously",
      resources: "usable",
    });
    const window = dom.window;
    loadScript(dom, scriptPath);

    const innerHtml = await new Promise<string>((resolve) => {
      window.addEventListener("load", () => {
        resolve(window.document.body.innerHTML);
      });
    });

    innerHtml.should.containEql("Hello world");
  });
}
