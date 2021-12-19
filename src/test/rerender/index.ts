import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { buttonRef, run } from "./script.js";

export default function () {
  it("rerenders", async () => {
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

    (buttonRef.value as HTMLButtonElement).click();
    (buttonRef.value as HTMLButtonElement).click();
    (buttonRef.value as HTMLButtonElement).click();

    window.document.body.innerHTML.should.containEql("Clicked 3 times");
  });
}
