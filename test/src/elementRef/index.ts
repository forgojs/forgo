import { JSDOM } from "jsdom";
import { join } from "path";
import htmlFile from "../htmlFile";
import loadScript from "../loadScript";
import should from "should";
import { ForgoRef } from "../../../dist";

export default function () {
  it("attaches element refs", async () => {
    const scriptPath = join(__dirname, "script.js");
    const dom = new JSDOM(htmlFile(), {
      runScripts: "dangerously",
      resources: "usable",
    });
    const window = dom.window;
    loadScript(dom, scriptPath);

    const element = await new Promise<ForgoRef<HTMLElement>>((resolve) => {
      window.addEventListener("load", () => {
        resolve(window.myInput);
      });
    });

    (element as any).value.tagName.should.equal("INPUT");
  });
}
