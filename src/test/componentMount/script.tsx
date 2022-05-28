import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

export let mountedOn: Element;

const TestComponent: forgo.ForgoComponentCtor = () => {
  const component = new forgo.Component({
    render() {
      return <div id="hello">Hello world</div>;
    },
  });
  component.addEventListener("mount", (_props, component) => {
    mountedOn = component.__internal.element.node as Element;
  });
  return component;
};

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<TestComponent />, window.document.getElementById("root"));
  });
}
