import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

export let parentCounter = 0;
export let childCounter = 0;

let component: forgo.Component;
export function renderAgain() {
  component.update();
}

const Parent: forgo.ForgoNewComponentCtor = () => {
  parentCounter = 0;

  return new forgo.Component({
    render() {
      parentCounter++;
      return (
        <div>
          <p>Parent counter is {parentCounter}</p>
          <Child />
        </div>
      );
    },
  });
};

const ParentWithSharedNode: forgo.ForgoNewComponentCtor = () => {
  parentCounter = 0;

  return new forgo.Component({
    render() {
      parentCounter++;
      return <Child />;
    },
  });
};

const Child: forgo.ForgoNewComponentCtor = () => {
  childCounter = 0;

  component = new forgo.Component({
    render() {
      childCounter++;
      return (
        <div>
          <p>Child counter is {childCounter}</p>
        </div>
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
    mount(<Parent />, document.getElementById("root"));
  });
}

export function runSharedNode(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<ParentWithSharedNode />, document.getElementById("root"));
  });
}
