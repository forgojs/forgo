import { DOMWindow, JSDOM } from "jsdom";
import { rerender, mount, ForgoRenderArgs, setCustomEnv } from "../../../";

let window: DOMWindow;
let document: HTMLDocument;

export function Parent() {
  let counter = 0;

  return {
    render(props: any, args: ForgoRenderArgs) {
      window.renderAgain = () => {
        rerender(args.element);
      };
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
