import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

let renderArgs: ForgoRenderArgs;

let renderCount = 0;

export let renderedElement: ChildNode;
export let hasUnmounted = false;

export function renderAgain() {
  renderArgs.update();
}

function Parent() {
  return {
    render(_props: any, args: ForgoRenderArgs) {
      renderArgs = args;
      renderCount += 1;
      if (renderCount % 2 === 0) {
        return null;
      } else {
        return <div>Hello, world</div>;
      }
    },
    afterRender(_props: any, args: ForgoRenderArgs) {
      renderedElement = args.element.node!;
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
