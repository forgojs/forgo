import should from "should";

import * as forgo from "../index.js";
import { run } from "./componentRunner.js";

import type { ForgoComponentCtor, ForgoComponentProps } from "../index.js";
import type { ComponentEnvironment } from "./componentRunner.js";

const TestComponent: ForgoComponentCtor<
  ForgoComponentProps &
    ComponentEnvironment<{
      parentEl: forgo.ForgoRef<HTMLDivElement>;
      idAttr: string | null;
      parentChildrenCount: number;
    }>
> = ({ exports }) => {
  const Child: ForgoComponentCtor<ForgoComponentProps> = () => {
    return {
      mount() {
        exports.idAttr = exports.parentEl.value!.getAttribute("id");
      },
      render() {
        return <div>Hello world</div>;
      },
    };
  };

  exports.parentEl = {};
  return {
    mount() {
      exports.parentChildrenCount = exports.parentEl.value!.childNodes.length;
    },
    render() {
      return (
        <div ref={exports.parentEl} id="hello">
          <Child />
        </div>
      );
    },
  };
};

export default function () {
  describe("Component mount event", async () => {
    it("runs mount() when a component is attached to node", async () => {
      const { exports } = await run(TestComponent, {});

      should.equal(exports.parentEl.value!.id, "hello");
    });

    it("renders the parent's attributes before calling the child's mount()", async () => {
      const { exports } = await run(TestComponent, {});

      should.equal(exports.idAttr, "hello");
    });

    it("renders all descendants before calling the parent's mount()", async () => {
      const { exports } = await run(TestComponent, {});

      should.equal(exports.parentChildrenCount, 1);
    });
  });
}
