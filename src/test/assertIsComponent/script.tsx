import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

function BasicComponent() {
  return <div>Hello world</div>;
}

export let componentError: any = undefined;

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    try {
      mount(<BasicComponent />, document.getElementById("root"));
    } catch (ex) {
      componentError = ex;
    }
  });
}
