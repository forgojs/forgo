import { DOMWindow, JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import should from "should";
import {
  renderAgain,
  runStringKey,
  runNumericKey,
  unmountedElements,
} from "./script.js";

export default function () {
  describe("replacement by key", () => {
    const tests: [string, (dom: JSDOM) => void][] = [
      ["string key", runStringKey],
      // FIXME: UNCOMMENT! ["numeric key", runNumericKey]
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
            resolve();
          });
        });

        renderAgain();

        window.document.body.innerHTML.should.containEql("Hello 2X");
        should.deepEqual(unmountedElements, ["1", "3"]);
      });
    });
  });
}
