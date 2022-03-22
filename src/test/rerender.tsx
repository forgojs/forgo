import should from "should";

import * as forgo from "../index.js";
import { run } from "./componentRunner.js";

import type {
  ForgoComponentCtor,
  ForgoComponentProps,
  ForgoRenderArgs,
} from "../index.js";
import type { ComponentEnvironment } from "./componentRunner.js";

const Component: ForgoComponentCtor<
  ForgoComponentProps &
    ComponentEnvironment<{
      buttonElement: forgo.ForgoRef<HTMLButtonElement>;
      rootElement: forgo.ForgoRef<HTMLDivElement>;
      subrootElement: forgo.ForgoRef<HTMLDivElement>;
      pElement: forgo.ForgoRef<HTMLParagraphElement>;
    }>
> = ({ document, exfiltratedValues }) => {
  const addChild = (el: HTMLElement, tag: string) => {
    const newElement = document.createElement("article");
    newElement.setAttribute("data-forgo", tag);
    el.prepend(newElement);
    console.log("After prepend", el.outerHTML);
  };

  Object.assign(exfiltratedValues, {
    buttonElement: {} as forgo.ForgoRef<HTMLButtonElement>,
    rootElement: {} as forgo.ForgoRef<HTMLDivElement>,
    subrootElement: {} as forgo.ForgoRef<HTMLDivElement>,
    pElement: {} as forgo.ForgoRef<HTMLParagraphElement>,
  });

  let counter = 0;

  return {
    afterRender() {
      console.log("Prepending, counter =", counter);
      addChild(exfiltratedValues.rootElement.value!, "child-of-root");
      addChild(exfiltratedValues.subrootElement.value!, "child-of-subroot");
    },
    render(_props: any, { update }: ForgoRenderArgs) {
      function updateCounter() {
        counter++;
        update();
      }

      return (
        <div ref={exfiltratedValues.rootElement} data-forgo="root">
          <button onclick={updateCounter} ref={exfiltratedValues.buttonElement}>
            Click me!
          </button>
          <p ref={exfiltratedValues.pElement}>Clicked {counter} times</p>
          <div
            ref={exfiltratedValues.subrootElement}
            data-forgo="subRoot"
          ></div>
        </div>
      );
    },
  };
};

export default function () {
  describe("rerendering", () => {
    it("rerenders", async () => {
      const {
        window,
        exfiltratedValues: { buttonElement },
      } = await run(Component, {});

      buttonElement.value!.click();
      buttonElement.value!.click();
      buttonElement.value!.click();

      window.document.body.innerHTML.should.containEql("Clicked 3 times");
    });

    /**
     * When a consuming application uses the DOM APIs to add children to an
     * element, those children should be left in place after rendering if they're
     * not specified as part of the JSX.
     */
    it("preserves children inserted with DOM APIs", async () => {
      const {
        exfiltratedValues: { buttonElement, rootElement, subrootElement },
      } = await run(Component, {});

      should.equal(subrootElement.value!.children.length, 1);
      should.equal(
        rootElement.value!.querySelectorAll('[data-forgo="child-of-root"]')
          .length,
        1,
        "Root element should have the appended element"
      );

      buttonElement.value!.click();

      console.log(rootElement.value!.innerHTML);
      should.equal(subrootElement.value!.children.length, 2);
      should.equal(
        rootElement.value!.querySelectorAll('[data-forgo="child-of-root"]')
          .length,
        2,
        "Root element should have both appended elements"
      );
    });
  });
}
