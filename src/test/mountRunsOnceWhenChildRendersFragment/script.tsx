import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;
let counter = 0;

let component: forgo.Component<forgo.ForgoComponentProps>;
export let mountCounter: number = 0;

export function renderAgain() {
  component.update();
}

const TestComponent: forgo.ForgoComponentCtor<
  forgo.ForgoComponentProps
> = () => {
  component = new forgo.Component({
    render() {
      counter++;
      return <SuperCompo />;
    },
  });
  component.addEventListener("mount", () => {
    mountCounter++;
  });
  return component;
};

const SuperCompo: forgo.ForgoComponentCtor<forgo.ForgoComponentProps> = () => {
  return new forgo.Component({
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
