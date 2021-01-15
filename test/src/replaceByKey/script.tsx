import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, rerender, setCustomEnv } from "../../..";

let window: DOMWindow;
let document: HTMLDocument;

export function Parent() {
  window.unmountedElements = [];
  let firstRender = true;
  return {
    render(props: {}, args: ForgoRenderArgs) {
      (window as any).renderAgain = () => {
        rerender(args.element);
      };

      if (firstRender) {
        firstRender = false;
        return (
          <div>
            <Child key="1" id="1" />
            <Child key="2" id="2" />
            <Child key="3" id="3" />
          </div>
        );
      } else {
        return (
          <div>
            <Child key="2" id="20" />
          </div>
        );
      }
    },
  };
}

export function Child(props: { key: string; id: string }) {
  let myId = "NA";

  return {
    render(props: { key: string; id: string }) {
      myId = props.id;
      return <div>Hello {props.id}</div>;
    },
    unmount() {
      window.unmountedElements.push(myId);
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
