import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

let isFirstRender = true;

export let hasUnmounted = false;

let component: forgo.Component<{}>;
export function renderAgain() {
  component.update();
}

const Parent = () => {
  component = new forgo.Component({
    render() {
      if (isFirstRender) {
        isFirstRender = false;
        return <div>Hello, world</div>;
      } else {
        return null;
      }
    },
  });
  component.unmount(() => {
    hasUnmounted = true;
  });
  return component;
};

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<Parent />, window.document.getElementById("root"));
  });
}
