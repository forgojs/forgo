import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

const Parent = () => {
  return new forgo.Component({
    render() {
      return <Greet name="kai" />;
    },
  });
};

interface GreetProps {
  name: string;
}
const Greet = (props: GreetProps) => {
  window.greetingDiv = {};

  return new forgo.Component<GreetProps>({
    render(props) {
      return (
        <div key="mydiv" ref={window.greetingDiv}>
          Hello {props.name}
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
    mount(<Parent />, document.getElementById("root"));
  });
}
