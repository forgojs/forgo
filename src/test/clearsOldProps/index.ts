import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import should from "should";
import { renderAgain, run } from "./script.js";

export default function () {
  it("clears old props", async () => {
    const dom = new JSDOM(htmlFile(), {
      runScripts: "outside-only",
      resources: "usable",
    });
    const window = dom.window;

    run(dom);

    await new Promise<string>((resolve) => {
      window.addEventListener("load", () => {
        renderAgain();
        resolve(window.document.body.innerHTML);
      });
    });

    const elem = window.document.getElementById("mydiv");
    should.not.exist((elem as Element).getAttribute("prop1"));
    should.equal((elem as Element).getAttribute("prop2"), "world");
  });
}
