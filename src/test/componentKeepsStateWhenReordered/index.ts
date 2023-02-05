import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { run } from "./script.js";
import { componentStates, reorderComponents } from "./script.js";

export default function () {
  it("components maintain state when reordered", async () => {
    const dom = new JSDOM(htmlFile(), {
      runScripts: "outside-only",
      resources: "usable",
    });

    const window = dom.window;

    run(dom);

    await new Promise<Map<unknown, string>>((resolve) => {
      window.addEventListener("load", () => {
        resolve(new Map(Array.from(componentStates)));
      });
    });

    reorderComponents();

    const finalOrder = ["1", "4", "3", 0, "2", "5"];

    // We explicitly test with a falsey value (zero) to catch if we use the
    // shorthand `if (key)` rather than the required `if (key !== undefined)`
    for (let i = 0; i < finalOrder.length; i++) {
      const key = finalOrder[i];
      const paraNodes = Array.from(window.document.querySelectorAll("p"));
      paraNodes[i].innerHTML.should.equal(
        `Component #${key} ${componentStates.get(key)}`
      );
    }
  });
}
