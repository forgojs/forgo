import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

let component: forgo.Component;

export function renderAgain() {
  component.update();
}

export let currentNode: Element | undefined;
export let previousNode: Element | undefined;
export let counterX10 = 0;
export let mutatedProps: {
  [key: string]: boolean;
} = {};

const TestComponent: forgo.ForgoComponentCtor = () => {
  let counter: number = 0;

  const el: forgo.ForgoRef<HTMLDivElement> = {};
  mutatedProps = {};

  component = new forgo.Component({
    render() {
      counter++;
      return (
        <div id="hello" prop={counter === 1 ? "hello" : "world"} ref={el}>
          Hello world
        </div>
      );
    },
  });
  component.mount(() => {
    // Detect each time attributes are changed (after the first render)
    const observer = new window.MutationObserver((mutations) => {
      const elMutation = mutations.find(
        (mutation) => mutation.target === el.value
      );
      if (elMutation?.attributeName) {
        mutatedProps[elMutation.attributeName] = true;
      }
    });
    observer.observe(el.value!, { attributes: true });
  });
  component.afterRender((_props: any, previousNode, component) => {
    currentNode = component.__internal.element.node as Element;
    previousNode = previousNode as Element;
    counterX10 = counter * 10;
  });
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
