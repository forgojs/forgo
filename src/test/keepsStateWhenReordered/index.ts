import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { run } from "./script.js";
import { getComponentState, reorderComponents } from "./script.js";

export default function () {
  it("maintains state with reordered", async () => {
    const dom = new JSDOM(htmlFile(), {
      runScripts: "outside-only",
      resources: "usable",
    });

    const window = dom.window;

    run(dom);

    const savedState = await new Promise<Record<string, string>>((resolve) => {
      window.addEventListener("load", () => {
        resolve(getComponentState());
      });
    });

    reorderComponents();
    const newState = getComponentState();

    newState["1"].should.equal(
      savedState["1"],
      "component 1 state is mismatched"
    );
    newState["2"].should.equal(
      savedState["2"],
      "component 2 state is mismatched"
    );
    newState["3"].should.equal(
      savedState["3"],
      "component 3 state is mismatched"
    );
    newState["4"].should.equal(
      savedState["4"],
      "component 4 state is mismatched"
    );
    newState["5"].should.equal(
      savedState["5"],
      "component 5 state is mismatched"
    );
  });
}
