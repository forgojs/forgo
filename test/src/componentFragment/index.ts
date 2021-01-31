import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile";
import { run } from "./script";
import "should";

export default function componentUnmount() {
  it("renders component returning a fragment", async () => {
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

    const rootElem = window.document.getElementById("root") as HTMLElement;
    rootElem.innerHTML.should.containEql(
      "<div>1</div><div>2</div><div>3</div>"
    );
  });
}
