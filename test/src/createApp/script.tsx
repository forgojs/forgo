import { DOMWindow, JSDOM } from "jsdom";
import { setCustomEnv, createApp } from "../../../";

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

  createApp(<BasicComponent />).mount(document.getElementById('root'))
}

export function runQuerySelector(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  createApp(<BasicComponent />).mount('#root')
}
