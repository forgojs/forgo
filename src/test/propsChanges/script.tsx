import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import {
  ForgoRenderArgs,
  ForgoAfterRenderArgs,
  mount,
  setCustomEnv,
} from "../../index.js";

let window: DOMWindow;
let document: HTMLDocument;

function Component() {
  let counter: number = 0;

  const el: forgo.ForgoRef<HTMLDivElement> = {};
  (window as any).mutatedProps = {};

  return {
    mount() {
      // Detect each time attributes are changed (after the first render)
      const observer = new window.MutationObserver((mutations) => {
        const elMutation = mutations.find(
          (mutation) => mutation.target === el.value
        );
        if (elMutation?.attributeName) {
          (window as any).mutatedProps[elMutation.attributeName] = true;
        }
      });
      observer.observe(el.value!, { attributes: true });
    },
    render(props: any, { update }: ForgoRenderArgs) {
      (window as any).renderAgain = update;
      counter++;
      return (
        <div id="hello" prop={counter === 1 ? "hello" : "world"} ref={el}>
          Hello world
        </div>
      );
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
