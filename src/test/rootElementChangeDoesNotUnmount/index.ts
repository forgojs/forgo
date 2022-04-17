import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { unmountCount, renderCount, renderAgain, run } from "./script.js";
import "should";

export default function () {
  it("root element change does not unmount", async () => {
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

    // Five times.
    renderAgain();
    renderAgain();
    renderAgain();
    renderAgain();
    renderAgain();

    renderCount.should.equal(6);
    unmountCount.should.equal(0);
  });
}
