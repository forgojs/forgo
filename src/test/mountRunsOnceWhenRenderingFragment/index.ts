import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { mountCounter, renderAgain, run } from "./script.js";
import should from "should";

export default function () {
  describe("runs mount only once when rendering fragment", () => {
    it("runs mount only once when rendering fragment", async () => {
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

      should.equal(mountCounter, 1);
    });
  });
}
