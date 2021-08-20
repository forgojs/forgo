import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: HTMLDocument;

const someIntegers = [1, 2, 3, 4];

function BasicComponent() {
  return {
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
  };
}

export function runArrays(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<BasicComponent />, document.getElementById("root"));
  });
}

function BasicComponentNested() {
  return {
    render() {
      return (
        <div>
          Hello world
          {someIntegers.map((i) => [[[<p>{i}</p>]]])}
        </div>
      );
    },
  };
}

export function runNestedArrays(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<BasicComponentNested />, document.getElementById("root"));
  });
}
