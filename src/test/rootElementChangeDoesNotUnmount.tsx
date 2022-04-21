import should from "should";
import * as forgo from "../index.js";
import { run } from "./componentRunner.js";
import type { ForgoRenderArgs } from "../index.js";

function componentFactory() {
  const state = {
    unmountCount: 0,
    renderCount: 0,
    renderArgs: undefined as ForgoRenderArgs | undefined,
  };

  function Component() {
    function Child() {
      return {
        render(props: any, args: ForgoRenderArgs) {
          state.renderCount++;
          if (state.renderCount % 2 === 0) {
            return <div>This is a div</div>;
          } else {
            return <p>But this is a paragraph</p>;
          }
        },
        unmount() {
          state.unmountCount++;
        },
      };
    }

    return {
      render(props: any, args: ForgoRenderArgs) {
        state.renderArgs = args;
        return (
          <section>
            <Child />
          </section>
        );
      },
    };
  }

  return {
    Component,
    state,
  };
}

export default function () {
  describe("root element changes", () => {
    it("does not unmount", async () => {
      const { Component, state } = componentFactory();
      await run(() => <Component />);

      state.renderArgs!.update();
      state.renderArgs!.update();
      state.renderArgs!.update();
      state.renderArgs!.update();
      state.renderArgs!.update();

      state.renderCount.should.equal(6);
      state.unmountCount.should.equal(0);
    });
  });
}
