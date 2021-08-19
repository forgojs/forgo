import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { ForgoRef } from "../../index.js";
import { run } from "./script.js";
import should from "should";

export default function() {
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
