import { DOMWindow, JSDOM } from "jsdom";
import {
  ForgoComponent,
  ForgoElementProps,
  mount,
  setCustomEnv,
} from "../../../";

let window: DOMWindow;
let document: HTMLDocument;

function GoodComponent() {
  return {
    render() {
      return <p>GoodComponent rendered!</p>;
    },
  };
}

function ErrorComponent() {
  return {
    render() {
      throw new Error("Some error occurred :(");
    },
  };
}

interface ErrorBoundaryProps extends ForgoElementProps {
  name: string;
}

function ErrorBoundary(
  props: ErrorBoundaryProps
): ForgoComponent<ErrorBoundaryProps> {
  return {
    render({ children }) {
      return <div>{children}</div>;
    },
    error({ name }, { error }) {
      return (
        <p>
          Error in {name}: {error.message}
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
          <ErrorBoundary name="GoodComponent">
            <GoodComponent />
          </ErrorBoundary>

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
