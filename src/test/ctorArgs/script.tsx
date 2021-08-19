import { DOMWindow, JSDOM } from "jsdom";
import { ForgoCtorArgs, mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

function BasicComponent(props: any, ctorArgs: ForgoCtorArgs) {
  if (ctorArgs && ctorArgs.environment.document) {
    window.passedArgs = true;
  }
  return {
    render() {
      return <div>Hello world</div>;
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
