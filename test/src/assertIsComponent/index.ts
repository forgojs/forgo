import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile";
import "should";
import { run } from "./script";

export default function mount() {
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
