import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

const TestComponent: forgo.ForgoNewComponentCtor = () => {
  return new forgo.Component({
    render() {
      return (
        <>
          <div>1</div>
          <div>2</div>
          <div>3</div>
        </>
      );
    },
  });
};

const NestedFragmentComponent: forgo.ForgoNewComponentCtor = () => {
  return new forgo.Component({
    render() {
      return (
        <>
          <>
            <div>1</div>
            <div>2</div>
          </>
          <>
            <div>3</div>
          </>
          <div>4</div>
        </>
      );
    },
  });
};

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<TestComponent />, window.document.getElementById("root"));
  });
}

export function runNested(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<NestedFragmentComponent />, window.document.getElementById("root"));
  });
}
