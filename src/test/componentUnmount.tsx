import should from "should";

import * as forgo from "../index.js";
import { run } from "./componentRunner.js";

const componentFactory = () => {
  const state = {
    parentUnmounts: 0,
    childUnmounts: 0,
    component: null as forgo.Component | null,
  };

  const Parent = () => {
    let firstRender = true;

    state.component = new forgo.Component({
      render() {
        if (firstRender) {
          firstRender = false;
          return <Child />;
        } else {
          return <div>The child should have unmounted.</div>;
        }
      },
    });

    state.component.unmount(() => {
      state.parentUnmounts += 1;
    });
    return state.component;
  };

  const Child = () => {
    const component = new forgo.Component({
      render() {
        return <div>This is the child component</div>;
      },
    });
    component.unmount(() => {
      state.childUnmounts += 1;
    });
    return component;
  };

  return { state, TestComponent: Parent };
};

export default function () {
  it("runs unmount() when a child component goes away", async () => {
    const { state, TestComponent } = componentFactory();
    await run(() => <TestComponent />);

    state.component!.update();

    should.equal(state.childUnmounts, 1);
  });

  it("unmounts the component tree when forgo.unmount() is called", async () => {
    const { state, TestComponent } = componentFactory();
    // Use a fragment to be sure we handle unmounting more than one root component
    const { document } = await run(() => (
      <>
        <TestComponent />
        <TestComponent />
      </>
    ));

    forgo.unmount(document.getElementById("root")!);
    should.equal(state.parentUnmounts, 2);
    should.equal(state.childUnmounts, 2);
    should.equal(document.getElementById("root")!.childNodes.length, 0);
  });
}
