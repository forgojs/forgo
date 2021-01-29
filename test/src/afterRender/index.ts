import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile";
import { run, runWithTextNode } from "./script";
import * as should from "should";

export default function componentMount() {
  describe("runs afterRender()", () => {
    it("when mounted on a DOM element", async () => {
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

      should.equal((window as any).previousNode, undefined);
      should.equal((window as any).componentCounter, 10);
      (window as any).renderAgain();
      should.equal((window as any).previousNode.nodeType, 1);
      should.equal((window as any).componentCounter, 20);
      (window as any).renderAgain();
      should.equal((window as any).previousNode.nodeType, 1);
      should.equal((window as any).componentCounter, 30);
    });

    it("when mounted on a text node", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;

      runWithTextNode(dom);

      await new Promise<void>((resolve) => {
        window.addEventListener("load", () => {
          resolve();
        });
      });

      should.equal((window as any).previousNode, undefined);
      should.equal((window as any).componentCounter, 10);
      (window as any).renderAgain();
      should.equal((window as any).previousNode.nodeType, 3);
      should.equal((window as any).componentCounter, 20);
      (window as any).renderAgain();
      should.equal((window as any).previousNode.nodeType, 3);
      should.equal((window as any).componentCounter, 30);
    });
  });
}
