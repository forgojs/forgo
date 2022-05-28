import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

let component: forgo.Component;

export function renderAgain() {
  component.update();
}

const BasicComponent: forgo.ForgoComponentCtor = () => {
  let firstRender = true;
  component = new forgo.Component({
    render() {
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
  });
  return component;
};

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<BasicComponent />, document.getElementById("root"));
  });
}
