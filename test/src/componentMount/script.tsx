import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, rerender, setCustomEnv } from "../../../";

let window: DOMWindow;
let document: HTMLDocument;

function Component() {
  return {
    render(props: any, args: ForgoRenderArgs) {
      return <div id="hello">Hello world</div>;
    },
    mount(props: any, args: ForgoRenderArgs) {
      (window as any).mountedOn = args.element.node;
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
