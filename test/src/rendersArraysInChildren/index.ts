import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile";
import "should";
import { runArrays, runNestedArrays } from "./script";

export default function rendersArraysInChildren() {
  const tests: [string, (dom: JSDOM) => void][] = [
    ["arrays", runArrays],
    ["arrays", runNestedArrays],
  ];

  tests.forEach(([testName, run]) => {
    it(`renders ${testName} in children`, async () => {
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
}
