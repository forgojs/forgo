import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import "should";
import {
  run,
  runParent,
  runParentDOMWrapping,
  runCounter,
  counterButtonRef,
} from "./script.js";

export default function () {
  describe("mounts a component", () => {
    it("mounts on an DOM element", async () => {
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

    it("mounts a parent component", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;

      runParent(dom);

      const innerHtml = await new Promise<string>((resolve) => {
        window.addEventListener("load", () => {
          resolve(window.document.body.innerHTML);
        });
      });

      innerHtml.should.containEql("Hello world");
    });

    it("mounts a parent dom wrapping component", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;

      runParentDOMWrapping(dom);

      const document = await new Promise<Document>((resolve) => {
        window.addEventListener("load", () => {
          resolve(window.document);
        });
      });

      document.body.innerHTML.should.containEql("Hello world");
    });

    it("mounts a counter component", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;

      runCounter(dom);

      const document = await new Promise<Document>((resolve) => {
        window.addEventListener("load", () => {
          resolve(window.document);
        });
      });

      counterButtonRef.value.click();
      counterButtonRef.value.click();
      counterButtonRef.value.click();

      document.body.innerHTML.should.containEql("Clicked 3 times");
    });
  });
}
