import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import should from "should";
import { run } from "./script.js";

export default function () {
  it("Simple server side rendering", async () => {
    const dom = new JSDOM(htmlFile("<div><p>Hello1</p><p>World1</p></div>"), {
      runScripts: "outside-only",
      resources: "usable",
    });
    const window = dom.window;

    run(dom);

    const innerHtml = await new Promise<string>((resolve) => {
      window.addEventListener("load", () => {
        resolve(window.document.body.innerHTML);
      });
    });

    innerHtml.should.not.containEql("World1");
    innerHtml.should.containEql("World2");
  });
}
