import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv, Component } from "../../index.js";

let window: DOMWindow;
let document: Document;

let component: Component<forgo.ForgoComponentProps>;

export function renderAgain() {
  component.update();
}

export let currentNode: ChildNode | undefined;
export let previousNode: ChildNode | undefined;
export let counterX10: number;

const TestComponent: forgo.ForgoComponentCtor<
  forgo.ForgoComponentProps
> = () => {
  let counter: number = 0;
  component = new Component({
    render() {
      counter++;
      return counter === 1 ? (
        <div id="hello" prop="hello">
          Hello world
        </div>
      ) : (
        <p id="hello" prop="world">
          Hello world
        </p>
      );
    },
  });
  component.addEventListener(
    "afterRender",
    (_props, previousNode_, component) => {
      currentNode = component.__internal.element.node;
      previousNode = previousNode_;
      counterX10 = counter * 10;
    }
  );
  return component;
};

function ComponentOnTextNode() {
  let counter: number = 0;
  component = new Component({
    render() {
      counter++;
      return "Hello world";
    },
  });
  component.addEventListener(
    "afterRender",
    (_props, previousNode_, component) => {
      currentNode = component.__internal.element.node;
      previousNode = previousNode_;
      counterX10 = counter * 10;
    }
  );
  return component;
}

const ComponentWithRef: forgo.ForgoComponentCtor<
  forgo.ForgoComponentProps
> = () => {
  const ref: forgo.ForgoRef<HTMLDivElement> = {};
  const component = new forgo.Component({
    render() {
      return <div ref={ref} />;
    },
  });
  component.addEventListener(
    "afterRender",
    (_props, _previousNode, component) => {
      currentNode = component.__internal.element.node;
    }
  );
  return component;
};

const ComponentWithDangerouslySetInnerHTML: forgo.ForgoComponentCtor<
  forgo.ForgoComponentProps
> = () => {
  const component = new forgo.Component({
    render() {
      return <div dangerouslySetInnerHTML={{ __html: "<div></div>" }} />;
    },
  });
  component.addEventListener(
    "afterRender",
    (_props, _previousNode, component) => {
      currentNode = component.__internal.element.node;
    }
  );
  return component;
};

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<TestComponent />, window.document.getElementById("root"));
  });
}

export function runWithTextNode(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<ComponentOnTextNode />, window.document.getElementById("root"));
  });
}

export function runWithRef(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<ComponentWithRef />, window.document.getElementById("root"));
  });
}
export function runWithDangerouslySetInnerHtml(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(
      <ComponentWithDangerouslySetInnerHTML />,
      window.document.getElementById("root")
    );
  });
}
