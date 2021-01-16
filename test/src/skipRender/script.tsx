import { DOMWindow, JSDOM } from "jsdom";
import { rerender, mount, ForgoRenderArgs, setCustomEnv } from "../../../";

let window: DOMWindow;
let document: HTMLDocument;

export function Parent() {
  return {
    render(props: any, args: ForgoRenderArgs) {
      window.renderAgain = () => {
        rerender(args.element, undefined, false);
      };

      return (
        <div>
          <Greet text="kai" />
        </div>
      );
    },
  };
}

function Greet(props: { text: string }) {
  let greetingCounter = 0;

  return {
    render(props: { text: string }) {
      greetingCounter++;
      return (
        <div>
          Greeting counter is {greetingCounter}
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
    mount(<Parent />, document.getElementById("root"));
  });
}
