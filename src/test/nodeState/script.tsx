import { h } from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: HTMLDocument;

function Parent() {
  return {
    render() {
      return <Greet name="kai" />;
    },
  };
}

function Greet(props: { name: string }) {
  window.greetingDiv = {};

  return {
    render() {
      return <div key="mydiv" ref={window.greetingDiv}>Hello {props.name}</div>;
    },
  };
}

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<Parent />, document.getElementById("root"));
  });
}
