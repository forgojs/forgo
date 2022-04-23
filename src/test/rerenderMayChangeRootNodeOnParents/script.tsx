import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

export let parentArgs: ForgoRenderArgs<{}>;

function Parent() {
  return {
    mount(props: any, args: ForgoRenderArgs<{}>) {
      parentArgs = args;
    },

    render(props: any, args: ForgoRenderArgs<{}>) {
      return <Child />;
    },
  };
}

let counter = 0;

let renderArgs: ForgoRenderArgs<{}>;

export function renderAgain() {
  renderArgs.update();
}

function Child() {
  return {
    render(props: any, args: ForgoRenderArgs<{}>) {
      renderArgs = args;
      counter++;
      return counter === 1 ? (
        <div id="node1">This is a child node.</div>
      ) : (
        <p id="node2">This is a child node.</p>
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
