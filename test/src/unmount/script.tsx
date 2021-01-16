import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, rerender, setCustomEnv } from "../../../";
import promiseSignal from "../promiseSignal";

let window: DOMWindow;
let document: HTMLDocument;

function Parent() {
  let firstRender = true;

  return {
    render(props: any, args: ForgoRenderArgs) {
      (window as any).renderAgain = () => {
        rerender(args.element);
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
