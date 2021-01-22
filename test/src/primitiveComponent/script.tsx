import { DOMWindow, JSDOM } from "jsdom";
import {
  ForgoComponent,
  ForgoElementProps,
  mount,
  setCustomEnv,
  ForgoErrorArgs,
  ForgoElement
} from "../../../";

let window: DOMWindow;
let document: HTMLDocument;

type ComponentProps =  ForgoElementProps & {
  foo: string | number | boolean | object | null | BigInt | undefined;
}

function StringComponent(): ForgoComponent<ComponentProps> {
  return {
    render({foo}:ComponentProps) {
      return `hello ${foo}.` 
    },
  };
}

function NumericComponent(): ForgoComponent<ComponentProps> {
  return {
    render({foo}:ComponentProps) {
      return Number(foo)
    },
  };
}

function BooleanComponent(): ForgoComponent<ComponentProps> {
  return {
    render({foo}:ComponentProps) {
      return true
    },
  };
}

function ObjectComponent(): ForgoComponent<ComponentProps> {
  return {
    render({foo}:ComponentProps) {
      return {foo}
    },
  };
}

function NullComponent(): ForgoComponent<ComponentProps> {
  return {
    render({foo}:ComponentProps) {
      return null
    },
  };
}

function UndefinedComponent(): ForgoComponent<ComponentProps> {
  return {
    render({foo}:ComponentProps) {
      return undefined
    },
  };
}

function BigIntComponent(): ForgoComponent<ComponentProps> {
  return {
    render({foo}:ComponentProps) {
      return BigInt(Number.MAX_SAFE_INTEGER + 1)
    },
  };
}

function NormalComponent(): ForgoComponent<ComponentProps> {
  return {
    render({foo}) {
      return <div>{foo}</div>
    },
  };
}

export function runStringComponent(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<StringComponent foo="bar" />, "#root")
  });
}

export function runNumericComponent(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<NumericComponent foo={100} />, "#root")
  });
}

export function runBooleanComponent(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<BooleanComponent foo={100} />, "#root")
  });
}

export function runObjectComponent(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<ObjectComponent foo="bar" />, "#root")
  });
}

export function runNullComponent(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<NullComponent foo="bar" />, "#root")
  });
}

export function runUndefinedComponent(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<UndefinedComponent foo="bar" />, "#root")
  });
}

export function runBigIntComponent(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<BigIntComponent foo={100} />, "#root")
  });
}

export function runNormalComponent(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<NormalComponent foo="bar" />, "#root")
  });
}