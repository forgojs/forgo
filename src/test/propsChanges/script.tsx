import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import {
  ForgoRenderArgs,
  ForgoAfterRenderArgs,
  mount,
  setCustomEnv,
} from "../../index.js";

let window: DOMWindow;
let document: Document;

let renderArgs: ForgoRenderArgs<{}>;

export function renderAgain() {
  renderArgs.update();
}

export let currentNode: Element | undefined;
export let previousNode: Element | undefined;
export let counterX10 = 0;
export let mutatedProps: {
  [key: string]: boolean;
} = {};

function Component() {
  let counter: number = 0;

  const el: forgo.ForgoRef<HTMLDivElement> = {};
  mutatedProps = {};

  return {
    mount() {
      // Detect each time attributes are changed (after the first render)
      const observer = new window.MutationObserver((mutations) => {
        const elMutation = mutations.find(
          (mutation) => mutation.target === el.value
        );
        if (elMutation?.attributeName) {
          mutatedProps[elMutation.attributeName] = true;
        }
      });
      observer.observe(el.value!, { attributes: true });
    },
    render(props: any, args: ForgoRenderArgs<{}>) {
      renderArgs = args;
      counter++;
      return (
        <div id="hello" prop={counter === 1 ? "hello" : "world"} ref={el}>
          Hello world
        </div>
      );
    },
    afterRender(props: any, args: ForgoAfterRenderArgs<{}>) {
      currentNode = args.element.node as Element;
      previousNode = args.previousNode as Element;
      counterX10 = counter * 10;
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
