import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;
let counter = 0;

export let numUnmounts = 0;

let component: forgo.Component<{}>;

export function renderAgain() {
  component.update();
}

const TestComponent = () => {
  component = new forgo.Component({
    render() {
      counter++;
      return counter === 1 ? <Child /> : <p>1</p>;
    },
  });
  return component;
};

const Child = () => {
  const component = new forgo.Component({
    render() {
      return (
        <>
          <div>1</div>
          <div>2</div>
          <div>3</div>
        </>
      );
    },
  });
  component.unmount(() => {
    numUnmounts++;
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
