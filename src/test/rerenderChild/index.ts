import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { parentCounter, renderAgain, run, runSharedNode } from "./script.js";
import should from "should";

export default function () {
  describe("rerenders child", () => {
    it("rerenders child on child node", async () => {
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

      window.document.body.innerHTML.should.containEql("Parent counter is 1");
      window.document.body.innerHTML.should.containEql("Child counter is 1");
      renderAgain();
      window.document.body.innerHTML.should.containEql("Parent counter is 1");
      window.document.body.innerHTML.should.containEql("Child counter is 2");
    });

    it("rerenders child sharing parent node", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;

      runSharedNode(dom);

      await new Promise<void>((resolve) => {
        window.addEventListener("load", () => {
          resolve();
        });
      });

      should.equal(parentCounter, 1);
      window.document.body.innerHTML.should.containEql("Child counter is 1");
      renderAgain();
      should.equal(parentCounter, 1);
      window.document.body.innerHTML.should.containEql("Child counter is 2");
    });
  });
}
