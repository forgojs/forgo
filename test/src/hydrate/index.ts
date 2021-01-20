import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile";
import { ForgoRef } from "../../../";
import { run } from "./script";

export default function hydrates() {
  it("hydrates", async () => {
    const dom = new JSDOM(htmlFile(`
      <div>
        <button>
          Click me!
        </button>
        <p>Clicked 0 times</p>
      </div>
    `), {
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
