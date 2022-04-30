import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

const BasicComponent: forgo.ForgoComponentCtor<
  forgo.ForgoComponentProps
> = () => {
  return new forgo.Component({
    render() {
      return (
        <div dangerouslySetInnerHTML={{ __html: `<p>Hello world</p>` }}></div>
      );
    },
  });
};

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<BasicComponent />, document.getElementById("root"));
  });
}
