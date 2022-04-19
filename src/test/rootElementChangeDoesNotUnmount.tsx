import should from "should";
import * as forgo from "../index.js";
import { ComponentEnvironment, run } from "./componentRunner.js";
import type {
  ForgoComponentCtor,
  ForgoComponentProps,
  ForgoRenderArgs,
} from "../index.js";

const Component: ForgoComponentCtor<
  ForgoComponentProps &
    ComponentEnvironment<{
      renderArgs: ForgoRenderArgs;
      renderCount: number;
      unmountCount: number;
    }> & {}
> = ({ exports }) => {
  exports.unmountCount = 0;
  exports.renderCount = 0;

  function Child() {
    return {
      render(props: any, args: ForgoRenderArgs) {
        exports.renderCount++;
        if (exports.renderCount % 2 === 0) {
          return <div>This is a div</div>;
        } else {
          return <p>But this is a paragraph</p>;
        }
      },
      unmount() {
        exports.unmountCount++;
      },
    };
  }

  return {
    render(props: any, args: ForgoRenderArgs) {
      exports.renderArgs = args;
      return (
        <section>
          <Child />
        </section>
      );
    },
  };
};

export default function () {
  describe("root element changes", () => {
    it("does not unmount", async () => {
      const { window, exports } = await run(Component, {});

      exports.renderArgs.update();
      exports.renderArgs.update();
      exports.renderArgs.update();
      exports.renderArgs.update();
      exports.renderArgs.update();

      exports.renderCount.should.equal(6);
      exports.unmountCount.should.equal(0);
    });
  });
}
