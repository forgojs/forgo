import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: HTMLDocument;
let counter = 0;

function Component() {
  return {
    render(props: any, { update }: ForgoRenderArgs) {
      window.renderAgain = update;
      counter++;
      return counter === 1 ? (
        <>
          <div>1</div>
          <div>2</div>
          <div>3</div>
        </>
      ) : (
        <p>1</p>
      );
    },
    unmount() {
      window.unmountCounter++;
    },
  };
}

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  window.unmountCounter = 0;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<Component />, window.document.getElementById("root"));
  });
}
