import * as forgo from "../index.js";
import htmlFile from "./htmlFile.js";
import { DOMWindow, JSDOM } from "jsdom";

export interface ComponentEnvironment<ExportedValues extends {}> {
  window: DOMWindow;
  document: Document;
  /**
   * We use this to allow the component under test to return values to the testing
   * environment, for making assertions about its internal state
   */
  exports: ExportedValues;
}

function defaultDom() {
  return new JSDOM(htmlFile(), {
    runScripts: "outside-only",
    resources: "usable",
  });
}

/**
 * Receives a forgo component and renders it.
 * @param componentFactory Accepts some props to attach to the component and
 * returns something that will be passed directly to mount()
 * @param dom Defaults to creating a new JSDOM instance, but maybe for some
 * reason a test needs to create its own DOM?
 * @returns The constructed JSDOM globals, plus an object holding values the
 * component under test has exposed to the test
 *
 * We use a component factory instead of directly receiving the component
 * because we want tests to be able to set their own per-test props on a
 * component, which only works if the test declares the props as JSX
 */
export async function run<TProps, TExports>(
  componentBuilder: (
    props: TProps,
    window: DOMWindow,
    document: Document
  ) => {
    node: forgo.ForgoNode;
  },
  props: TProps,
  dom: JSDOM = defaultDom()
): Promise<{
  dom: JSDOM;
  document: Document;
  window: DOMWindow;
}> {
  const window = dom.window;
  const document = window.document;
  forgo.setCustomEnv({ window, document });

  const { node } = componentBuilder(props, window, document);

  window.addEventListener("load", () => {
    forgo.mount(node, document.getElementById("root"));
  });

  // Wait for the component to actually render
  await new Promise<void>((resolve) => {
    window.addEventListener("load", () => {
      resolve();
    });
  });

  return { dom, document, window };
}
