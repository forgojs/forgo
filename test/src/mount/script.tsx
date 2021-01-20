import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../../";

let window: DOMWindow;
let document: HTMLDocument;

function BasicComponent() {
  return {
    render() {
      return <div>Hello world</div>;
    },
  };
}

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<BasicComponent />, document.getElementById("root"));
  });
}

export function runQuerySelector(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<BasicComponent />, "#root");
  });
}
