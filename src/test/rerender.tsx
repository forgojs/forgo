import should from "should";

import * as forgo from "../index.js";
import { run } from "./componentRunner.js";

import type {
  ForgoComponentCtor,
  ForgoComponentProps,
  ForgoRenderArgs,
} from "../index.js";
import type { ComponentEnvironment } from "./componentRunner.js";

const unmanagedNodeTagName = "article";

const Component: ForgoComponentCtor<
  ForgoComponentProps &
    ComponentEnvironment<{
      buttonElement: forgo.ForgoRef<HTMLButtonElement>;
      rootElement: forgo.ForgoRef<HTMLDivElement>;
      subrootElement: forgo.ForgoRef<HTMLDivElement>;
      pElement: forgo.ForgoRef<HTMLParagraphElement>;
      remove: () => void;
    }> & { insertionPosition?: "first" | "last" | number }
> = ({ document, exports, insertionPosition }) => {
  const addChild = (el: HTMLElement, tag: string) => {
    console.log("inserting bonus", insertionPosition);
    if (!insertionPosition) return;
    console.log("continuing");

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
    console.log("After prepend", el.outerHTML);
  };

  Object.assign(exports, {
    buttonElement: {} as forgo.ForgoRef<HTMLButtonElement>,
    rootElement: {} as forgo.ForgoRef<HTMLDivElement>,
    subrootElement: {} as forgo.ForgoRef<HTMLDivElement>,
    pElement: {} as forgo.ForgoRef<HTMLParagraphElement>,
  });

  let counter = 0;
  let insertAfterRender = true;

  return {
    afterRender() {
      console.log("Prepending, counter =", counter);
      if (!insertAfterRender) return;
      addChild(exports.rootElement.value!, "child-of-root");
      if (insertionPosition === "first") {
        addChild(exports.subrootElement.value!, "child-of-subroot");
      }
    },
    render(_props: any, { update }: ForgoRenderArgs) {
      function updateCounter() {
        counter++;
        update();
      }
      Object.assign(exports, {
        remove() {
          exports.rootElement
            .value!.querySelectorAll("[data-forgo]")
            .forEach((el) => el.remove());
          // The test that uses this asserts that all these nodes are gone, so
          // don't add one after we call update(). We have to call update() to
          // know that Forgo doesn't misbehave when nodes it saw before disappear.
          insertAfterRender = false;
          update();
        },
      });

      return (
        <div ref={exports.rootElement} id="root">
          <button
            onclick={updateCounter}
            ref={exports.buttonElement}
            id="button"
          >
            Click me!
          </button>
          <p id="p" ref={exports.pElement}>
            Clicked {counter} times
          </p>
          <div ref={exports.subrootElement} id="subRoot"></div>
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
        exports: { buttonElement },
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
    it("preserves children inserted with DOM APIs that are prepended to the front of the children list", async () => {
      const {
        exports: { buttonElement, rootElement, subrootElement },
      } = await run(Component, { insertionPosition: "first" as const });

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

    it("preserves children inserted with DOM APIs that are appended after of managed children", async () => {
      const {
        exports: { buttonElement, rootElement },
      } = await run(Component, { insertionPosition: "last" as const });

      should.equal(
        rootElement.value!.querySelectorAll('[data-forgo="child-of-root"]')
          .length,
        1,
        "Root element should have the appended element"
      );

      buttonElement.value!.click();

      console.log(rootElement.value!.innerHTML);
      should.equal(
        rootElement.value!.querySelectorAll('[data-forgo="child-of-root"]')
          .length,
        2,
        "Root element should have both appended elements"
      );
    });

    it("preserves children inserted with DOM APIs that inserted in the middle of managed children", async () => {
      const {
        exports: { buttonElement, rootElement },
      } = await run(Component, { insertionPosition: 2 });

      should.equal(
        rootElement.value!.querySelectorAll('[data-forgo="child-of-root"]')
          .length,
        1,
        "Root element should have the appended element"
      );

      buttonElement.value!.click();

      console.log(rootElement.value!.innerHTML);
      should.equal(
        rootElement.value!.querySelectorAll('[data-forgo="child-of-root"]')
          .length,
        2,
        "Root element should have both appended elements"
      );
    });

    it("doesn't add attributes to unmanaged elements", async () => {
      const {
        exports: { buttonElement, rootElement },
      } = await run(Component, { insertionPosition: 2 });

      const el = rootElement.value!.querySelector(
        '[data-forgo="child-of-root"]'
      )!;

      // Mutate the component to force it to interact with the unmanaged element
      // we added after the first render
      buttonElement.value!.click();

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
      const {
        exports: { rootElement, buttonElement, pElement, subrootElement },
      } = await run(Component, { insertionPosition: 2 });

      // Mutate the component to force it to interact with the unmanaged element
      // we added after the first render
      buttonElement.value!.click();

      [buttonElement, pElement, subrootElement].forEach((el) =>
        should.notEqual(el.value!.tagName, unmanagedNodeTagName)
      );

      // Same test as above, but pull the elements out of the live DOM. This
      // covers if there's any case where Forgo mis-transforms the elements
      // without updating the ref.
      [
        rootElement.value!.querySelector("#button"),
        rootElement.value!.querySelector("#p"),
        rootElement.value!.querySelector("#subRoot"),
      ].forEach((el) => {
        should.exist(el);
        should.notEqual(el!.tagName, unmanagedNodeTagName);
      });
    });

    it("leaves managed nodes alone when an unmanaged node is removed from the DOM", async () => {
      const { exports } = await run(Component, { insertionPosition: 2 });
      const { rootElement, buttonElement } = exports;

      // Sanity check that our tests are correctly identifying unmanaged nodes
      // before testing their removal
      should.notEqual(
        rootElement.value!.querySelectorAll("[data-forgo]").length,
        0
      );
      // Mutate the component to force it to interact with the unmanaged element
      // we added after the first render
      buttonElement.value!.click();
      exports.remove();

      // All unmanaged nodes are gone
      should.equal(
        rootElement.value!.querySelectorAll("[data-forgo]").length,
        0
      );

      // All managed nodes still exist
      [
        rootElement.value!.querySelector("#button"),
        rootElement.value!.querySelector("#p"),
        rootElement.value!.querySelector("#subRoot"),
      ].forEach((el) => {
        should.exist(el);
        should.notEqual(el!.tagName, unmanagedNodeTagName);
      });
    });
  });
}
