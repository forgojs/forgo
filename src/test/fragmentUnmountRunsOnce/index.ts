import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { renderAgain, run, unmountCounter } from "./script.js";
import should from "should";

export default function () {
  describe("fragment unmount", () => {
    it("runs fragment unmount only once", async () => {
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

      should.equal(unmountCounter, 0);
    });
  });
}
