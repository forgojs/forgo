import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, ForgoRenderArgs, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

let renderArgs: ForgoRenderArgs<{}>;

export function renderAgain() {
  renderArgs.update();
}

export function Parent() {
  let counter = 0;

  return {
    render(props: any, args: ForgoRenderArgs<{}>) {
      renderArgs = args;
      counter++;
      return <div>Counter is {counter}</div>;
    },
    shouldUpdate() {
      return false;
    },
  };
}

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<Parent />, document.getElementById("root"));
  });
}
