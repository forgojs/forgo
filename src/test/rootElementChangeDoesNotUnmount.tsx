import should from "should";
import * as forgo from "../index.js";
import { run } from "./componentRunner.js";
import type { ForgoRenderArgs } from "../index.js";

let unmountCount = 0;
let renderCount = 0;
let renderArgs: ForgoRenderArgs;

function Component() {
  function Child() {
    return {
      render(props: any, args: ForgoRenderArgs) {
        renderCount++;
        if (renderCount % 2 === 0) {
          return <div>This is a div</div>;
        } else {
          return <p>But this is a paragraph</p>;
        }
      },
      unmount() {
        unmountCount++;
      },
    };
  }

  return {
    render(props: any, args: ForgoRenderArgs) {
      renderArgs = args;
      return (
        <section>
          <Child />
        </section>
      );
    },
  };
}

export default function () {
  describe("root element changes", () => {
    it("does not unmount", async () => {
      await run(() => <Component />);

      renderArgs.update();
      renderArgs.update();
      renderArgs.update();
      renderArgs.update();
      renderArgs.update();

      renderCount.should.equal(6);
      unmountCount.should.equal(0);
    });
  });
}
