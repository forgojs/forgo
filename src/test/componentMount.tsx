import should from "should";

import * as forgo from "../index.js";
import { run } from "./componentRunner.js";

import type { ForgoComponentCtor, ForgoComponentProps } from "../index.js";
import type { ComponentEnvironment } from "./componentRunner.js";

const componentFactory = () => {
  const state: {
    parentEl: forgo.ForgoRef<HTMLDivElement>;
    idAttr: string | null;
    parentChildrenCount: number;
  } = { parentEl: {}, parentChildrenCount: 0, idAttr: null };
  const TestComponent: ForgoComponentCtor<ForgoComponentProps> = () => {
    const Child: ForgoComponentCtor<ForgoComponentProps> = () => {
      return {
        mount() {
          state.idAttr = state.parentEl.value!.getAttribute("id");
        },
        render() {
          return <div>Hello world</div>;
        },
      };
    };

    return {
      mount() {
        state.parentChildrenCount = state.parentEl.value!.childNodes.length;
      },
      render() {
        return (
          <div ref={state.parentEl} id="hello">
            <Child />
          </div>
        );
      },
    };
  };

  return { state, TestComponent };
};

export default function () {
  describe("Component mount event", async () => {
    it("runs mount() when a component is attached to node", async () => {
      const { state, TestComponent } = componentFactory();
      await run(() => <TestComponent />);

      should.equal(state.parentEl.value!.id, "hello");
    });

    it("renders the parent's attributes before calling the child's mount()", async () => {
      const { state, TestComponent } = componentFactory();
      await run(() => <TestComponent />);

      should.equal(state.idAttr, "hello");
    });

    it("renders all descendants before calling the parent's mount()", async () => {
      const { state, TestComponent } = componentFactory();
      await run(() => <TestComponent />);

      should.equal(state.parentChildrenCount, 1);
    });
  });
}
