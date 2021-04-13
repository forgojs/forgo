import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile";
import * as should from "should";
import {
  Wrapping,
  runWithBooleanProps,
  runWithNullProps,
  runWithNumericProps,
  runWithStringProps,
  runWithUndefinedProps,
} from "./script";

const TEXT_NODE_TYPE = 3;

export default function () {
  describe("renders primitives", () => {
    const wrapping: Wrapping[] = ["DIV", "FRAGMENT", "NONE"];
    wrapping.forEach((wrapping) => {
      const wrappedText =
        wrapping === "DIV"
          ? " wrapped in DIV"
          : wrapping === "FRAGMENT"
          ? " wrapped in FRAGMENT"
          : "";
      it("renders undefined" + wrappedText, async () => {
        const dom = new JSDOM(htmlFile(), {
          runScripts: "outside-only",
          resources: "usable",
        });
        const window = dom.window;

        runWithUndefinedProps(dom, wrapping);

        await new Promise<void>((resolve) => {
          window.addEventListener("load", () => {
            resolve();
          });
        });

        if (wrapping === "DIV") {
          should.equal(
            window.document.getElementById("mydiv")?.childNodes.length,
            0
          );
        } else {
          should.equal(
            window.document.getElementById("root")?.childNodes[0].nodeType,
            TEXT_NODE_TYPE
          );
        }
      });

      it("renders null" + wrappedText, async () => {
        const dom = new JSDOM(htmlFile(), {
          runScripts: "outside-only",
          resources: "usable",
        });
        const window = dom.window;

        runWithNullProps(dom, wrapping);

        await new Promise<void>((resolve) => {
          window.addEventListener("load", () => {
            resolve();
          });
        });

        if (wrapping === "DIV") {
          should.equal(
            window.document.getElementById("mydiv")?.childNodes.length,
            0
          );
        } else {
          should.equal(
            window.document.getElementById("root")?.childNodes[0].nodeType,
            TEXT_NODE_TYPE
          );
        }
      });

      it("renders string" + wrappedText, async () => {
        const dom = new JSDOM(htmlFile(), {
          runScripts: "outside-only",
          resources: "usable",
        });
        const window = dom.window;

        runWithStringProps(dom, wrapping);

        await new Promise<void>((resolve) => {
          window.addEventListener("load", () => {
            resolve();
          });
        });

        window.document
          .getElementById("mydiv")
          ?.innerHTML.should.equal("hello");
      });

      it("renders boolean" + wrappedText, async () => {
        const dom = new JSDOM(htmlFile(), {
          runScripts: "outside-only",
          resources: "usable",
        });
        const window = dom.window;

        runWithBooleanProps(dom, wrapping);

        await new Promise<void>((resolve) => {
          window.addEventListener("load", () => {
            resolve();
          });
        });

        window.document.getElementById("mydiv")?.innerHTML.should.equal("true");
      });

      it("renders number" + wrappedText, async () => {
        const dom = new JSDOM(htmlFile(), {
          runScripts: "outside-only",
          resources: "usable",
        });
        const window = dom.window;

        runWithNumericProps(dom, wrapping);

        await new Promise<void>((resolve) => {
          window.addEventListener("load", () => {
            resolve();
          });
        });

        window.document.getElementById("mydiv")?.innerHTML.should.equal("100");
      });
    });
  });
}
