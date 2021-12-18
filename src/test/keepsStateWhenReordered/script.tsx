import * as forgo from "../../index.js";
import { JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

function getRandomString() {
  return (
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10)
  );
}

let savedState: { [key: string]: string } = {};

export function getComponentState() {
  return savedState;
}

function StatefulComponent() {
  let state = getRandomString();
  return {
    render({ key }: { key: string }) {
      savedState[key] = state;
      return (
        <p state={state} key={key}>
          Component #${key}
        </p>
      );
    },
  };
}

let sortOrder = 1;
let containerArgs: forgo.ForgoRenderArgs;

export function reorderComponents() {
  sortOrder = 2;
  containerArgs.update({});
}

function ContainerComponent() {
  return {
    render(props: {}, args: forgo.ForgoRenderArgs) {
      savedState = {};
      containerArgs = args;
      return (
        <div>
          {sortOrder === 1 ? (
            <>
              <StatefulComponent key="1" />
              <StatefulComponent key="2" />
              <StatefulComponent key="3" />
              <StatefulComponent key="4" />
              <StatefulComponent key="5" />
            </>
          ) : (
            <>
              <StatefulComponent key="1" />
              <StatefulComponent key="4" />
              <StatefulComponent key="3" />
              <StatefulComponent key="2" />
              <StatefulComponent key="5" />
            </>
          )}
        </div>
      );
    },
  };
}

export function run(dom: JSDOM) {
  const window = dom.window;
  const document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<ContainerComponent />, document.getElementById("root"));
  });
}
