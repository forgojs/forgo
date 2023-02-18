import * as forgo from "../index.js";
import { run } from "./componentRunner.js";

function componentFactory() {
  const state: {
    component: forgo.Component<{}> | null;
  } = { component: null };

  const TestComponent = () => {
    let counter = 0;

    state.component = new forgo.Component({
      render() {
        counter++;
        return <div>Counter is {counter}</div>;
      },
    });
    state.component.shouldUpdate(() => {
      return false;
    });
    return state.component;
  };

  return {
    Component: TestComponent,
    state,
  };
}

export default function () {
  it("skips render if shouldUpdate() returns false", async () => {
    const { Component, state } = componentFactory();
    const { document } = await run(() => <Component />);

    state.component!.update();
    state.component!.update();
    state.component!.update();

    document.body.innerHTML.should.containEql("Counter is 1");
  });
}
