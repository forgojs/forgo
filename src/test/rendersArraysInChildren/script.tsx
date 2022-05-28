import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

const someIntegers = [1, 2, 3, 4];

const BasicComponent: forgo.ForgoComponentCtor = () => {
  return new forgo.Component({
    render() {
      return (
        <div>
          Hello world
          {someIntegers.map((i) => (
            <p>{i}</p>
          ))}
        </div>
      );
    },
  });
};

export function runArrays(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<BasicComponent />, document.getElementById("root"));
  });
}

const BasicComponentNested: forgo.ForgoComponentCtor = () => {
  return new forgo.Component({
    render() {
      return (
        <div>
          Hello world
          {someIntegers.map((i) => [[[<p>{i}</p>]]])}
        </div>
      );
    },
  });
};

export function runNestedArrays(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<BasicComponentNested />, document.getElementById("root"));
  });
}
