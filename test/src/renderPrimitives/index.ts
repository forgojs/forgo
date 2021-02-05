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

const ELEMENT_NODE_TYPE = 1;
const ATTRIBUTE_NODE_TYPE = 2;
const TEXT_NODE_TYPE = 3;

export default function() {
  describe("renders primitives", () => {
    [true, false].forEach((wrapped) => {
      const wrappedText = wrapped ? " wrapped in DOM element" : "";
      it("renders undefined" + wrappedText, async () => {
        const dom = new JSDOM(htmlFile(), {
          runScripts: "outside-only",
          resources: "usable",
        });
        const window = dom.window;

        runWithUndefinedProps(dom, wrapped);

        await new Promise<void>((resolve) => {
          window.addEventListener("load", () => {
            resolve();
          });
        });

        if (wrapped) {
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

        runWithNullProps(dom, wrapped);

        await new Promise<void>((resolve) => {
          window.addEventListener("load", () => {
            resolve();
          });
        });

        if (wrapped) {
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

        runWithStringProps(dom, wrapped);

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

        runWithBooleanProps(dom, wrapped);

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

        runWithNumericProps(dom, wrapped);

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
