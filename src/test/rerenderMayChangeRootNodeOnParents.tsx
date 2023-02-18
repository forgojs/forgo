import should from "should";

import * as forgo from "../index.js";
import { run } from "./componentRunner.js";

function componentFactory() {
  const state: {
    component: forgo.Component | null;
  } = { component: null };

  const Parent: forgo.ForgoNewComponentCtor = () => {
    state.component = new forgo.Component({
      render() {
        return <Child />;
      },
    });
    return state.component;
  };

  const Child: forgo.ForgoNewComponentCtor = () => {
    let counter = 0;
    return new forgo.Component({
      render() {
        counter++;
        return counter === 1 ? (
          <div id="node1">This is a child node.</div>
        ) : (
          <p id="node2">This is a child node.</p>
        );
      },
    });
  };

  return {
    Component: Parent,
    state,
  };
}

export default function () {
  it("rerender may change root node on parents", async () => {
    const { Component, state } = componentFactory();
    await run(() => <Component />);

    const oldId: string = (state.component!.__internal.element.node as Element)
      .id;
    should.equal(oldId, "node1");

    state.component!.update();

    const newId: string = (state.component!.__internal.element.node as Element)
      .id;
    should.equal(newId, "node2");
  });
}
