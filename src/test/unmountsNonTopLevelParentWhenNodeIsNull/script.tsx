import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

let renderArgs: ForgoRenderArgs;

let isFirstRender = true;

export let hasUnmounted = false;

export function renderAgain() {
  renderArgs.update();
}

function Child() {
  return {
    render(props: any, args: ForgoRenderArgs) {
      renderArgs = args;
      if (isFirstRender) {
        isFirstRender = false;
        return <div>Hello, world</div>;
      } else {
        return null;
      }
    },
    unmount() {
      hasUnmounted = true;
    },
  };
}

function Parent() {
  return {
    render(props: any, args: ForgoRenderArgs) {
      return (
        <div>
          <Child />
        </div>
      );
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
