import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

type ComponentProps = {
  value: string | number | boolean | object | null | BigInt | undefined;
};

export type Wrapping = "DIV" | "NONE" | "FRAGMENT";

const ComponentReturningWrappedPrimitive: forgo.ForgoComponentCtor<
  ComponentProps
> = (_props: ComponentProps) => {
  return new forgo.Component<ComponentProps>({
    render(props: ComponentProps) {
      return <div id="mydiv">{props.value}</div>;
    },
  });
};

const ComponentReturningPrimitive: forgo.ForgoComponentCtor<ComponentProps> = (
  _props: ComponentProps
) => {
  return new forgo.Component<ComponentProps>({
    render(props: ComponentProps) {
      return props.value;
    },
  });
};

const ComponentReturningPrimitiveInFragment: forgo.ForgoComponentCtor<
  ComponentProps
> = (_props: ComponentProps) => {
  return new forgo.Component<ComponentProps>({
    render(props: ComponentProps) {
      return <>{props.value}</>;
    },
  });
};

export function runWithUndefinedProps(dom: JSDOM, wrapping: Wrapping) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(
      wrapping === "DIV" ? (
        <ComponentReturningWrappedPrimitive value={undefined} />
      ) : wrapping === "FRAGMENT" ? (
        <ComponentReturningPrimitiveInFragment value={undefined} />
      ) : (
        <ComponentReturningPrimitive value={undefined} />
      ),
      document.getElementById("root")
    );
  });
}

export function runWithNullProps(dom: JSDOM, wrapping: Wrapping) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(
      wrapping === "DIV" ? (
        <ComponentReturningWrappedPrimitive value={null} />
      ) : wrapping === "FRAGMENT" ? (
        <ComponentReturningPrimitiveInFragment value={null} />
      ) : (
        <ComponentReturningPrimitive value={null} />
      ),
      "#root"
    );
  });
}

export function runWithStringProps(dom: JSDOM, wrapping: Wrapping) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(
      wrapping === "DIV" ? (
        <ComponentReturningWrappedPrimitive value={"hello"} />
      ) : wrapping === "FRAGMENT" ? (
        <ComponentReturningPrimitiveInFragment value={"hello"} />
      ) : (
        <ComponentReturningPrimitive value={"hello"} />
      ),
      "#root"
    );
  });
}

export function runWithBooleanProps(dom: JSDOM, wrapping: Wrapping) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(
      wrapping === "DIV" ? (
        <ComponentReturningWrappedPrimitive value={true} />
      ) : wrapping === "FRAGMENT" ? (
        <ComponentReturningPrimitiveInFragment value={true} />
      ) : (
        <ComponentReturningPrimitive value={true} />
      ),
      "#root"
    );
  });
}

export function runWithNumericProps(dom: JSDOM, wrapping: Wrapping) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(
      wrapping === "DIV" ? (
        <ComponentReturningWrappedPrimitive value={100} />
      ) : wrapping === "FRAGMENT" ? (
        <ComponentReturningPrimitiveInFragment value={100} />
      ) : (
        <ComponentReturningPrimitive value={100} />
      ),
      "#root"
    );
  });
}
