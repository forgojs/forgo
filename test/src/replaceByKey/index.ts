import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile";
import * as should from "should";
import { run } from "./script";

export default function replaceByKey() {
  it("replaces a child by key", async () => {
    const dom = new JSDOM(htmlFile(), {
      runScripts: "outside-only",
      resources: "usable",
    });
    const window = dom.window;

    run(dom);

    await new Promise<void>((resolve) => {
      window.addEventListener("load", () => {
        (window as any).renderAgain();
        resolve();
      });
    });

    window.document.body.innerHTML.should.containEql("Hello 20");
    should.deepEqual(window.unmountedElements, ["1", "3"]);
  });
}
