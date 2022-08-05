import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv, ForgoRef } from "../../index.js";

let window: DOMWindow;
let document: Document;

export let inputRef: ForgoRef<HTMLInputElement> = {};

const Parent: forgo.ForgoNewComponentCtor = () => {
  return new forgo.Component({
    render() {
      return (
        <div>
          <input type="text" ref={inputRef} />
        </div>
      );
    },
  });
};

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<Parent />, document.getElementById("root"));
  });
}
