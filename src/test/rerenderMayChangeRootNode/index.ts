import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import { renderAgain, run } from "./script.js";
import should from "should";
import { getForgoState, NodeAttachedState } from "../../index.js";

export default function () {
  it("rerender may change root node", async () => {
    const dom = new JSDOM(htmlFile(), {
      runScripts: "outside-only",
      resources: "usable",
    });
    const window = dom.window;

    run(dom);

    await new Promise<void>((resolve) => {
      window.addEventListener("load", () => {
        resolve();
      });
    });

    const node1FirstPass = window.document.getElementById("node1");
    const node2FirstPass = window.document.getElementById("node2");
    const stateFirstPass = getForgoState(
      node2FirstPass as ChildNode
    ) as NodeAttachedState;
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

    renderAgain();

    const node2SecondPass = window.document.getElementById("node2");
    const stateSecondPass = getForgoState(
      node2SecondPass as ChildNode
    ) as NodeAttachedState;
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
