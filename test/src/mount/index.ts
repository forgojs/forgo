import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile";
import "should";
import { run } from "./script";

export default function () {
  it("mounts a component", async () => {
    const dom = new JSDOM(htmlFile(), {
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

    innerHtml.should.containEql("Hello world");
  });
}
