import should from "should";

import * as forgo from "../index.js";
import { run } from "./componentRunner.js";
import type { ForgoComponentCtor, ForgoComponentProps } from "../index";

let renderCount = 0;

const componentFactory = () => {
  const state: {
    renderedElement?: ChildNode;
    update: () => void;
    hasUnmounted: boolean;
  } = { hasUnmounted: false, update: () => undefined };

  const Component: ForgoComponentCtor<ForgoComponentProps> = () => {
    // We keep this inside the component ctor closure to test that the component
    // doesn't get recreated when it stops rendering null
    const internalState = Math.random().toString();

    return {
      render(_props, args) {
        state.update = args.update;
        renderCount += 1;
        if (renderCount % 2 === 0) {
          return null;
        } else {
          return <div>Internal state is {internalState}</div>;
        }
      },
      afterRender(_props, args) {
        state.renderedElement = args.element.node!;
      },
      unmount() {
        state.hasUnmounted = true;
      },
    };
  };
  return { state, Component };
};

export default function () {
  it("does not unmount parent when render returns null", async () => {
    const { Component, state } = componentFactory();

    const { document } = await run(() => <Component />);

    const internalStateText = state.renderedElement!.textContent;
    // Sanity checks
    should.equal(typeof internalStateText, "string");
    should.notEqual(internalStateText, "");

    state.update();
    should.equal(state.hasUnmounted, false);
    should.equal(state.renderedElement!.nodeType, 8);

    state.update();
    should.equal(state.hasUnmounted, false);
    should.equal(state.renderedElement!.nodeType, 1);
    const newInternalStateText = state.renderedElement!.textContent;
    should.equal(newInternalStateText, internalStateText);
  });
}
