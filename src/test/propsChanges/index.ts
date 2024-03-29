import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { mutatedProps, renderAgain, run } from "./script.js";
import should from "should";

export default function () {
  describe("props changes", () => {
    it("doesn't set props if they haven't changed", async () => {
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

      should.equal(mutatedProps["id"], undefined);
      should.equal(mutatedProps["x-id"], undefined);
      should.equal(mutatedProps["prop"], undefined);
      renderAgain();
      // We have to give the event loop a chance to run, because our test will
      // run synchronously before the MutationObserver fires and records any
      // changes
      await new Promise((resolve) => queueMicrotask(() => resolve(null)));
      should.equal(
        mutatedProps["id"],
        undefined,
        "id prop should not have been mutated"
      );
      should.equal(
        mutatedProps["x-id"],
        undefined,
        "x-id attribute should not have been mutated"
      );
      // This is a canary. If this fails, it means our MutationObserver wasn't
      // set up correctly, and we can't trust the prior assertions.
      should.equal(
        mutatedProps["prop"],
        true,
        "MutationObserver was not set up correctly"
      );
    });
  });
}
