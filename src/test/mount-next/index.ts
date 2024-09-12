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
    it("mounts on a DOM element", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;

      run(dom);

      const innerHtml = await new Promise<string>((resolve) => {
        window.addEventListener("load", () => {
          const root = window.document.getElementById("root") as HTMLElement;
          const component = root.querySelector(
            "basic-component"
          ) as HTMLElement;

          // Check the shadow DOM for the content
          if (component.shadowRoot) {
            resolve(component.shadowRoot.innerHTML);
          } else {
            resolve(root.innerHTML);
          }
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

      const document = await new Promise<Document>((resolve) => {
        window.addEventListener("load", () => {
          resolve(window.document);
        });
      });

      const root = document.getElementById("root") as HTMLElement;
      const parentComponent = root.querySelector(
        "parent-component"
      ) as HTMLElement;
      const basicComponent = (
        parentComponent.shadowRoot ?? parentComponent
      ).querySelector("basic-component") as HTMLElement;

      const innerHtml = basicComponent.shadowRoot
        ? basicComponent.shadowRoot.innerHTML
        : basicComponent.innerHTML;

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

      const root = document.getElementById("root") as HTMLElement;
      const domWrappingComponent = root.querySelector(
        "parent-dom-wrapping-component"
      ) as HTMLElement;

      const basicComponent = (
        domWrappingComponent.shadowRoot ?? domWrappingComponent
      ).querySelector("basic-component") as HTMLElement;

      const innerHtml = basicComponent.shadowRoot
        ? basicComponent.shadowRoot.innerHTML
        : basicComponent.innerHTML;

      innerHtml.should.containEql("Hello world");
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

      const root = document.getElementById("root") as HTMLElement;
      const component = root.querySelector("counter-component") as HTMLElement;

      counterButtonRef.value.click();
      counterButtonRef.value.click();
      counterButtonRef.value.click();

      const innerHtml = component.shadowRoot
        ? component.shadowRoot.innerHTML
        : component.innerHTML;

      innerHtml.should.containEql("Clicked 3 times");
    });
  });
}
