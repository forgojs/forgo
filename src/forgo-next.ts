/**
 * Creates everything needed to run forgo, wrapped in a closure holding e.g.,
 * JSDOM-specific environment overrides used in tests
 */

// Cache for storing custom elements, so we don't redefine them
type Props = { [key: string]: any }; // Props can be any key-value pairs.
type ForgoElement = HTMLElement | Text; // A Forgo element is either an HTML element or text.
type ChildElement = ForgoElement | string | number; // Children can be elements or simple text.

type ForgoComponentType = {
  name: string;
  render: (props: Props, component: ForgoComponentType) => ForgoElement;
  element?: HTMLElement; // Optional element property to store the custom element reference
  update: () => void; // Update method to re-render the component
  props?: Props; // Store optional props
  attachShadow: boolean; // Whether to attach a shadow root
  mode: "open" | "closed"; // Shadow DOM mode (open or closed)
};

/*
  The following adds support for injecting test environment objects.
  Such as JSDOM.
*/
export type ForgoEnvType = {
  window: Window;
  document: Document;
  __internal: {
    HTMLElement: typeof HTMLElement;
    Text: typeof Text;
  };
};

// The Component class
export class Component {
  name: string;
  render: (props: Props, component: Component) => ForgoElement;
  element?: HTMLElement; // Store the associated custom element
  props: Props; // Store the props passed to the component
  attachShadow: boolean; // Whether to attach a shadow root
  mode: "open" | "closed"; // The mode for the shadow root

  constructor(config: {
    name: string;
    render: (props: Props, component: Component) => ForgoElement;
    props?: Props;
    attachShadow?: boolean; // Add this option, defaults to true
    mode?: "open" | "closed"; // Add this option, defaults to "open"
  }) {
    this.name = config.name;
    this.render = config.render;
    this.element = undefined; // Initialize the element as undefined
    this.props = config.props ?? {}; // Store the props passed to the component
    this.attachShadow = config.attachShadow ?? true; // Default attachShadow to true
    this.mode = config.mode ?? "open"; // Default mode to "open"
  }

  // The update method to re-render the component and update the DOM
  update() {
    if (this.element) {
      // Determine whether to target the shadow DOM or the regular element based on the attachShadow prop
      const target = this.attachShadow ? this.element.shadowRoot : this.element;

      if (target) {
        // Clear the target's existing content
        while (target.firstChild) {
          target.removeChild(target.firstChild);
        }

        // Re-render and append new content
        const newContent = this.render(this.props, this);
        target.appendChild(newContent);
      }
    }
  }
}

// Cache for storing custom elements, so we don't redefine them
const customElementRegistry: { [key: string]: boolean } = {};

/**
 * Creates everything needed to run forgo, wrapped in a closure holding e.g.,
 * JSDOM-specific environment overrides used in tests
 */
