import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import should from "should";
import { runArrays, runNestedArrays } from "./script.js";

export default function() {
  describe("renders arrays as DOM node children", () => {
    const tests: [string, (dom: JSDOM) => void][] = [
      ["array", runArrays],
      ["nested array", runNestedArrays],
    ];

    tests.forEach(([testName, run]) => {
      it(testName, async () => {
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

        innerHtml.should.containEql(
          "<div>Hello world<p>1</p><p>2</p><p>3</p><p>4</p></div>"
        );
      });
    });
  });
}
