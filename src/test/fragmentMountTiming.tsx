import should from "should";

import * as forgo from "../index.js";
import { run } from "./componentRunner.js";
import type {
  ForgoRef,
  ForgoComponentCtor,
  ForgoComponentProps,
} from "../index.js";

// We should only call those pendingMounts after a component renders, not after
// elements render. I guess? Or maybe, only after component || array renders?

function componentFactory() {
  const state: {
    elementBoundAtMountTime: boolean | null;
  } = {
    elementBoundAtMountTime: null,
  };

  const TestComponent: ForgoComponentCtor<ForgoComponentProps> = () => {
    const el: ForgoRef<HTMLDivElement> = {};

    return {
      mount(_props) {
        state.elementBoundAtMountTime = Boolean(el.value);
      },

      render(_props) {
        return (
          <>
            <p>Ignore Me</p>
            <p ref={el}>Mount shouldn't fire until I'm created</p>
          </>
        );
      },
    };
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
