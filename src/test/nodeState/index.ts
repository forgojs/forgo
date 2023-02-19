import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import should from "should";
import { ForgoRef } from "../../index.js";
import { run } from "./script.js";

export default function () {
  describe("component state", () => {
    it("attaches state correctly", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;

      run(dom);

      await new Promise<ForgoRef<HTMLElement>>((resolve) => {
        window.addEventListener("load", () => {
          resolve(window.myInput);
        });
      });

      const greetingDiv = window.greetingDiv.value;
      should.exist(greetingDiv.__forgo);
      should.equal(greetingDiv.__forgo.components.length, 2);
      should.equal(greetingDiv.__forgo.key, "mydiv");
      should.equal(
        greetingDiv.__forgo.components[0].component.__internal.element
          .componentIndex,
        0
      );
      should.equal(
        greetingDiv.__forgo.components[1].component.__internal.element
          .componentIndex,
        1
      );
    });
  });
}
