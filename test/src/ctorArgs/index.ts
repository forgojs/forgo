import { JSDOM, ResourceLoader } from "jsdom";
import htmlFile from "../htmlFile";
import * as should from "should";
import { run } from "./script";

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

    should.equal(window.passedArgs, true);
  });
}
