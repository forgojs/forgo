import * as forgo from "../../index.js";
import { JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

function getRandomString() {
  return (
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10)
  );
}

let sortOrder = 1;
let renderArgs: forgo.ForgoRenderArgs<{}>;

export function reorderElements() {
  sortOrder = 2;
  renderArgs.update({});
}

export let inputRef1: forgo.ForgoRef<HTMLInputElement> = {}
export let inputRef2: forgo.ForgoRef<HTMLInputElement> = {}
export let inputRef3: forgo.ForgoRef<HTMLInputElement> = {}
export let inputRef4: forgo.ForgoRef<HTMLInputElement> = {}
export let inputRef5: forgo.ForgoRef<HTMLInputElement> = {}

function ContainerComponent() {
  return {
    render(props: {}, args: forgo.ForgoRenderArgs<{}>) {
      renderArgs = args;
      return (
        <div>
          {sortOrder === 1 ? (
            <>
              <input type="text" key="1" id="inputold1" ref={inputRef1} />
              <input type="text" key="2" id="inputold2" ref={inputRef2} />
              <input type="text" key="3" id="inputold3" ref={inputRef3} />
              <input type="text" key="4" id="inputold4" ref={inputRef4} />
              <input type="text" key="5" id="inputold5" ref={inputRef5} />
            </>
          ) : (
            <>
              <input type="text" id="inputnew1" key="1" />
              <input type="text" id="inputnew4" key="4" />
              <input type="text" id="inputnew3" key="3" />
              <input type="text" id="inputnew2" key="2" />
              <input type="text" id="inputnew5" key="5" />
            </>
          )}
        </div>
      );
    },
  };
}

export function run(dom: JSDOM) {
  const window = dom.window;
  const document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<ContainerComponent />, document.getElementById("root"));
  });
}
