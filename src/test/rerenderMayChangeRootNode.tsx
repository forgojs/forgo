import should from "should";

import * as forgo from "../index.js";
import { run } from "./componentRunner.js";

function componentFactory() {
  const state: {
    component: forgo.Component<{}> | null;
  } = { component: null };

  const Parent1 = () => {
    return new forgo.Component({
      render() {
        return <Parent2 />;
      },
    });
  };

  const Parent2 = () => {
    return new forgo.Component({
      render() {
        return <Child />;
      },
    });
  };

  const Child = () => {
    let counter = 0;
    state.component = new forgo.Component({
      render() {
        counter++;
        return counter === 1 ? (
          <>
            <div id="node1">This is a child node.</div>
            <div key="2" id="node2">
              This is a child node.
            </div>
          </>
        ) : (
          <>
            <div key="2" id="node2">
              This is a child node.
            </div>
          </>
        );
      },
    });
    return state.component;
  };

  return {
    Component: Parent1,
    state,
  };
}

export default function () {
  it("rerender may change root node", async () => {
    const { Component, state } = componentFactory();
    const { document } = await run(() => <Component />);

    const node1FirstPass = document.getElementById("node1");
    const node2FirstPass = document.getElementById("node2");
    const stateFirstPass = forgo.getForgoState(
      node2FirstPass as ChildNode
    ) as forgo.NodeAttachedState;
    should.equal(
      stateFirstPass.components[0].component.__internal.element.node,
      node1FirstPass
    );
    should.equal(
      stateFirstPass.components[1].component.__internal.element.node,
      node1FirstPass
    );
    should.equal(
      stateFirstPass.components[2].component.__internal.element.node,
      node1FirstPass
    );

    state.component!.update();

    const node2SecondPass = document.getElementById("node2");
    const stateSecondPass = forgo.getForgoState(
      node2SecondPass as ChildNode
    ) as forgo.NodeAttachedState;
    should.equal(
      stateSecondPass.components[0].component.__internal.element.node,
      node2SecondPass
    );
    should.equal(
      stateSecondPass.components[1].component.__internal.element.node,
      node2SecondPass
    );
    should.equal(
      stateSecondPass.components[2].component.__internal.element.node,
      node2SecondPass
    );
  });
}
