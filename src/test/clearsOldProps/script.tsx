import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

let renderArgs: ForgoRenderArgs;

export function renderAgain() {
  renderArgs.update();
}

function BasicComponent() {
  let firstRender = true;
  return {
    render(props: {}, args: ForgoRenderArgs) {
      renderArgs = args;
      if (firstRender) {
        firstRender = false;
        return (
          <div id="mydiv" prop1="hello">
            Hello world
          </div>
        );
      } else {
        return (
          <div id="mydiv" prop2="world">
            Hello world
          </div>
        );
      }
    },
  };
}

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<BasicComponent />, document.getElementById("root"));
  });
}
