import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

const TestComponent = () => {
  return new forgo.Component({
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
  });
};

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<TestComponent />, document.getElementById("root"));
  });
}
