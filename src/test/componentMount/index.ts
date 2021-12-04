import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { run } from "./script.js";
import should from "should";

export default function () {
  it("runs mount() when a component is attached to node", async () => {
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

    should.equal((window as any).mountedOn.id, "hello");
  });
}
