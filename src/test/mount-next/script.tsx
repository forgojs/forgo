import * as forgo from "../../forgo-next.js";
import { DOMWindow, JSDOM } from "jsdom";

let window: DOMWindow;
let document: Document;

const BasicComponent = () => {
  return new forgo.Component({
    render() {
      return <div>Hello world</div>;
    },
  });
};

const ParentComponent = () => {
  return new forgo.Component({
    render() {
      return <BasicComponent />;
    },
  });
};

const ParentDOMWrappingComponent = () => {
  return new forgo.Component({
    render() {
      return (
        <div>
          <BasicComponent />
        </div>
      );
    },
  });
};

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  forgo.setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    forgo.mount(<BasicComponent />, "#root");
  });
}

export function runParent(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  forgo.setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    forgo.mount(<ParentComponent />, "#root");
  });
}

export function runParentDOMWrapping(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  forgo.setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    forgo.mount(<ParentDOMWrappingComponent />, "#root");
  });
}
