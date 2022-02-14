import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { renderAgain, run } from "./script.js";
import should from "should";
import { getForgoState, NodeAttachedState } from "../../index.js";

export default function () {
  /**
   * If a keyed component reterns a Fragment, the states of all children of the
   * fragment should be preserved upon rerender.
   */
  it("keyed Fragments preserve all children", async () => {
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

    const getStates = (targets: "swappable" | "fixed-position") => {
      const els = Array.from(
        window.document.getElementsByClassName("stateful-grandchild")
      );

      const targetEls =
        targets === "swappable"
          ? els.filter((el) => {
              const attr = el.getAttribute("data-key");
              return attr === "first-child" || attr === "second-child";
            })
          : [els[els.length - 1]];

      const found = targetEls.map((el) => el.getAttribute("data-state"));
      // Sanity check, because the tests pass against an empty array
      // TODO: search by key, not class
      if (found.length === 0) {
        throw new Error("Should have found elements");
      }
      return found;
    };

    // Capture the original states
    const grandchildrenStatePass1 = getStates("swappable");
    console.log(window.document.documentElement.outerHTML);
    console.log(grandchildrenStatePass1);

    renderAgain();

    const grandchildrenStatePass2 = getStates("swappable");
    console.log(window.document.documentElement.outerHTML);

    should.deepEqual(
      grandchildrenStatePass2.reverse(),
      grandchildrenStatePass1,
      "Grandchildren states should be exactly reversed from the first render"
    );

    renderAgain();

    const grandchildrenStatePass3 = getStates("swappable");

    should.deepEqual(
      grandchildrenStatePass3,
      grandchildrenStatePass1,
      "Grandchildren states should be identical to the first render"
    );
  });
}
