import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { run, unmountCounter } from "./script.js";
import should from "should";
import { renderAgain } from "../clearsOldProps/script.js";

export default function () {
  it("runs unmount when fragment is replaced with a node", async () => {
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

    renderAgain();

    should.equal(unmountCounter, 0);
  });
}
