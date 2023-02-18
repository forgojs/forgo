import * as forgo from "../../index.js";
import { JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let sortOrder = 1;
let component: forgo.Component<{}>;

export function reorderElements() {
  sortOrder = 2;
  component.update({});
}

export let inputRef1: forgo.ForgoRef<HTMLInputElement> = {};
export let inputRef2: forgo.ForgoRef<HTMLInputElement> = {};
export let inputRef3: forgo.ForgoRef<HTMLInputElement> = {};
export let inputRef4: forgo.ForgoRef<HTMLInputElement> = {};
export let inputRef5: forgo.ForgoRef<HTMLInputElement> = {};

const ContainerComponent = () => {
  component = new forgo.Component({
    render() {
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
  });
  return component;
};

export function run(dom: JSDOM) {
  const window = dom.window;
  const document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<ContainerComponent />, document.getElementById("root"));
  });
}
