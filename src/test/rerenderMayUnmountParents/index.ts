import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { childUnmounted, parent1Unmounted, parent2Unmounted, renderAgain, run } from "./script.js";
import should from "should";

export default function () {
  it("rerender may unmount parents", async () => {
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

    should.equal(parent1Unmounted, true);
    should.equal(parent2Unmounted, true);
    should.equal(childUnmounted, true);
  });
}
