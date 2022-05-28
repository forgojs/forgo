import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

const Parent: forgo.ForgoComponentCtor = () => {
  return new forgo.Component({
    render() {
      return (
        <div>
          <Greet text="Hello2" />
          <Greet text="World2" />
        </div>
      );
    },
  });
};

interface GreetProps {
  text: string;
}
const Greet: forgo.ForgoComponentCtor<GreetProps> = (_props: {
  text: string;
}) => {
  return new forgo.Component<GreetProps>({
    render(props) {
      return <p>{props.text}</p>;
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
