import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { run } from "./script.js";

export default function () {
  describe("css", () => {
    it("applies css styles", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;

      run(dom);

      const innerHtml = await new Promise<string>((resolve) => {
        window.addEventListener("load", () => {
          resolve(window.document.body.innerHTML);
        });
      });

      innerHtml.should.containEql(
        `<ul><li style="background-color: green; padding: 10px;">One</li><li style="background-color: green; padding: 10px;">Two</li></ul>`
      );
    });
  });
}
