import { JSDOM } from "jsdom";
import { join } from "path";
import htmlFile from "../htmlFile";
import loadScript from "../loadScript";
import should from "should";
import { ForgoRef } from "../../../dist";

export default function () {
  it("rerenders", async () => {
    const scriptPath = join(__dirname, "script.js");
    const dom = new JSDOM(htmlFile(), {
      runScripts: "dangerously",
      resources: "usable",
    });
    const window = dom.window;
    loadScript(dom, scriptPath);

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
