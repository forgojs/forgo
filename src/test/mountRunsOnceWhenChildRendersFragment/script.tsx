import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;
let counter = 0;

let renderArgs: ForgoRenderArgs<{}>;
export let mountCounter: number = 0;

export function renderAgain() {
  renderArgs.update();
}

function Component() {
  return {
    render(props: any, args: ForgoRenderArgs<{}>) {
      renderArgs = args;
      counter++;
      return <SuperCompo />;
    },
    mount() {
      mountCounter++;
    },
  };
}

function SuperCompo() {
  return {
    render() {
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
