import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile";
import { run } from "./script";
import * as should from "should";

export default function componentUnmount() {
  it("runs unmount when fragment is replaced with a node", async () => {
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

    window.renderAgain();

    should.equal(window.parent1Unmounted, true);
    should.equal(window.parent2Unmounted, true);
    should.equal(window.childUnmounted, true);
  });
}
