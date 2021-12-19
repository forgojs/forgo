import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

export let parent1Unmounted = false;
export let parent2Unmounted = false;
export let childUnmounted = false;

let renderArgs: ForgoRenderArgs;

export function renderAgain() {
  renderArgs.update();
}

function Parent1() {
  return {
    render(props: any, args: ForgoRenderArgs) {
      return <Parent2 />;
    },
    unmount() {
      parent1Unmounted = true;
    },
  };
}

function Parent2() {
  return {
    render(props: any, args: ForgoRenderArgs) {
      return <Child />;
    },
    unmount() {
      parent2Unmounted = true;
    },
  };
}

let counter = 0;

function Child() {
  return {
    render(props: any, args: ForgoRenderArgs) {
      renderArgs = args;
      counter++;
      return counter === 1 ? <div>This is a child node.</div> : <></>;
    },
    unmount() {
      childUnmounted = true;
    },
  };
}

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<Parent1 />, window.document.getElementById("root"));
  });
}
