import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { parentArgs, renderAgain, run } from "./script.js";
import should from "should";
import { getForgoState, NodeAttachedState } from "../../index.js";

export default function () {
  it("rerender may change root node on parents", async () => {
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

    const oldId: string = (parentArgs as any).element.node.id;
    should.equal(oldId, "node1");

    renderAgain();

    const newId: string = (parentArgs as any).element.node.id;
    should.equal(newId, "node2");
  });
}
