import should from "should";

import * as forgo from "../index.js";
import { run } from "./componentRunner.js";

import type { ForgoNewComponentCtor } from "../index.js";

const componentFactory = () => {
  const state: {
    parentEl: forgo.ForgoRef<HTMLDivElement>;
    idAttr: string | null;
    parentChildrenCount: number;
  } = { parentEl: {}, parentChildrenCount: 0, idAttr: null };
  const TestComponent = () => {
    const Child = () => {
      const component = new forgo.Component({
        render() {
          return <div>Hello world</div>;
        },
      });
      component.mount(() => {
        state.idAttr = state.parentEl.value!.getAttribute("id");
      });
      return component;
    };

    const component = new forgo.Component({
      render() {
        return (
          <div ref={state.parentEl} id="hello">
            <Child />
          </div>
        );
      },
    });
    component.mount(() => {
      state.parentChildrenCount = state.parentEl.value!.childNodes.length;
    });

    return component;
  };

  return { state, TestComponent };
};

const recursiveComponentFactory = () => {
  const state = {
    mountCount: 0,
    renderCount: 0,
  };

  const TestComponent = () => {
    const component = new forgo.Component({
      render() {
        state.renderCount += 1;
        return <div id="hello"></div>;
      },
    });
    component.mount(() => {
      state.mountCount += 1;
      component.update();
    });

    return component;
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

    it("doesn't fire twice if the component updates during mount", async () => {
      const { state, TestComponent } = recursiveComponentFactory();
      await run(() => <TestComponent />);

      should.equal(state.renderCount, 2);
      should.equal(state.mountCount, 1);
    });
  });
}
