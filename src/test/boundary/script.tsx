import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import {
  Component,
  ForgoComponentProps,
  mount,
  setCustomEnv,
} from "../../index.js";

let window: DOMWindow;
let document: Document;

const ErrorComponent: forgo.ForgoComponentCtor<
  forgo.ForgoComponentProps
> = () => {
  return new forgo.Component({
    render() {
      throw new Error("Some error occurred :(");
    },
  });
};

interface ErrorBoundaryComponentProps extends ForgoComponentProps {
  name: string;
}

const ErrorBoundary: forgo.ForgoComponentCtor<
  forgo.ForgoComponentProps & ErrorBoundaryComponentProps
> = () => {
  return new Component({
    render({ children }) {
      return <div>{children}</div>;
    },
    error(props: ErrorBoundaryComponentProps, error) {
      return (
        <p>
          Error in {props.name}: {(error as Error).message}
        </p>
      );
    },
  });
};

const App: forgo.ForgoComponentCtor<forgo.ForgoComponentProps> = () => {
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
