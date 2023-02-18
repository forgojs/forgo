import should from "should";

import * as forgo from "../index.js";
import { run } from "./componentRunner.js";
import type { ForgoRef } from "../index.js";

function componentFactory() {
  const state: {
    buttonElement: ForgoRef<HTMLButtonElement>;
  } = {
    buttonElement: {},
  };

  const TestComponent = () => {
    let counter = 0;
    let insertAfterRender = true;

    const component = new forgo.Component<{}>({
      render(_props, component) {
        function updateCounter() {
          counter++;
          component.update();
        }

        return (
          <div id="root">
            <button
              onclick={updateCounter}
              ref={state.buttonElement}
              id="button"
            >
              Click me!
            </button>
            <p id="p">Clicked {counter} times</p>
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
      const { window } = await run((env) => <Component />);

      buttonElement.value!.click();
      buttonElement.value!.click();
      buttonElement.value!.click();

      window.document.body.innerHTML.should.containEql("Clicked 3 times");
    });
  });
}
