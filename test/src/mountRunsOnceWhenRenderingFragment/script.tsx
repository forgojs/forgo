import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, setCustomEnv } from "../../../";

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
        <>
          <p>1</p>
          <p>2</p>
          <p>3</p>
        </>
      );
    },
    mount() {
      window.mountCounter++;
    },
  };
}

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  window.mountCounter = 0;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<Component />, window.document.getElementById("root"));
  });
}
