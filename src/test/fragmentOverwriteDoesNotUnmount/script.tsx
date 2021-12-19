import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;
let counter = 0;

let renderArgs: ForgoRenderArgs;
export let unmountCounter: number = 0;

export function renderAgain() {
  renderArgs.update();
}

function Component() {
  return {
    render(props: any, args: ForgoRenderArgs) {
      renderArgs = args;
      counter++;
      return counter === 1 ? (
        <>
          <div>1</div>
          <div>2</div>
          <div>3</div>
        </>
      ) : counter === 2 ? (
        <p>4</p>
      ) : (
        <>
          <p>5</p>
          <p>6</p>
          <p>7</p>
        </>
      );
    },
    unmount() {
      unmountCounter++;
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
