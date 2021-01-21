import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../../";

let window: DOMWindow;
let document: HTMLDocument;

type ComponentProps = {
  value: string | number | boolean | object | null | BigInt | undefined;
};

function BasicComponent(props: ComponentProps) {
  return {
    render(props: ComponentProps) {
      return <div id="mydiv">{props.value}</div>;
    },
  };
}

export function runWithUndefinedProps(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(
      <BasicComponent value={undefined} />,
      document.getElementById("root")
    );
  });
}

export function runWithNullProps(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<BasicComponent value={null} />, "#root");
  });
}

export function runWithStringProps(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<BasicComponent value="hello" />, "#root");
  });
}

export function runWithBooleanProps(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<BasicComponent value={true} />, "#root");
  });
}

export function runWithNumericProps(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<BasicComponent value={100} />, "#root");
  });
}
