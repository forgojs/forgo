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

    const getStates = () =>
      Array.from(
        window.document.getElementsByClassName("stateful-grandchild")
      ).map((el) => el.getAttribute("data-state"));

    // Capture the original states
    const grandchildrenStatePass1 = getStates();

    renderAgain();

    const grandchildrenStatePass2 = getStates();

    should.deepEqual(
      grandchildrenStatePass2.reverse(),
      grandchildrenStatePass1,
      "Grandchildren states should be exactly reversed from the first render"
    );

    renderAgain();

    const grandchildrenStatePass3 = getStates();

    should.deepEqual(
      grandchildrenStatePass3,
      grandchildrenStatePass1,
      "Grandchildren states should be identical to the first render"
    );
  });
}
