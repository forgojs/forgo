import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile";
import { run } from "./script";
import * as should from "should";

export default function componentMount() {
  it("runs mount() when a component is attached to node", async () => {
    // const scriptPath = join(__dirname, "script.js");

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
