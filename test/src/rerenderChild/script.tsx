import { DOMWindow, JSDOM } from "jsdom";
import { mount, ForgoRenderArgs, setCustomEnv } from "../../../";

let window: DOMWindow;
let document: HTMLDocument;

function Parent() {
  window.parentCounter = 0;

  return {
    render(props: any, args: ForgoRenderArgs) {
      window.parentCounter++;
      return (
        <div>
          <p>Parent counter is {window.parentCounter}</p>
          <Child />
        </div>
      );
    },
  };
}

function ParentWithSharedNode() {
  window.parentCounter = 0;

  return {
    render(props: any, args: ForgoRenderArgs) {
      window.parentCounter++;
      return <Child />;
    },
  };
}

function Child() {
  window.childCounter = 0;

  return {
    render(props: any, { update }: ForgoRenderArgs) {
      window.renderAgain = update;
      window.childCounter++;
      return (
        <div>
          <p>Child counter is {window.childCounter}</p>
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

export function runSharedNode(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<ParentWithSharedNode />, document.getElementById("root"));
  });
}
