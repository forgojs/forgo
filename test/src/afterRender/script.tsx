import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, rerender, setCustomEnv } from "../../../";

let window: DOMWindow;
let document: HTMLDocument;

function Component() {
  let counter: number = 0;
  return {
    render(props: any, args: ForgoRenderArgs) {
      (window as any).renderAgain = () => rerender(args.element);
      counter++;
      return <div id="hello">Hello world</div>;
    },
    afterRender(props: any, args: ForgoRenderArgs) {
      (window as any).componentCounter = counter * 10;
    },
  };
}

function ComponentOnTextNode() {
  let counter: number = 0;
  return {
    render(props: any, args: ForgoRenderArgs) {
      (window as any).renderAgain = () => rerender(args.element);
      counter++;
      return "Hello world";
    },
    afterRender(props: any, args: ForgoRenderArgs) {
      (window as any).componentCounter = counter * 10;
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

export function runWithTextNode(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<ComponentOnTextNode />, window.document.getElementById("root"));
  });
}
