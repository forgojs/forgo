import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile";
import { run } from "./script";
import * as should from "should";

export default function() {
  it("runs unmount() when a component goes away", async () => {
    const dom = new JSDOM(htmlFile(), {
      runScripts: "outside-only",
      resources: "usable",
    });
    const window = dom.window;

    run(dom);

    await new Promise<void>((resolve) => {
      window.addEventListener("load", () => {
        (window as any).renderAgain();
        resolve();
      });
    });

    should.equal((window as any).hasUnmounted, true);
  });
}
