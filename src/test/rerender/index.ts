import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { ForgoRef } from "../../index.js";
import { run } from "./script.js";

export default function() {
  it("rerenders", async () => {
    const dom = new JSDOM(htmlFile(), {
      runScripts: "outside-only",
      resources: "usable",
    });
    const window = dom.window;

    run(dom);

    const button = await new Promise<ForgoRef<HTMLButtonElement>>((resolve) => {
      window.addEventListener("load", () => {
        resolve(window.myButton);
      });
    });

    (button as any).value.click();
    (button as any).value.click();
    (button as any).value.click();

    window.document.body.innerHTML.should.containEql("Clicked 3 times");
  });
}
