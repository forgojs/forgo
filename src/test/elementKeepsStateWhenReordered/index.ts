import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import {
  inputRef1,
  inputRef2,
  inputRef3,
  inputRef4,
  inputRef5,
  run,
} from "./script.js";
import { reorderElements } from "./script.js";

export default function () {
  describe("element refs during reorder", () => {
    it("element maintains state with reordered", async () => {
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

      reorderElements();

      (inputRef1.value as HTMLInputElement).id.should.equal("inputnew1");
      (inputRef2.value as HTMLInputElement).id.should.equal("inputnew2");
      (inputRef3.value as HTMLInputElement).id.should.equal("inputnew3");
      (inputRef4.value as HTMLInputElement).id.should.equal("inputnew4");
      (inputRef5.value as HTMLInputElement).id.should.equal("inputnew5");
    });
  });
}
