import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

const Parent: forgo.ForgoComponentCtor<forgo.ForgoElementProps> = () => {
  return new forgo.Component({
    render() {
      return (
        <div>
          <Greet text="Hello" />
        </div>
      );
    },
  });
};

interface GreetProps {
  text: string;
}
const Greet: forgo.ForgoComponentCtor<GreetProps> = () => {
  return new forgo.Component<GreetProps>({
    render(props: { text: string }) {
      return <div>{props.text}</div>;
    },
  });
};

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<Parent />, document.getElementById("root"));
  });
}
