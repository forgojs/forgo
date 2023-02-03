import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

let component: forgo.Component;
let firstRun = true;

export function renderAgain() {
  firstRun = false;
  component.update();
}

export let remounted = false;

const BasicComponent: forgo.ForgoNewComponentCtor = () => {
  component = new forgo.Component({
    render() {
      return firstRun ? <div>Hello world</div> : <p>Hello world</p>;
    },
  });

  component.remount(() => {
    remounted = true;
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

export function runQuerySelector(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<BasicComponent />, "#root");
  });
}
