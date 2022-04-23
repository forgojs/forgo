import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;
let counter = 0;

export let numUnmounts = 0;

let renderArgs: ForgoRenderArgs<{}>;

export function renderAgain() {
  renderArgs.update();
}

function Component() {
  return {
    render(props: any, componentRenderArgs: ForgoRenderArgs<{}>) {
      renderArgs = componentRenderArgs;
      counter++;
      return counter === 1 ? <Child /> : <p>1</p>;
    },
  };
}

function Child() {
  return {
    render(props: any, args: ForgoRenderArgs<{}>) {
      return (
        <>
          <div>1</div>
          <div>2</div>
          <div>3</div>
        </>
      );
    },
    unmount() {
      numUnmounts++;
    },
  };
}

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<Component />, window.document.getElementById("root"));
  });
}
