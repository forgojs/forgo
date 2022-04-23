import "should";
import * as forgo from "../index.js";
import { run } from "./componentRunner.js";
import type { ForgoRenderArgs } from "../index.js";

function componentFactory() {
  const state: {
    counter: number;
    hasUnmounted: boolean;
    rerender: (() => void) | undefined;
  } = {
    counter: 0,
    hasUnmounted: false,
    rerender: undefined,
  };

  function Component() {
    state.rerender = rerender;

    let renderArgs: ForgoRenderArgs<{}> | undefined = undefined;

    function ChildComponent() {
      return {
        mount(props: any, args: ForgoRenderArgs<{}>) {
          args.component.unmount = () => {
            state.hasUnmounted = true;
          };
        },
        render() {
          return <div>Hello world</div>;
        },
      };
    }

    function rerender() {
      renderArgs?.update();
    }

    return {
      render(props: any, args: any) {
        renderArgs = args;
        state.counter++;
        if (state.counter === 1) {
          return (
            <div>
              <ChildComponent />
            </div>
          );
        } else {
          return <div>Child component has been unmounted</div>;
        }
      },
    };
  }

  return {
    Component,
    state,
  };
}

export default function () {
  describe("runtime lifecycle events", () => {
    it("modifies a lifecycle event", async () => {
      const { Component, state } = componentFactory();
      await run(() => <Component />);
      state.rerender?.();
      state.hasUnmounted.should.be.true();
    });
  });
}
