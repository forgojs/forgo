import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { buttonRef, run } from "./script.js";

export default function () {
  describe("hydration", () => {
    it("hydrates", async () => {
      const dom = new JSDOM(
        htmlFile(`
        <div>
          <button>
            Click me!
          </button>
          <p>Clicked 0 times</p>
        </div>
      `),
        {
          runScripts: "outside-only",
          resources: "usable",
        }
      );
      const window = dom.window;

      run(dom);

      await new Promise<void>((resolve) => {
        window.addEventListener("load", () => {
          resolve();
        });
      });

      (buttonRef as any).value.click();
      (buttonRef as any).value.click();
      (buttonRef as any).value.click();

      window.document.body.innerHTML.should.containEql("Clicked 3 times");
    });
  });
}
