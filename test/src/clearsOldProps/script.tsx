import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, setCustomEnv } from "../../../";

let window: DOMWindow;
let document: HTMLDocument;

function BasicComponent() {
  let firstRender = true;
  return {
    render(props: {}, { update }: ForgoRenderArgs) {
      window.renderAgain = update;
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
