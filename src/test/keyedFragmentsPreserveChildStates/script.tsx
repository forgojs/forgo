import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

export function renderAgain() {
  elementOrder = !elementOrder;
  component.update();
}

let component: forgo.Component<forgo.ForgoComponentProps>;
let elementOrder = true;
const Parent: forgo.ForgoComponentCtor<forgo.ForgoComponentProps> = () => {
  component = new forgo.Component({
    render() {
      const keys = elementOrder
        ? ["first-child", "second-child"]
        : ["second-child", "first-child"];

      return (
        <>
          <Child key={keys[0]} />
          <Child key={keys[1]} />
          <Child key="last-child" />
        </>
      );
    },
  });
  return component;
};

interface ChildProps {
  key?: unknown;
}
const Child: forgo.ForgoComponentCtor<
  forgo.ForgoComponentProps & ChildProps
> = () => {
  const state = Math.random().toString();

  return new forgo.Component<forgo.ForgoComponentProps & ChildProps>({
    render(props) {
      return (
        <>
          <p
            class="stateful-grandchild"
            data-state={state}
            data-key={props.key}
          >
            Hello, world!
          </p>
          {props.key ? <Child /> : null}
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
    mount(<Parent />, window.document.getElementById("root"));
  });
}
