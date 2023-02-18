import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;
let counter = 0;

let component: forgo.Component<{}>;

export function renderAgain() {
  component.update();
}

export let mountCounter = 0;

const TestComponent = () => {
  component = new forgo.Component({
    render() {
      counter++;
      return counter === 1 ? (
        <>
          <div>1</div>
          <div>2</div>
          <div>3</div>
        </>
      ) : (
        <>
          <p>1</p>
          <p>2</p>
          <p>3</p>
        </>
      );
    },
  });
  component.mount(() => {
    mountCounter++;
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
