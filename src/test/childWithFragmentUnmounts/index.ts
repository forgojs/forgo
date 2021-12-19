import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { numUnmounts, renderAgain, run } from "./script.js";
import should from "should";

export default function () {
  it("runs unmount on child returning a fragment", async () => {
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

    should.equal(numUnmounts, 1);
  });
}
