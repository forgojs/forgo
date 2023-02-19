import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { run } from "./script.js";

export default function () {
  describe("custom elements", () => {
    it("works with inherited custom elements", async () => {
      let calledConnectedCallback = false;

      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;

      class WordCount extends window.HTMLParagraphElement {
        connectedCallback() {
          calledConnectedCallback = true;
          // count words in element's parent element
          let wcParent = this.parentNode;

          function countWords(node: any) {
            let text = node.innerText || node.textContent;
            return text.split(/\s+/g).length;
          }

          let count = "Words: " + countWords(wcParent);

          // Create a shadow root
          let shadow = this.attachShadow({ mode: "open" });

          // Create text node and add word count to it
          let text = window.document.createElement("span");
          text.textContent = count;

          // Append it to the shadow root
          shadow.appendChild(text);
        }
      }

      window.customElements.define("word-count", WordCount, { extends: "p" });

      run(dom);

      const innerHtml = await new Promise<string>((resolve) => {
        window.addEventListener("load", () => {
          resolve(window.document.body.innerHTML);
        });
      });

      calledConnectedCallback.should.be.true();
    });
  });
}
