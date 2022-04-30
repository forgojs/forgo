import should from "should";

import * as forgo from "../index.js";
import { run } from "./componentRunner.js";
import type { ForgoRef, ForgoRenderArgs } from "../index.js";
import { DOMWindow } from "jsdom";

const unmanagedNodeTagName = "article";

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
  const TestComponent: forgo.ForgoComponentCtor<
    forgo.ForgoComponentProps & TestComponentProps
  > = (props) => {
    let counter = 0;
    let insertAfterRender = true;
    const { insertionPosition, document } = props;

    const addChild = (el: HTMLElement, tag: string) => {
      if (!insertionPosition) return;

      // We create an <article> so that it's very obvious if a bug causes forgo to
      // treat the node as a managed dom node and transform its props/children
      const newElement = document.createElement(unmanagedNodeTagName);
      newElement.setAttribute("data-forgo", tag);
      switch (insertionPosition) {
        case "first":
          el.prepend(newElement);
          break;
        case "last":
          el.append(newElement);
          break;
        default:
          el.insertBefore(
            newElement,
            Array.from(el.childNodes)[insertionPosition]
          );
      }
    };

    const component = new forgo.Component<
      forgo.ForgoComponentProps & TestComponentProps
    >({
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
    component.addEventListener("afterRender", () => {
      if (!insertAfterRender) return;
      addChild(state.rootElement.value!, "child-of-root");
      if (insertionPosition === "first") {
        addChild(state.subrootElement.value!, "child-of-subroot");
      }
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

    /**
     * When a consuming application uses the DOM APIs to add children to an
     * element, those children should be left in place after rendering if they're
     * not specified as part of the JSX.
     */
    it("preserves children inserted with DOM APIs that are prepended to the front of the children list", async () => {
      const { Component, state } = componentFactory();

      await run((env) => (
        <Component insertionPosition={"first" as const} {...env} />
      ));

      should.equal(state.subrootElement.value!.children.length, 1);
      should.equal(
        state.rootElement.value!.querySelectorAll(
          '[data-forgo="child-of-root"]'
        ).length,
        1,
        "Root element should have the appended element"
      );

      state.buttonElement.value!.click();

      should.equal(state.subrootElement.value!.children.length, 2);
      should.equal(
        state.rootElement.value!.querySelectorAll(
          '[data-forgo="child-of-root"]'
        ).length,
        2,
        "Root element should have both appended elements"
      );
    });

    it("preserves children inserted with DOM APIs that are appended after of managed children", async () => {
      const { Component, state } = componentFactory();

      await run((env) => (
        <Component insertionPosition={"last" as const} {...env} />
      ));

      should.equal(
        state.rootElement.value!.querySelectorAll(
          '[data-forgo="child-of-root"]'
        ).length,
        1,
        "Root element should have the appended element"
      );

      state.buttonElement.value!.click();

      should.equal(
        state.rootElement.value!.querySelectorAll(
          '[data-forgo="child-of-root"]'
        ).length,
        2,
        "Root element should have both appended elements"
      );
    });

    it("preserves children inserted with DOM APIs that inserted in the middle of managed children", async () => {
      const { Component, state } = componentFactory();

      await run((env) => <Component insertionPosition={2} {...env} />);

      should.equal(
        state.rootElement.value!.querySelectorAll(
          '[data-forgo="child-of-root"]'
        ).length,
        1,
        "Root element should have the appended element"
      );

      state.buttonElement.value!.click();

      should.equal(
        state.rootElement.value!.querySelectorAll(
          '[data-forgo="child-of-root"]'
        ).length,
        2,
        "Root element should have both appended elements"
      );
    });

    it("doesn't add attributes to unmanaged elements", async () => {
      const { Component, state } = componentFactory();

      await run((env) => <Component insertionPosition={2} {...env} />);

      const el = state.rootElement.value!.querySelector(
        '[data-forgo="child-of-root"]'
      )!;

      // Mutate the component to force it to interact with the unmanaged element
      // we added after the first render
      state.buttonElement.value!.click();

      should.equal(Array.from(el.attributes).length, 1);
      const [{ name: attrName, value: attrValue }] = Array.from(el.attributes);
      should.deepEqual([attrName, attrValue], ["data-forgo", "child-of-root"]);
    });

    /**
     * If we mess up the algorithm for ignoring unmanaged nodes, what happens is
     * forgo identifies an unmanaged node as a replacement candidate for a
     * managed node and syncs its attrs/children onto the unmanaged node. So
     * here, we're basically checking that all elements mangaged by forgo still
     * have the tag they're supposed to have. This works because our test
     * component makes the unmanaged nodes a different tag name than any of the
     * managed nodes.
     */
    it("doesn't convert an unmanaged element into a managed element", async () => {
      const { Component, state } = componentFactory();

      await run((env) => <Component insertionPosition={2} {...env} />);

      // Mutate the component to force it to interact with the unmanaged element
      // we added after the first render
      state.buttonElement.value!.click();

      [state.buttonElement, state.pElement, state.subrootElement].forEach(
        (el) => should.notEqual(el.value!.tagName, unmanagedNodeTagName)
      );

      // Same test as above, but pull the elements out of the live DOM. This
      // covers if there's any case where Forgo mis-transforms the elements
      // without updating the ref.
      [
        state.rootElement.value!.querySelector("#button"),
        state.rootElement.value!.querySelector("#p"),
        state.rootElement.value!.querySelector("#subRoot"),
      ].forEach((el) => {
        should.exist(el);
        should.notEqual(el!.tagName, unmanagedNodeTagName);
      });
    });

    it("leaves managed nodes alone when an unmanaged node is removed from the DOM", async () => {
      const { Component, state } = componentFactory();

      await run((env) => <Component insertionPosition={2} {...env} />);

      // Sanity check that our tests are correctly identifying unmanaged nodes
      // before testing their removal
      should.notEqual(
        state.rootElement.value!.querySelectorAll("[data-forgo]").length,
        0
      );
      // Mutate the component to force it to interact with the unmanaged element
      // we added after the first render
      state.buttonElement.value!.click();
      state.remove();

      // All unmanaged nodes are gone
      should.equal(
        state.rootElement.value!.querySelectorAll("[data-forgo]").length,
        0
      );

      // All managed nodes still exist
      [
        state.rootElement.value!.querySelector("#button"),
        state.rootElement.value!.querySelector("#p"),
        state.rootElement.value!.querySelector("#subRoot"),
      ].forEach((el) => {
        should.exist(el);
        should.notEqual(el!.tagName, unmanagedNodeTagName);
      });
    });
  });
}
