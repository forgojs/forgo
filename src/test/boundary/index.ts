import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import should from "should";
import { run } from "./script.js";

export default function() {
  it("honors error boundary", async () => {
    const dom = new JSDOM(htmlFile(), {
      runScripts: "outside-only",
      resources: "usable",
    });
    const window = dom.window;

    run(dom);

    const innerHtml = await new Promise<string>((resolve) => {
      window.addEventListener("load", () => {
        resolve(window.document.body.innerHTML);
      });
    });

    innerHtml.should.containEql(
      "Error in ErrorComponent: Some error occurred :("
    );
  });
}
