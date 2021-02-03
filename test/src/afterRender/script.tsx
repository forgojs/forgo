import { DOMWindow, JSDOM } from "jsdom";
import {
  ForgoRenderArgs,
  ForgoAfterRenderArgs,
  mount,
  rerender,
  setCustomEnv,
} from "../../../";

let window: DOMWindow;
let document: HTMLDocument;

function Component() {
  let counter: number = 0;
  return {
    render(props: any, args: ForgoRenderArgs) {
      (window as any).renderAgain = () => rerender(args.element);
      counter++;
      return counter === 1 ? (
        <div id="hello" prop="hello">
          Hello world
        </div>
      ) : (
        <p id="hello" prop="world">
          Hello world
        </p>
      );
    },
    afterRender(props: any, args: ForgoAfterRenderArgs) {
      (window as any).currentNode = args.element.node;
      (window as any).previousNode = args.previousNode;
      (window as any).counterX10 = counter * 10;
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
    afterRender(props: any, args: ForgoAfterRenderArgs) {
      (window as any).currentNode = args.element.node;
      (window as any).previousNode = args.previousNode;
      (window as any).counterX10 = counter * 10;
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
