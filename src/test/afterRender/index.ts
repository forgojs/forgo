import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import {
  counterX10,
  currentNode,
  previousNode,
  renderAgain,
  run,
  runWithTextNode,
  runWithRef,
  runWithDangerouslySetInnerHtml,
} from "./script.js";
import should from "should";

export default function () {
  describe("runs afterRender()", () => {
    it("when mounted on a DOM element", async () => {
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

      should.equal(previousNode as Element, undefined);
      should.equal(counterX10, 10);
      should.equal((currentNode as Element).getAttribute("prop"), "hello");
      renderAgain();
      should.equal((previousNode as Element).nodeType, 1);
      should.equal(counterX10, 20);
      should.equal((currentNode as Element).getAttribute("prop"), "world");
      should.equal((previousNode as Element).getAttribute("prop"), "hello");
      renderAgain();
      should.equal((previousNode as Element).nodeType, 1);
      should.equal(counterX10, 30);
      should.equal((currentNode as Element).getAttribute("prop"), "world");
      should.equal((previousNode as Element).getAttribute("prop"), "world");
    });

    it("when mounted on a text node", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;

      runWithTextNode(dom);

      await new Promise<void>((resolve) => {
        window.addEventListener("load", () => {
          resolve();
        });
      });

      should.equal(previousNode as Element, undefined);
      should.equal(counterX10, 10);
      renderAgain();
      should.equal((previousNode as Element).nodeType, 3);
      should.equal(counterX10, 20);
      renderAgain();
      should.equal((previousNode as Element).nodeType, 3);
      should.equal(counterX10, 30);
    });
  });

  describe("setting an element's attributes", () => {
    it("skips the 'ref' attribute", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;

      runWithRef(dom);

      await new Promise<void>((resolve) => {
        window.addEventListener("load", () => {
          resolve();
        });
      });

      should.equal((currentNode as Element).getAttribute("ref"), undefined);
    });

    it("skips the 'dangerouslySetInnerHtml' attribute", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;

      runWithDangerouslySetInnerHtml(dom);

      await new Promise<void>((resolve) => {
        window.addEventListener("load", () => {
          resolve();
        });
      });

      should.equal(
        (currentNode as Element).getAttribute("dangerouslySetInnerHTML"),
        undefined
      );
    });
  });
}
