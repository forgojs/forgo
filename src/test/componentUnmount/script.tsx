import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

let renderArgs: ForgoRenderArgs;

export function renderAgain() {
  renderArgs.update();
}

export let hasUnmounted = false;

function Parent() {
  let firstRender = true;

  return {
    render(props: any, args: ForgoRenderArgs) {
      renderArgs = args;
      if (firstRender) {
        firstRender = false;
        return <Child />;
      } else {
        return <div>The child should have unmounted.</div>;
      }
    },
  };
}

function Child() {
  return {
    render() {
      return <div>This is the child component</div>;
    },
    unmount() {
      hasUnmounted = true;
    },
  };
}

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<Parent />, window.document.getElementById("root"));
  });
}
