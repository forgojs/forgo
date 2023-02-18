import should from "should";

import * as forgo from "../index.js";
import { run } from "./componentRunner.js";
import type { ForgoRef } from "../index.js";

// We should only call those pendingMounts after a component renders, not after
// elements render. I guess? Or maybe, only after component || array renders?

function componentFactory() {
  const state: {
    elementBoundAtMountTime: boolean | null;
  } = {
    elementBoundAtMountTime: null,
  };

  const TestComponent = () => {
    const el: ForgoRef<HTMLDivElement> = {};

    const component = new forgo.Component({
      render(_props) {
        return (
          <>
            <p>Ignore Me</p>
            <p ref={el}>Mount shouldn't fire until I'm created</p>
          </>
        );
      },
    });
    component.mount(() => {
      state.elementBoundAtMountTime = Boolean(el.value);
    });
    return component;
  };

  return {
    TestComponent,
    state,
  };
}

export default function () {
  describe("Fragment mount event", () => {
    it("doesn't fire until *all* of the fragment's children have been created", async () => {
      const { TestComponent, state } = componentFactory();
      await run(() => <TestComponent />);

      should.equal(state.elementBoundAtMountTime, true);
    });
  });
}
