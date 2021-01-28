import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile";
import { ForgoRef } from "../../../dist";
import { run, runSharedNode } from "./script";
import * as should from "should";

export default function rerender() {
  describe("rerenders child", () => {
    it("rerenders child on child node", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;

      run(dom);

      await new Promise<ForgoRef<HTMLButtonElement>>((resolve) => {
        window.addEventListener("load", () => {
          resolve(window.myButton);
        });
      });

      window.document.body.innerHTML.should.containEql("Parent counter is 1");
      window.document.body.innerHTML.should.containEql("Child counter is 1");
      window.renderAgain();
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

      await new Promise<ForgoRef<HTMLButtonElement>>((resolve) => {
        window.addEventListener("load", () => {
          resolve(window.myButton);
        });
      });

      should.equal(window.parentCounter, 1);
      window.document.body.innerHTML.should.containEql("Child counter is 1");
      window.renderAgain();
      should.equal(window.parentCounter, 1);
      window.document.body.innerHTML.should.containEql("Child counter is 2");
    });
  });
}
