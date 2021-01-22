import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile";
import "should";
import * as run from "./script";

export default function isForgoElement() {
  describe("renders primitive components", () => {
    it("renders string value", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;
  
      run.runStringComponent(dom);
  
      const innerHtml = await new Promise<string>((resolve) => {
        window.addEventListener("load", () => {
          resolve(window.document.body.innerHTML);
        });
      });
  
      innerHtml.should.containEql("hello bar");
    });

    it("renders number value", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;
  
      run.runNumericComponent(dom);
  
      const innerHtml = await new Promise<string>((resolve) => {
        window.addEventListener("load", () => {
          resolve(window.document.body.innerHTML);
        });
      });
  
      innerHtml.should.containEql("100");
    });

    it("renders boolean value", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;
  
      run.runBooleanComponent(dom);
  
      const innerHtml = await new Promise<string>((resolve) => {
        window.addEventListener("load", () => {
          resolve(window.document.body.innerHTML);
        });
      });
  
      innerHtml.should.containEql("true");
    });

    it("renders object value", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;
  
      run.runObjectComponent(dom);
  
      const innerHtml = await new Promise<string>((resolve) => {
        window.addEventListener("load", () => {
          resolve(window.document.body.innerHTML);
        });
      });
  
      innerHtml.should.containEql({label:"bar"});
    });

    it("renders null value", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;
  
      run.runNullComponent(dom);
  
      const mountedDom = await new Promise<any>((resolve) => {
        window.addEventListener("load", () => {
          resolve(window.document.getElementById("root"));
        });
      });
      mountedDom.childElementCount.should.equal(0)
    });

    it("renders undefined value", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;
  
      run.runUndefinedComponent(dom);
  
      const mountedDom = await new Promise<any>((resolve) => {
        window.addEventListener("load", () => {
          resolve(window.document.getElementById("root"));
        });
      });
      mountedDom.childElementCount.should.equal(0)
    });

    it("renders BigInt value", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;
  
      run.runBigIntComponent(dom);
  
      const mountedDom = await new Promise<any>((resolve) => {
        window.addEventListener("load", () => {
          resolve(window.document.getElementById("root"));
        });
      });
      mountedDom.innerHTML.should.containEql(BigInt(Number.MAX_SAFE_INTEGER + 1))
    });

    it("renders normal JSX component", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;
  
      run.runNormalComponent(dom);
  
      const mountedDom = await new Promise<any>((resolve) => {
        window.addEventListener("load", () => {
          resolve(window.document.getElementById("root"));
        });
      });
      mountedDom.innerHTML.should.containEql("bar")
    });

  });
}
