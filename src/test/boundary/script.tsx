import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { Component, mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

const ErrorComponent = () => {
  return new forgo.Component({
    render() {
      throw new Error("Some error occurred :(");
    },
  });
};

interface ErrorBoundaryComponentProps extends forgo.ForgoElementBaseProps {
  name: string;
}

const ErrorBoundary = (props: ErrorBoundaryComponentProps) => {
  return new Component<ErrorBoundaryComponentProps>({
    render({ children }) {
      return <div>{children}</div>;
    },
    error(props, error) {
      return (
        <p>
          Error in {props.name}: {(error as Error).message}
        </p>
      );
    },
  });
};

const App = () => {
  return new forgo.Component({
    render() {
      return (
        <div>
          <ErrorBoundary name="ErrorComponent">
            <ErrorComponent />
          </ErrorBoundary>
        </div>
      );
    },
  });
};

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<App />, document.getElementById("root"));
  });
}
