import { h } from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import {
  ForgoComponent,
  ForgoComponentProps,
  mount,
  setCustomEnv,
  ForgoErrorArgs,
} from "../../index.js";

let window: DOMWindow;
let document: HTMLDocument;

function ErrorComponent() {
  return {
    render() {
      throw new Error("Some error occurred :(");
    },
  };
}

interface ErrorBoundaryProps extends ForgoComponentProps {
  name: string;
}

function ErrorBoundary(
  props: ErrorBoundaryProps
): ForgoComponent<ErrorBoundaryProps> {
  return {
    render({ children }) {
      return <div>{children}</div>;
    },
    error(props: ErrorBoundaryProps, args: ForgoErrorArgs) {
      return (
        <p>
          Error in {props.name}: {args.error.message}
        </p>
      );
    },
  };
}

function App() {
  return {
    render() {
      return (
        <div>
          <ErrorBoundary name="ErrorComponent">
            <ErrorComponent />
          </ErrorBoundary>
        </div>
      );
    },
  };
}

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<App />, document.getElementById("root"));
  });
}
