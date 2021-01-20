import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile";
import * as should from "should";
import { ForgoRef } from "../../../";
import { run } from "./script";

export default function elementRef() {
  it("attaches element refs", async () => {
    const dom = new JSDOM(htmlFile(), {
      runScripts: "outside-only",
      resources: "usable",
    });
    const window = dom.window;

    run(dom);

    const element = await new Promise<ForgoRef<HTMLElement>>((resolve) => {
      window.addEventListener("load", () => {
        resolve(window.myInput);
      });
    });

    should.equal((element as any).value.tagName, "INPUT");
  });
}
