import { DOMWindow, JSDOM } from "jsdom";
import { ForgoRenderArgs, mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: HTMLDocument;

type ParentProps = {
  keys: {
    key: any;
    id: string;
  }[];
};

function Parent(initialProps: ParentProps) {
  window.unmountedElements = [];
  let firstRender = true;
  return {
    render(props: ParentProps, { update }: ForgoRenderArgs) {
      (window as any).renderAgain = update;

      if (firstRender) {
        firstRender = false;
        return (
          <div>
            {props.keys.map((k) => (
              <Child key={k.key} id={k.id} />
            ))}
          </div>
        );
      } else {
        return (
          <div>
            <Child key={props.keys[1].key} id={props.keys[1].id + "X"} />
          </div>
        );
      }
    },
  };
}

function Child(props: { key: any; id: string }) {
  let myId = "NA";

  return {
    render(props: { key: any; id: string }) {
      myId = props.id;
      return <div>Hello {props.id}</div>;
    },
    unmount() {
      window.unmountedElements.push(myId);
    },
  };
}

export function runStringKey(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(
      <Parent
        keys={[
          {
            key: "1",
            id: "1",
          },
          {
            key: "2",
            id: "2",
          },
          {
            key: "3",
            id: "3",
          },
        ]}
      />,
      document.getElementById("root")
    );
  });
}

export function runObjectKey(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  const keyOne = { x: 1 };
  const keyTwo = { x: 2 };
  const keyThree = { x: 3 };

  window.addEventListener("load", () => {
    mount(
      <Parent
        keys={[
          {
            key: keyOne,
            id: "1",
          },
          {
            key: keyTwo,
            id: "2",
          },
          {
            key: keyThree,
            id: "3",
          },
        ]}
      />,
      document.getElementById("root")
    );
  });
}
