import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

let isFirstRender = true;

export let hasUnmounted = false;

let component: forgo.Component<forgo.ForgoComponentProps>;
export function renderAgain() {
  component.update();
}

const Child: forgo.ForgoComponentCtor<forgo.ForgoComponentProps> = () => {
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
  component.addEventListener("unmount", () => {
    hasUnmounted = true;
  });
  return component;
};

const Parent: forgo.ForgoComponentCtor<forgo.ForgoComponentProps> = () => {
  return new forgo.Component({
    render() {
      return (
        <div>
          <Child />
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
    mount(<Parent />, window.document.getElementById("root"));
  });
}
