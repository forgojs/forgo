import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile";
import "should";
import { run, runQuerySelector } from "./script";

export default function createApp() {
  it("create forgo app", async () => {
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

    innerHtml.should.containEql("Hello world");
  });

    it("create forgo app using query selector", async () => {
    const dom = new JSDOM(htmlFile(), {
      runScripts: "outside-only",
      resources: "usable",
    });
    const window = dom.window;

    runQuerySelector(dom);

    const innerHtml = await new Promise<string>((resolve) => {
      window.addEventListener("load", () => {
        resolve(window.document.body.innerHTML);
      });
    });

    innerHtml.should.containEql("Hello world");
  });
}

