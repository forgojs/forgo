import should from "should";

import * as forgo from "../index.js";
import { run } from "./componentRunner.js";
import type { ForgoRef } from "../index.js";
import { DOMWindow } from "jsdom";

function componentFactory() {
  const state: {
    buttonElement: ForgoRef<HTMLButtonElement>;
    rootElement: ForgoRef<HTMLDivElement>;
    subrootElement: ForgoRef<HTMLDivElement>;
    pElement: ForgoRef<HTMLParagraphElement>;
    remove: () => void;
  } = {
    buttonElement: {},
    rootElement: {},
    subrootElement: {},
    pElement: {},
    remove: () => {},
  };

  interface TestComponentProps {
    insertionPosition?: "first" | "last" | number;
    window: DOMWindow;
    document: Document;
  }
  const TestComponent: forgo.ForgoNewComponentCtor<TestComponentProps> = (
    props
  ) => {
    let counter = 0;
    let insertAfterRender = true;
    const { insertionPosition, document } = props;

    const component = new forgo.Component<TestComponentProps>({
      render(_props, component) {
        function updateCounter() {
          counter++;
          component.update();
        }
        state.remove = () => {
          state.rootElement
            .value!.querySelectorAll("[data-forgo]")
            .forEach((el) => el.remove());
          // The test that uses this asserts that all these nodes are gone, so
          // don't add one after we call update(). We have to call update() to
          // know that Forgo doesn't misbehave when nodes it saw before disappear.
          insertAfterRender = false;
          component.update();
        };

        return (
          <div ref={state.rootElement} id="root">
            <button
              onclick={updateCounter}
              ref={state.buttonElement}
              id="button"
            >
              Click me!
            </button>
            <p id="p" ref={state.pElement}>
              Clicked {counter} times
            </p>
            <div ref={state.subrootElement} id="subRoot"></div>
          </div>
        );
      },
    });

    return component;
  };

  return {
    Component: TestComponent,
    state,
  };
}

export default function () {
  describe("rerendering", () => {
    it("rerenders", async () => {
      const {
        Component,
        state: { buttonElement },
      } = componentFactory();
      const { window } = await run((env) => <Component {...env} />);

      buttonElement.value!.click();
      buttonElement.value!.click();
      buttonElement.value!.click();

      window.document.body.innerHTML.should.containEql("Clicked 3 times");
    });
  });
}
