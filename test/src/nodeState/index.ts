import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile";
import * as should from "should";
import { ForgoRef } from "../../../";
import { run } from "./script";

export default function nodeState() {
  it("attaches state correctly", async () => {
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

    const greetingDiv = window.greetingDiv.value;
    should.exist(greetingDiv.__forgo);
    should.equal(greetingDiv.__forgo.components.length, 2);
    should.equal(greetingDiv.__forgo.key, "mydiv");
    should.equal(greetingDiv.__forgo.components[0].args.element.componentIndex, 0);
    should.equal(greetingDiv.__forgo.components[1].args.element.componentIndex, 1);
  });
}
