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
      should.equal((window as any).counterX10, 10);
      should.equal((window as any).currentNode.prop, "hello");
      should.equal((window as any).previousNode, undefined);
      (window as any).renderAgain();
      should.equal((window as any).previousNode.nodeType, 1);
      should.equal((window as any).counterX10, 20);
      should.equal((window as any).currentNode.prop, "world");
      should.equal((window as any).previousNode.prop, "hello");
      (window as any).renderAgain();
      should.equal((window as any).previousNode.nodeType, 1);
      should.equal((window as any).counterX10, 30);
      should.equal((window as any).currentNode.prop, "world");
      should.equal((window as any).previousNode.prop, "world");
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
      should.equal((window as any).counterX10, 10);
      (window as any).renderAgain();
      should.equal((window as any).previousNode.nodeType, 3);
      should.equal((window as any).counterX10, 20);
      (window as any).renderAgain();
      should.equal((window as any).previousNode.nodeType, 3);
      should.equal((window as any).counterX10, 30);
    });
  });
}
