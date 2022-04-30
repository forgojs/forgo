import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { render, ForgoRenderArgs, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

export let buttonRef: any = {};

const TestComponent: forgo.ForgoComponentCtor<
  forgo.ForgoComponentProps
> = () => {
  let counter = 0;

  return new forgo.Component({
    render(_props: any, component) {
      function updateCounter() {
        counter++;
        component.update();
      }

      return (
        <div>
          <button onclick={updateCounter} ref={buttonRef}>
            Click me!
          </button>
          <p>Clicked {counter} times</p>
        </div>
      );
    },
  });
};

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  const { node } = render(<TestComponent />);
  window.addEventListener("load", () => {
    document.getElementById("root")!.firstElementChild!.replaceWith(node);
  });
}
