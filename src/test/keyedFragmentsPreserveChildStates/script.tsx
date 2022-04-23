import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

let renderArgs: ForgoRenderArgs<{}>;
let elementOrder = true;
function Parent() {
  return {
    render(_props: any, args: ForgoRenderArgs<{}>) {
      renderArgs = args;
      const keys = elementOrder
        ? ["first-child", "second-child"]
        : ["second-child", "first-child"];

      return (
        <>
          <Child key={keys[0]} />
          <Child key={keys[1]} />
          <Child key="last-child" />
        </>
      );
    },
  };
}

function Child() {
  const state = Math.random().toString();

  return {
    render(props: any, _args: ForgoRenderArgs<{}>) {
      return (
        <>
          <p
            class="stateful-grandchild"
            data-state={state}
            data-key={props.key}
          >
            Hello, world!
          </p>
          {props.key ? <Child /> : null}
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