export function createForgoInstance(customEnv: any) {
  const env: ForgoEnvType = customEnv;

  env.__internal = env.__internal ?? {
    Text: (env.window as any).Text,
    HTMLElement: (env.window as any).HTMLElement,
  };

  // The createElement function
  function createElement(
    tag: keyof HTMLElementTagNameMap | (() => ForgoComponentType),
    props: Props | null,
    ...children: ChildElement[]
  ): ForgoElement {
    if (typeof tag === "function") {
      const forgoComponent = tag();

      // Check if the custom element has already been registered
      if (!customElementRegistry[forgoComponent.name]) {
        // Create a custom element class, but without rendering in connectedCallback
        class CustomElement extends env.__internal.HTMLElement {}

        // Define the custom element using the component's name
        env.window.customElements.define(forgoComponent.name, CustomElement);
        customElementRegistry[forgoComponent.name] = true;
      }

      // Create the custom element (i.e., <basic-component> or <parent-component>)
      const customElement = env.document.createElement(forgoComponent.name);

      // Conditionally attach a shadow root based on attachShadow property
      let shadowRoot;
      if (forgoComponent.attachShadow) {
        shadowRoot = customElement.attachShadow({ mode: forgoComponent.mode });
      }

      // Attach the custom element to the component's `element` prop
      forgoComponent.element = customElement;

      // Set the props as attributes on the custom element
      if (props) {
        if (props.ref !== undefined) {
          props.ref.value = customElement;
        }

        for (const [key, value] of Object.entries(props)) {
          customElement.setAttribute(key, String(value));
        }
      }

      // Render the component's content, passing props and the component to the render function
      const renderedContent = forgoComponent.render(
        props || {},
        forgoComponent
      );

      // Append the rendered content to the shadow root if it exists, otherwise to the element
      if (shadowRoot) {
        shadowRoot.appendChild(renderedContent);
      } else {
        customElement.appendChild(renderedContent);
      }

      return customElement;
    }

    // For standard HTML elements, no shadow root is created
    const element = env.document.createElement(tag);

    // Set properties or attributes if provided
    if (props) {
      if (props.ref !== undefined) {
        props.ref.value = element;
      }

      for (const [key, value] of Object.entries(props)) {
        if (key in element) {
          (element as any)[key] = value; // Set DOM properties
        } else {
          element.setAttribute(key, String(value)); // Set as an attribute
        }
      }
    }

    // Append children, which could be either text, numbers, or other elements
    children.forEach((child) => {
      if (typeof child === "string" || typeof child === "number") {
        element.appendChild(env.document.createTextNode(String(child))); // Append text nodes
      } else if (
        child instanceof env.__internal.HTMLElement ||
        child instanceof env.__internal.Text
      ) {
        element.appendChild(child); // Append child elements
      }
    });

    return element;
  }

  // The mount function that can take either an HTMLElement or a string selector
  function mount(
    component: ForgoElement,
    container: HTMLElement | string | null
  ) {
    // If the container is a string, use document.querySelector to find the DOM element
    const root =
      typeof container === "string"
        ? env.document.querySelector(container)
        : container;

    if (!root) {
      throw new Error("Root element not found.");
    }

    // Clear the root element before mounting
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }

    // Append the component's rendered DOM element to the root
    root.appendChild(component);
  }

  return {
    createElement,
    mount,
  };
}

const windowObject = globalThis !== undefined ? globalThis : window;

let forgoInstance = createForgoInstance({
  window: windowObject,
  document: windowObject.document,
});

export function setCustomEnv(customEnv: any) {
  forgoInstance = createForgoInstance(customEnv);
}

export function mount(
  component: ForgoElement,
  container: HTMLElement | string | null
) {
  return forgoInstance.mount(component, container);
}

export function createElement(
  tag: keyof HTMLElementTagNameMap | (() => ForgoComponentType),
  props: Props | null,
  ...children: ChildElement[]
) {
  return forgoInstance.createElement(tag, props, ...children);
}

/* JSX Types */
/*
  JSX typings expect a JSX namespace to be in scope for the forgo module (if a
  using a jsxFactory like forgo.createElement), or attached to the naked factory
  function (if using a jsxFactory like createElement).

  See: https://www.typescriptlang.org/docs/handbook/jsx.html#intrinsic-elements
  Also: https://dev.to/ferdaber/typescript-and-jsx-part-ii---what-can-create-jsx-22h6
  Also: https://www.innoq.com/en/blog/type-checking-tsx/

  Note that importing a module turns it into a namespace on this side of the
  import, so it doesn't need to be declared as a namespace inside jsxTypes.ts.
  However, attempting to declare it that way causes no end of headaches either
  when trying to reexport it here, or reexport it from a createElement
  namespace. Some errors arise at comple or build time, and some are only
  visible when a project attempts to consume forgo.
*/
// This covers a consuming project using the forgo.createElement jsxFactory
export * as JSX from "./jsxTypes.js";

// If jsxTypes is imported using named imports, esbuild doesn't know how to
// erase the imports and gets pset that "JSX" isn't an actual literal value
// inside the jsxTypes.ts module. We have to import as a different name than the
// export within createElement because I can't find a way to export a namespace
// within a namespace without using import aliases.
import * as JSXTypes from "./jsxTypes.js";
// The createElement namespace exists so that users can set their TypeScript
// jsxFactory to createElement instead of forgo.createElement.// eslint-disable-next-line @typescript-eslint/no-namespace

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace createElement {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import JSX = JSXTypes;
}
