import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

let renderArgs: ForgoRenderArgs;
let elementOrder = true;
function Parent() {
  return {
    render(_props: any, args: ForgoRenderArgs) {
      renderArgs = args;
      return elementOrder ? (
        <>
          <Child key="first-child" />
          <Child key="second-child" />
        </>
      ) : (
        <>
          <Child key="second-child" />
          <Child key="first-child" />
        </>
      );
    },
  };
}

function Child() {
  const state = Math.random().toString();

  return {
    render(props: any, _args: ForgoRenderArgs) {
      return (
        <>
          {props.key ? (
            <Child />
          ) : (
            <p class="stateful-grandchild" data-state={state}>
              Hello, world!
            </p>
          )}
        </>
      );
    },
  };
}

export function renderAgain() {
  elementOrder = !elementOrder;
  renderArgs.update();
}

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<Parent />, window.document.getElementById("root"));
  });
}
