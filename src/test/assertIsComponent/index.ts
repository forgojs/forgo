import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import should from "should";
import { run } from "./script.js";

export default function() {
  it("asserts if ctor returns a component", async () => {
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

    (window.componentError as Error).message.should.equal(
      "BasicComponent component constructor must return an object having a render() function."
    );
  });
}
