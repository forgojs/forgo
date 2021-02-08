import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../../";

let window: DOMWindow;
let document: HTMLDocument;

function Component() {
  return {
    render() {
      return (
        <div>
          <ul>
            <li style={{ backgroundColor: "green", padding: "10px" }}>One</li>
            <li style={{ backgroundColor: "green", padding: "10px" }}>Two</li>
          </ul>
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
    mount(<Component />, document.getElementById("root"));
  });
}
