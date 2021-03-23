import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, setCustomEnv } from "../../../dist";

let window: DOMWindow;
let document: HTMLDocument;

function Parent1() {
  return {
    render(props: any, args: ForgoRenderArgs) {
      return <Parent2 />;
    },
  };
}

function Parent2() {
  return {
    render(props: any, args: ForgoRenderArgs) {
      return <Child />;
    },
  };
}

let counter = 0;

function Child() {
  return {
    render(props: any, { update }: ForgoRenderArgs) {
      window.renderAgain = update;
      counter++;
      return counter === 1 ? (
        <>
          <div id="node1">This is a child node.</div>
          <div key="2" id="node2">
            This is a child node.
          </div>
        </>
      ) : (
        <>
          <div key="2" id="node2">
            This is a child node.
          </div>
        </>
      );
    },
  };
}

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<Parent1 />, window.document.getElementById("root"));
  });
}
