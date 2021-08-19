import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { run } from "./script.js";
import should from "should";

export default function () {
  it("does not unmount when fragment is overwritten", async () => {
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

    window.renderAgain();
    window.renderAgain();

    should.equal(window.unmountCounter, 0);
    window.document.body.innerHTML.should.containEql(
      "<p>5</p><p>6</p><p>7</p>"
    );
  });
}
