import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import should from "should";
import { componentError, run } from "./script.js";

export default function () {
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

    (componentError as Error).message.should.equal(
      "BasicComponent component constructor must return an instance of the Component class"
    );
  });
}
