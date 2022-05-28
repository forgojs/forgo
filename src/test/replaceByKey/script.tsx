import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

type ParentProps = {
  keys: {
    key: any;
    id: string;
  }[];
};

export let unmountedElements: string[] = [];

let component: forgo.Component<forgo.ForgoComponentProps & ParentProps>;
export function renderAgain() {
  component.update();
}

const Parent: forgo.ForgoComponentCtor<
  forgo.ForgoComponentProps & ParentProps
> = () => {
  unmountedElements = [];
  let firstRender = true;
  component = new forgo.Component<forgo.ForgoComponentProps & ParentProps>({
    render(props: ParentProps) {
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
  });
  return component;
};

interface ChildProps {
  key: any;
  id: string;
}
const Child: forgo.ForgoComponentCtor<
  forgo.ForgoComponentProps & ChildProps
> = () => {
  let myId = "NA";

  const component = new forgo.Component<forgo.ForgoComponentProps & ChildProps>(
    {
      render(props: { key: any; id: string }) {
        myId = props.id;
        return <div>Hello {props.id}</div>;
      },
    }
  );
  component.addEventListener("unmount", () => {
    unmountedElements.push(myId);
  });
  return component;
};

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
