import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import should from "should";
import { inputRef, run } from "./script.js";

export default function () {
  describe("element refs", () => {
    it("attaches element refs", async () => {
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

      should.equal((inputRef.value as HTMLInputElement).tagName, "INPUT");
    });
  });
}
