import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: HTMLDocument;

function Parent() {
  return {
    render() {
      return (
        <div>
          <Greet text="Hello2" />
          <Greet text="World2" />
        </div>
      );
    },
  };
}

function Greet(props: { text: string }) {
  return {
    render(props: { text: string }) {
      return <p>{props.text}</p>;
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
