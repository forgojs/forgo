import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

let component: forgo.Component<forgo.ForgoComponentProps>;
export function renderAgain() {
  component.update();
}

const Parent1: forgo.ForgoComponentCtor<forgo.ForgoComponentProps> = () => {
  return new forgo.Component({
    render() {
      return <Parent2 />;
    },
  });
};

const Parent2: forgo.ForgoComponentCtor<forgo.ForgoComponentProps> = () => {
  return new forgo.Component({
    render() {
      return <Child />;
    },
  });
};

let counter = 0;

const Child: forgo.ForgoComponentCtor<forgo.ForgoComponentProps> = () => {
  component = new forgo.Component({
    render() {
      counter++;
      return counter === 1 ? (
        <>
          <div id="node1">This is a child node.</div>
          <div key="2" id="node2">
            This is a child node.
          </div>
        </>
      ) : (
        <>
          <div key="2" id="node2">
            This is a child node.
          </div>
        </>
      );
    },
  });
  return component;
};

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<Parent1 />, window.document.getElementById("root"));
  });
}
