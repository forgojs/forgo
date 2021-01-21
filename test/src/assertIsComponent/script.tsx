import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../../";

let window: DOMWindow;
let document: HTMLDocument;

function BasicComponent() {
  return <div>Hello world</div>;
}

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    try {
      mount(<BasicComponent />, document.getElementById("root"));
    } catch (ex) {
      window.componentError = ex;
    }
  });
}
