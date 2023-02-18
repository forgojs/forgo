import should from "should";

import * as forgo from "../index.js";
import { run } from "./componentRunner.js";

function componentFactory() {
  const state: {
    component: forgo.Component<{}> | null;
    parent1Unmounted: boolean;
    parent2Unmounted: boolean;
    childUnmounted: boolean;
  } = {
    component: null,
    parent1Unmounted: false,
    parent2Unmounted: false,
    childUnmounted: false,
  };

  const Parent1 = () => {
    const component = new forgo.Component({
      render() {
        return <Parent2 />;
      },
    });
    component.unmount(() => {
      state.parent1Unmounted = true;
    });
    return component;
  };

  const Parent2 = () => {
    const component = new forgo.Component({
      render() {
        return <Child />;
      },
    });
    component.unmount(() => {
      state.parent2Unmounted = true;
    });
    return component;
  };

  const Child = () => {
    let counter = 0;
    state.component = new forgo.Component({
      render() {
        counter++;
        return counter === 1 ? <div>This is a child node.</div> : <></>;
      },
    });
    state.component.unmount(() => {
      state.childUnmounted = true;
    });
    return state.component;
  };

  return {
    Component: Parent1,
    state,
  };
}

export default function () {
  it("rerender may unmount parents", async () => {
    const { Component, state } = componentFactory();
    await run(() => <Component />);

    state.component!.update();

    should.equal(state.parent1Unmounted, true);
    should.equal(state.parent2Unmounted, true);
    should.equal(state.childUnmounted, true);
  });
}
