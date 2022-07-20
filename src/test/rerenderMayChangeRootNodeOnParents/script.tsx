import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

export let parentComponent: forgo.Component;
export function renderAgain() {
  parentComponent.update();
}

let childComponent: forgo.Component;

const Parent: forgo.ForgoNewComponentCtor = () => {
  parentComponent = new forgo.Component({
    render() {
      return <Child />;
    },
  });
  return parentComponent;
};

let counter = 0;

const Child: forgo.ForgoNewComponentCtor = () => {
  childComponent = new forgo.Component({
    render() {
      counter++;
      return counter === 1 ? (
        <div id="node1">This is a child node.</div>
      ) : (
        <p id="node2">This is a child node.</p>
      );
    },
  });
  return childComponent;
};

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<Parent />, window.document.getElementById("root"));
  });
}
