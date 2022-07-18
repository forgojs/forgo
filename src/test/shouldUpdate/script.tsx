import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

let component: forgo.Component;

export function renderAgain() {
  component.update();
}

export function Parent() {
  let counter = 0;

  component = new forgo.Component({
    render() {
      counter++;
      return <div>Counter is {counter}</div>;
    },
  });
  component.shouldUpdate(() => {
    return false;
  });
  return component;
}

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<Parent />, document.getElementById("root"));
  });
}
