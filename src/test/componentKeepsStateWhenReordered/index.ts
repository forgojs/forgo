import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { run } from "./script.js";
import { componentStates, reorderComponents } from "./script.js";

export default function () {
  describe("component state while reordering", () => {
    it("components maintain state when reordered", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });

      const window = dom.window;

      run(dom);

      const componentStatesFirstRender = await new Promise<
        Map<unknown, string>
      >((resolve) => {
        window.addEventListener("load", () => {
          resolve(new Map(Array.from(componentStates)));
        });
      });

      reorderComponents();

      // We explicitly test with a falsey value (zero) to catch if we use the
      // shorthand `if (key)` rather than the required `if (key !== undefined)`
      [0, "1", "2", "3", "4", "5"].forEach((key) => {
        componentStates
          .get(key)!
          .should.equal(
            componentStatesFirstRender.get(key),
            `component with key=${key} state is mismatched`
          );
      });
    });
  });
}
