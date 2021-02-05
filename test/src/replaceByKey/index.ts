import { DOMWindow, JSDOM } from "jsdom";
import htmlFile from "../htmlFile";
import * as should from "should";
import { runObjectKey, runStringKey } from "./script";

export default function() {
  describe("replacement by key", () => {
    const tests: [string, (dom: JSDOM) => void][] = [
      ["string key", runStringKey],
      ["object key", runObjectKey],
    ];
    tests.forEach(([testName, run]) => {
      it(`replaces a child by ${testName}`, async () => {
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

        window.document.body.innerHTML.should.containEql("Hello 2X");
        should.deepEqual(window.unmountedElements, ["1", "3"]);
      });
    });
  });
}
