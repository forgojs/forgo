import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import should from "should";
import { run } from "./script.js";

export default function() {
  it("clears old props", async () => {
    const dom = new JSDOM(htmlFile(), {
      runScripts: "outside-only",
      resources: "usable",
    });
    const window = dom.window;

    run(dom);

    const innerHtml = await new Promise<string>((resolve) => {
      window.addEventListener("load", () => {
        (window as any).renderAgain();
        resolve(window.document.body.innerHTML);
      });
    });

    const elem = window.document.getElementById("mydiv");
    should.not.exist((elem as any).prop1);
    should.equal((elem as any).prop2, "world");
  });
}
