import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { run, runNested } from "./script.js";
import should from "should";

export default function () {
  describe("renders component returning fragments", () => {
    it("top level fragment", async () => {
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

      const rootElem = window.document.getElementById("root") as HTMLElement;
      rootElem.innerHTML.should.containEql(
        "<div>1</div><div>2</div><div>3</div>"
      );
    });

    it("nested fragment", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;

      runNested(dom);

      await new Promise<void>((resolve) => {
        window.addEventListener("load", () => {
          resolve();
        });
      });

      const rootElem = window.document.getElementById("root") as HTMLElement;
      rootElem.innerHTML.should.containEql(
        "<div>1</div><div>2</div><div>3</div><div>4</div>"
      );
    });
  });
}
