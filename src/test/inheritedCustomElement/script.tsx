import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

function Component() {
  return {
    render() {
      return (
        <div>
          <article contenteditable={true}>
            <h2>Sample heading</h2>

            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
              pulvinar sed justo sed viverra. Aliquam ac scelerisque tellus.
              Vivamus porttitor nunc vel nibh rutrum hendrerit. Donec viverra
              vestibulum pretium. Mauris at eros vitae ante pellentesque
              bibendum. Etiam et blandit purus, nec aliquam libero. Etiam leo
              felis, pulvinar et diam id, sagittis pulvinar diam. Nunc
              pellentesque rutrum sapien, sed faucibus urna sodales in. Sed
              tortor nisl, egestas nec egestas luctus, faucibus vitae purus. Ut
              elit nunc, pretium eget fermentum id, accumsan et velit. Sed
              mattis velit diam, a elementum nunc facilisis sit amet.
            </p>

            <p is="word-count"></p>
          </article>
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
    mount(<Component />, document.getElementById("root"));
  });
}
