import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import should from "should";
import { remounted, renderAgain, run, runQuerySelector } from "./script.js";

export default function () {
  describe("mounts a component", () => {
    it("mounts on an DOM element", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;

      run(dom);

      const innerHtml = await new Promise<string>((resolve) => {
        window.addEventListener("load", () => {
          resolve(window.document.body.innerHTML);
        });
      });

      renderAgain();

      should(remounted).equal(true);
    });
  });
}
