import { h } from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: HTMLDocument;

function Parent() {
  let firstRender = true;

  return {
    render(props: any, { update }: ForgoRenderArgs) {
      (window as any).renderAgain = () => {
        update();
      };
      if (firstRender) {
        firstRender = false;
        return <Child />;
      } else {
        return <div>The child should have unmounted.</div>;
      }
    },
  };
}

function Child() {
  return {
    render() {
      return <div>This is the child component</div>;
    },
    unmount() {
      (window as any).hasUnmounted = true;
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
