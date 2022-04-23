import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import {
  ForgoRenderArgs,
  ForgoAfterRenderArgs,
  mount,
  setCustomEnv,
} from "../../index.js";

let window: DOMWindow;
let document: Document;

let renderArgs: ForgoRenderArgs<{}>;

export function renderAgain() {
  renderArgs.update();
}

export let currentNode: Element | undefined;
export let previousNode: Element | undefined;
export let counterX10: number;

function Component() {
  let counter: number = 0;
  return {
    render(props: any, args: ForgoRenderArgs<{}>) {
      renderArgs = args;
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
    afterRender(props: any, args: ForgoAfterRenderArgs<{}>) {
      currentNode = args.element.node as Element;
      previousNode = args.previousNode as Element;
      counterX10 = counter * 10;
    },
  };
}

function ComponentOnTextNode() {
  let counter: number = 0;
  return {
    render(props: any, args: ForgoRenderArgs<{}>) {
      renderArgs = args;
      counter++;
      return "Hello world";
    },
    afterRender(props: any, args: ForgoAfterRenderArgs<{}>) {
      currentNode = args.element.node as Element;
      previousNode = args.previousNode as Element;
      counterX10 = counter * 10;
    },
  };
}

function ComponentWithRef() {
  const ref: forgo.ForgoRef<HTMLDivElement> = {};
  return {
    render() {
      return <div ref={ref} />;
    },
    afterRender(_props: any, args: ForgoAfterRenderArgs<{}>) {
      currentNode = args.element.node as Element;
    },
  };
}
function ComponentWithDangerouslySetInnerHTML() {
  return {
    render() {
      return <div dangerouslySetInnerHTML={{ __html: "<div></div>" }} />;
    },
    afterRender(_props: any, args: ForgoAfterRenderArgs<{}>) {
      currentNode = args.element.node as Element;
    },
  };
}

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<Component />, window.document.getElementById("root"));
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
