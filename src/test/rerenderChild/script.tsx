import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, ForgoRenderArgs, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

export let parentCounter = 0;
export let childCounter = 0;

let renderArgs: ForgoRenderArgs<{}>;
export function renderAgain() {
  renderArgs.update();
}

function Parent() {
  parentCounter = 0;

  return {
    render(props: any, args: ForgoRenderArgs<{}>) {
      parentCounter++;
      return (
        <div>
          <p>Parent counter is {parentCounter}</p>
          <Child />
        </div>
      );
    },
  };
}

function ParentWithSharedNode() {
  parentCounter = 0;

  return {
    render(props: any, args: ForgoRenderArgs<{}>) {
      parentCounter++;
      return <Child />;
    },
  };
}

function Child() {
  childCounter = 0;

  return {
    render(props: any, args: ForgoRenderArgs<{}>) {
      renderArgs = args;
      childCounter++;
      return (
        <div>
          <p>Child counter is {childCounter}</p>
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
    mount(<Parent />, document.getElementById("root"));
  });
}

export function runSharedNode(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<ParentWithSharedNode />, document.getElementById("root"));
  });
}
