import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

export let parent1Unmounted = false;
export let parent2Unmounted = false;
export let childUnmounted = false;

let component: forgo.Component;

export function renderAgain() {
  component.update();
}

const Parent1: forgo.ForgoComponentCtor = () => {
  const component = new forgo.Component({
    render() {
      return <Parent2 />;
    },
  });
  component.addEventListener("unmount", () => {
    parent1Unmounted = true;
  });
  return component;
};

const Parent2: forgo.ForgoComponentCtor = () => {
  const component = new forgo.Component({
    render() {
      return <Child />;
    },
  });
  component.addEventListener("unmount", () => {
    parent2Unmounted = true;
  });
  return component;
};

let counter = 0;

const Child: forgo.ForgoComponentCtor = () => {
  component = new forgo.Component({
    render() {
      counter++;
      return counter === 1 ? <div>This is a child node.</div> : <></>;
    },
  });
  component.addEventListener("unmount", () => {
    childUnmounted = true;
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
