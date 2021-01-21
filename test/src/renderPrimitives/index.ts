import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile";
import * as should from "should";
import {
  runWithBooleanProps,
  runWithNullProps,
  runWithNumericProps,
  runWithStringProps,
  runWithUndefinedProps,
} from "./script";

export default function renderPrimitives() {
  describe("renders primitives", () => {
    it("renders undefined", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;

      runWithUndefinedProps(dom);

      await new Promise<void>((resolve) => {
        window.addEventListener("load", () => {
          resolve();
        });
      });

      should.equal(
        window.document.getElementById("mydiv")?.childNodes.length,
        0
      );
    });

    it("renders null", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;

      runWithNullProps(dom);

      await new Promise<void>((resolve) => {
        window.addEventListener("load", () => {
          resolve();
        });
      });

      should.equal(
        window.document.getElementById("mydiv")?.childNodes.length,
        0
      );
    });

    it("renders string", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;

      runWithStringProps(dom);

      await new Promise<void>((resolve) => {
        window.addEventListener("load", () => {
          resolve();
        });
      });

      window.document.getElementById("mydiv")?.innerHTML.should.equal("hello");
    });

    it("renders boolean", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;

      runWithBooleanProps(dom);

      await new Promise<void>((resolve) => {
        window.addEventListener("load", () => {
          resolve();
        });
      });

      window.document.getElementById("mydiv")?.innerHTML.should.equal("true");
    });

    it("renders number", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;

      runWithNumericProps(dom);

      await new Promise<void>((resolve) => {
        window.addEventListener("load", () => {
          resolve();
        });
      });

      window.document.getElementById("mydiv")?.innerHTML.should.equal("100");
    });
  });
}
