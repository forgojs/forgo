import { JSDOM, ResourceLoader } from "jsdom";
import htmlFile from "../htmlFile.js";
import should from "should";
import { argsPassed, run } from "./script.js";

export default function () {
  it("passes env in ctor args", async () => {
    const dom = new JSDOM(htmlFile(), {
      runScripts: "outside-only",
      resources: "usable",
    });
    const window = dom.window;

    run(dom);

    await new Promise<string>((resolve) => {
      window.addEventListener("load", () => {
        resolve(window.document.body.innerHTML);
      });
    });

    should.equal(argsPassed, true);
  });
}
