import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../../";

let window: DOMWindow;
let document: HTMLDocument;

type ComponentProps = {
  value: string | number | boolean | object | null | BigInt | undefined;
};

function ComponentReturningWrappedPrimitive(props: ComponentProps) {
  return {
    render(props: ComponentProps) {
      return <div id="mydiv">{props.value}</div>;
    },
  };
}

function ComponentReturningPrimitive(props: ComponentProps) {
  return {
    render(props: ComponentProps) {
      return props.value;
    },
  };
}

export function runWithUndefinedProps(dom: JSDOM, wrapped: boolean) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(
      wrapped ? (
        <ComponentReturningWrappedPrimitive value={undefined} />
      ) : (
        <ComponentReturningPrimitive value={undefined} />
      ),
      document.getElementById("root")
    );
  });
}

export function runWithNullProps(dom: JSDOM, wrapped: boolean) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(
      wrapped ? (
        <ComponentReturningWrappedPrimitive value={null} />
      ) : (
        <ComponentReturningPrimitive value={null} />
      ),
      "#root"
    );
  });
}

export function runWithStringProps(dom: JSDOM, wrapped: boolean) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(
      wrapped ? (
        <ComponentReturningWrappedPrimitive value={"hello"} />
      ) : (
        <ComponentReturningPrimitive value={"hello"} />
      ),
      "#root"
    );
  });
}

export function runWithBooleanProps(dom: JSDOM, wrapped: boolean) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(
      wrapped ? (
        <ComponentReturningWrappedPrimitive value={true} />
      ) : (
        <ComponentReturningPrimitive value={true} />
      ),
      "#root"
    );
  });
}

export function runWithNumericProps(dom: JSDOM, wrapped: boolean) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(
      wrapped ? (
        <ComponentReturningWrappedPrimitive value={100} />
      ) : (
        <ComponentReturningPrimitive value={100} />
      ),
      "#root"
    );
  });
}
