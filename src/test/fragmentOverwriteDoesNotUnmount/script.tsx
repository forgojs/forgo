import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;
let counter = 0;

let component: forgo.Component;
export let unmountCounter: number = 0;

export function renderAgain() {
  component.update();
}

const TestComponent: forgo.ForgoComponentCtor = () => {
  component = new forgo.Component({
    render() {
      counter++;
      return counter === 1 ? (
        <>
          <div>1</div>
          <div>2</div>
          <div>3</div>
        </>
      ) : counter === 2 ? (
        <p>4</p>
      ) : (
        <>
          <p>5</p>
          <p>6</p>
          <p>7</p>
        </>
      );
    },
  });
  component.unmount(() => {
    unmountCounter++;
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
