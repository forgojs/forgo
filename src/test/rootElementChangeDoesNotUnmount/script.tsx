import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

let renderArgs: ForgoRenderArgs;
export let renderCount = 0;
export let unmountCount = 0;

export function renderAgain() {
  renderArgs.update();
}

function Child() {
  return {
    render(props: any, args: ForgoRenderArgs) {
      renderCount++;
      if (renderCount % 2 === 0) {
        return <div>This is a div</div>;
      } else {
        return <p>But this is a paragraph</p>;
      }
    },
    unmount() {
      unmountCount++;
    },
  };
}

function Parent() {
  return {
    render(props: any, args: ForgoRenderArgs) {
      renderArgs = args;
      return (
        <section>
          <Child />
        </section>
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
