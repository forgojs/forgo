import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { ForgoRef } from "../../index.js";
import { renderAgain, run } from "./script.js";
import should from "should";

export default function () {
  it("skips render if shouldUpdate() returns false", async () => {
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

    renderAgain();
    renderAgain();
    renderAgain();
    
    window.document.body.innerHTML.should.containEql("Counter is 1");
  });
}
