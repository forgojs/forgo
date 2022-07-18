import should from "should";

import * as forgo from "../index.js";
import { run } from "./componentRunner.js";
import type { ForgoComponentCtor, ForgoComponentProps } from "../index";

const componentFactory = () => {
  const state: {
    shouldRenderNull: boolean;
    internalState: string | null;
    renderedElement?: ChildNode;
    update: () => void;
    hasMounted: boolean;
    hasUnmounted: boolean;
  } = {
    shouldRenderNull: true,
    internalState: null,
    hasMounted: false,
    hasUnmounted: false,
    update: () => undefined,
  };

  const Component: ForgoComponentCtor<ForgoComponentProps> = () => {
    // We want to reassign this inside the component ctor closure to test that
    // the component doesn't get recreated when it stops rendering null
    state.internalState = Math.random().toString();

    return {
      mount() {
        state.hasMounted = true;
      },
      render(_props, args) {
        state.update = args.update;
        if (state.shouldRenderNull) {
          return null;
        } else {
          return <div>Internal state is {state.internalState}</div>;
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

    await run(() => <Component />);

    // Make sure that the first render mounts the component, even if it renders
    // null
    should.equal(state.hasMounted, true);
    should.equal(state.hasUnmounted, false);
    should.equal(state.renderedElement!.nodeType, 8);

    const internalState = state.internalState;
    // Sanity checks for rendering the randomized state
    should.equal(typeof internalState, "string");
    should.notEqual(internalState, "");

    state.shouldRenderNull = true;
    state.update();
    should.equal(state.hasUnmounted, false);
    should.equal(state.renderedElement!.nodeType, 8);

    state.shouldRenderNull = false;
    state.update();
    should.equal(state.hasUnmounted, false);
    should.equal(state.renderedElement!.nodeType, 1);
    const newInternalState = state.internalState;
    should.equal(newInternalState, internalState);
  });
}
