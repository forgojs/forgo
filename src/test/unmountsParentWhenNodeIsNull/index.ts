import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { hasUnmounted, renderAgain, run, renderedElement } from "./script.js";
import should from "should";

export default function () {
  it("does not unmount parent when render returns null", async () => {
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
    should.equal(hasUnmounted, false);
    should.equal(renderedElement.nodeType, 8);

    renderAgain();
    should.equal(hasUnmounted, false);
    should.equal(renderedElement.nodeType, 1);
  });
}
