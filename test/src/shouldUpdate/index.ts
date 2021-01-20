import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile";
import { ForgoRef } from "../../../";
import { run } from "./script";
import "should";

export default function shouldUpdate() {
  it("skips render if shouldUpdate() returns false", async () => {
    const dom = new JSDOM(htmlFile(), {
      runScripts: "outside-only",
      resources: "usable",
    });
    const window = dom.window;

    run(dom);

    const button = await new Promise<ForgoRef<HTMLButtonElement>>((resolve) => {
      window.addEventListener("load", () => {
        (window as any).renderAgain();
        (window as any).renderAgain();
        (window as any).renderAgain();
        resolve(window.myButton);
      });
    });

    window.document.body.innerHTML.should.containEql("Counter is 1");
  });
}
