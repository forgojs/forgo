import * as forgo from "../../index.js";
import { JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

function getRandomString() {
  return (
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10)
  );
}

export const componentStates = new Map<unknown, string>();

interface StatefulComponentProps {
  key: unknown;
}
const StatefulComponent: forgo.ForgoNewComponentCtor<
  StatefulComponentProps
> = () => {
  let state = getRandomString();
  const component = new forgo.Component<StatefulComponentProps>({
    render({ key }) {
      componentStates.set(key, state);
      return (
        <p state={state} key={key}>
          Component #{key}
        </p>
      );
    },
  });
  component.unmount(({ key }) => {
    componentStates.delete(key);
  });
  return component;
};

let sortOrder = 1;
let containerComponent: forgo.Component;

export function reorderComponents() {
  sortOrder = 2;
  containerComponent.update({});
}

const ContainerComponent = () => {
  containerComponent = new forgo.Component({
    render() {
      componentStates.clear();
      return (
        <div>
          {sortOrder === 1 ? (
            <>
              <StatefulComponent key={0} />
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
              <StatefulComponent key={0} />
              <StatefulComponent key="2" />
              <StatefulComponent key="5" />
            </>
          )}
        </div>
      );
    },
  });
  return containerComponent;
};

export function run(dom: JSDOM) {
  const window = dom.window;
  const document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<ContainerComponent />, document.getElementById("root"));
  });
}
