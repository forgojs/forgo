import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

let component: forgo.Component<forgo.ForgoComponentProps>;

export function renderAgain() {
  component.update();
}

export let hasUnmounted = false;

const Parent: forgo.ForgoComponentCtor<forgo.ForgoComponentProps> = () => {
  let firstRender = true;

  component = new forgo.Component({
    render() {
      if (firstRender) {
        firstRender = false;
        return <Child />;
      } else {
        return <div>The child should have unmounted.</div>;
      }
    },
  });
  return component;
};

const Child: forgo.ForgoComponentCtor<forgo.ForgoComponentProps> = () => {
  const component = new forgo.Component({
    render() {
      return <div>This is the child component</div>;
    },
  });
  component.addEventListener("unmount", () => {
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
