import { DOMWindow, JSDOM } from "jsdom";
import { ForgoComponent, mount, setCustomEnv } from "../../../";

let window: DOMWindow;
let document: HTMLDocument;

function ChildComponent() {
  return {
    render() {
      throw new Error("Some error occurred :(");
    },
  };
}

function BasicComponent(): ForgoComponent<{}> {
  return {
    render() {
      return <ChildComponent />;
    },
    error(_, { error }) {
      return error.message;
    },
  };
}

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<BasicComponent />, document.getElementById("root"));
  });
}
