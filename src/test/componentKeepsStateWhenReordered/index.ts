import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { run } from "./script.js";
import { getComponentState, reorderComponents } from "./script.js";

export default function () {
  it("component maintains state with reordered", async () => {
    const dom = new JSDOM(htmlFile(), {
      runScripts: "outside-only",
      resources: "usable",
    });

    const window = dom.window;

    run(dom);

    const savedState = await new Promise<Map<unknown, string>>((resolve) => {
      window.addEventListener("load", () => {
        resolve(getComponentState());
      });
    });

    reorderComponents();
    const newState = getComponentState();

    // We explicitly test with a falsey value (zero) to catch if we use the
    // shorthand `if (key)` rather than the required `if (key !== undefined)`
    [0, "1", "2", "3", "4", "5"].forEach((key) => {
      newState
        .get(key)!
        .should.equal(
          savedState.get(key),
          `component with key=${key} state is mismatched`
        );
    });
  });
}
