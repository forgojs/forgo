import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../../";

let window: DOMWindow;
let document: HTMLDocument;

function Parent() {
  return {
    render() {
      return (
        <div>
          <Greet text="Hello" />
        </div>
      );
    },
  };
}

function Greet(props: { text: string }) {
  return {
    render(props: { text: string }) {
      return <div>{props.text}</div>;
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
