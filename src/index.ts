/*
  A type that wraps a reference.
*/
export type ForgoRef<T> = {
  value?: T;
};

/*
  We have two types of elements:
  1. DOM Elements
  2. Component Elements
*/
export type ForgoElementBaseProps = {
  children?: ForgoNode | ForgoNode[];
  ref?: ForgoRef<Element>;
};

// DOM elements have the additional fields
export type ForgoDOMElementProps = {
  xmlns?: string;
  dangerouslySetInnerHTML?: { __html: string };
} & ForgoElementBaseProps;

// Since we'll set any attribute the user passes us, we need to be sure not to
// set Forgo-only attributes that don't make sense to appear in the DOM
const suppressedAttributes = ["ref", "dangerouslySetInnerHTML"];

export type ForgoSimpleComponentCtor<TProps extends object> = (
  props: TProps & ForgoElementBaseProps
) => ForgoSimpleComponent<TProps>;

export type ForgoNewComponentCtor<TProps extends object> = (
  props: TProps & ForgoElementBaseProps
) => Component<TProps>;

export type ForgoElementArg = {
  node?: ChildNode;
  componentIndex: number;
  nodeIndex: number;
};

/*
  A ForgoNode is the output of the render() function.
  It can represent:
  - a primitive type which becomes a DOM Text Node
  - a DOM Element
  - or a Component.
 
  If the ForgoNode is a string, number etc, it's a primitive type.
  eg: "hello"

  If ForgoNode has a type property which is a string, it represents a native DOM element.
  eg: The type will be "div" for <div>Hello</div>

  If the ForgoElement represents a Component, then the type points to a ForgoComponentCtor.
  eg: The type will be MyComponent for <MyComponent />
*/
export type ForgoElementBase<TProps extends ForgoElementBaseProps> = {
  key?: any;
  props: TProps;
  __is_forgo_element__: true;
};

export type ForgoDOMElement<TProps extends ForgoDOMElementProps> =
  ForgoElementBase<TProps> & {
    type: string;
  };

export type ForgoComponentElement<TProps extends ForgoElementBaseProps> =
  ForgoElementBase<TProps> & {
    type: ForgoNewComponentCtor<TProps>;
  };

export type ForgoFragment = {
  type: typeof Fragment;
  props: { children?: ForgoNode | ForgoNode[] };
  __is_forgo_element__: true;
};

export type ForgoElement<TProps extends ForgoElementBaseProps> =
  | ForgoDOMElement<TProps>
  | ForgoComponentElement<TProps>;

export type ForgoNonEmptyPrimitiveNode =
  | string
  | number
  | boolean
  | object
  | bigint;

export type ForgoPrimitiveNode = ForgoNonEmptyPrimitiveNode | null | undefined;

/**
 * Anything renderable by Forgo, whether from an external source (e.g.,
 * component.render() output), or internally (e.g., DOM nodes)
 */
export type ForgoNode = ForgoPrimitiveNode | ForgoElement<any> | ForgoFragment;

/*
  Forgo stores Component state on the element on which it is mounted.

  Say Custom1 renders Custom2 which renders Custom3 which renders <div>Hello</div>. 
  In this case, the components Custom1, Custom2 and Custom3 are stored on the div.
 
  You can also see that it gets passed around as statesAwaitingAttach in the render methods. 
  That's because when Custom1 renders Custom2, there isn't a real DOM node available to attach the state to. 
  So the states are passed around until the last component renders a real DOM node or nodes.

  In addition it holds a bunch of other things. 
  Like for example, a key which uniquely identifies a child element when rendering a list.
*/
export type NodeAttachedComponentState<TProps extends ForgoElementBaseProps> = {
  key?: any;
  ctor: ForgoNewComponentCtor<TProps> | ForgoSimpleComponentCtor<TProps>;
  componentElement: ForgoComponentElement<TProps>;
  component: Component<TProps>;
  props: TProps;
  nodes: ChildNode[];
  isMounted: boolean;
};

export type ForgoKeyType = string | number;

/*
  This is the state data structure which gets stored on a node.  
  See explanation for NodeAttachedComponentState<TProps>
*/
export type NodeAttachedState = {
  key?: ForgoKeyType;
  props?: { [key: string]: any };
  components: NodeAttachedComponentState<any>[];
  style?: { [key: string]: any };
  deleted?: boolean;
  lookups: {
    keyedComponentNodes: Map<ForgoKeyType, ChildNode[]>;
    newlyAddedKeyedComponentNodes: Map<ForgoKeyType, ChildNode[]>;
    keyedElementNodes: Map<ForgoKeyType, ChildNode>;
    newlyAddedKeyedElementNodes: Map<ForgoKeyType, ChildNode>;
  };
};

// CSS types lifted from preact.
export type DOMCSSProperties = {
  [key in keyof Omit<
    CSSStyleDeclaration,
    | "item"
    | "setProperty"
    | "removeProperty"
    | "getPropertyValue"
    | "getPropertyPriority"
  >]?: string | number | null | undefined;
};
export type AllCSSProperties = {
  [key: string]: string | number | null | undefined;
};
export interface CSSProperties extends AllCSSProperties, DOMCSSProperties {
  cssText?: string | null;
}

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

/**
 * Nodes will be created as detached DOM nodes, and will not be attached to the parent
 */
export type DetachedNodeInsertionOptions = {
  type: "detached";
  parentElement: Element | undefined;
};

/**
 * Instructs the renderer to search for an existing node to modify or replace,
 * before creating a new node.
 */
export type AttachedNodeInsertionOptions = {
  type: "attached";
  parentElement: Element;
  // Where under the parent's children to find the start of this component
  currentNodeIndex: number;
  // How many elements after currentNodeIndex belong to the element we're searching
  length: number;
};

/**
 * Decides how the called function attaches nodes to the supplied parent
 */
export type NodeInsertionType = "attached" | "detached";

export type NodeInsertionOptions =
  | DetachedNodeInsertionOptions
  | AttachedNodeInsertionOptions;

/*
  Result of the render functions.
*/
export type RenderResult = {
  nodes: ChildNode[];
};

export type DeletedNode = {
  node: ChildNode;
};

declare global {
  interface ChildNode {
    __forgo?: NodeAttachedState;
    __forgo_deletedNodes?: DeletedNode[];
  }
}

/*
  Fragment constructor.
  We simply use it as a marker in jsx-runtime.
*/
export const Fragment: unique symbol = Symbol.for("FORGO_FRAGMENT");

/*
  HTML Namespaces
*/
const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const MATH_NAMESPACE = "http://www.w3.org/1998/Math/MathML";
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

const MISSING_COMPONENT_INDEX = -1;
const MISSING_NODE_INDEX = -1;

/*
  These come from the browser's Node interface, which defines an enum of node
  types. We'd like to just reference Node.<whatever>, but JSDOM makes us jump
  through hoops to do that because it hates adding new globals. Getting around
  that is more complex, and more bytes on the wire, than just hardcoding the
  constants we care about.
*/
const ELEMENT_NODE_TYPE = 1;
const TEXT_NODE_TYPE = 3;
const COMMENT_NODE_TYPE = 8;

/**
 * These are methods that a component may implement. Every component is required
 * to have a render method.
 * 1. render() returns the actual DOM to render.
 * 2. error() is called when this component, or one of its children, throws an
 *    error.
 */
export interface ForgoComponentMethods<TProps extends object> {
  render: (
    props: TProps & ForgoElementBaseProps,
    component: Component<TProps>
  ) => ForgoNode | ForgoNode[];
  error?: (
    props: TProps & ForgoElementBaseProps,
    error: unknown,
    component: Component<TProps>
  ) => ForgoNode;
}

/**
 * This type gives us an exhaustive type check, guaranteeing that if we add a
 * new lifecycle event to the array, any types that can be derived from that
 * information will fail to typecheck until they handle the new event.
 */
type ComponentEventListenerBase = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [event in keyof typeof lifecycleEmitters]: Array<Function>;
};
/**
 * It'd be nice if we could just use ComponentEventListenerBase, but the
 * shouldUpdate event gets processed differently, so we need a way to specify
 * that some event listeners have non-void return types
 */
// TODO: figure out if TS gets angry if the user passes an async function as an
// event listener. Maybe we need to default to unknown instead of void for the
// return type?
interface ComponentEventListeners<TProps extends object>
  extends ComponentEventListenerBase {
  mount: Array<
    (
      props: TProps & ForgoElementBaseProps,
      component: Component<TProps>
    ) => void
  >;
  unmount: Array<
    (
      props: TProps & ForgoElementBaseProps,
      component: Component<TProps>
    ) => void
  >;
  afterRender: Array<
    (
      props: TProps & ForgoElementBaseProps,
      previousNode: ChildNode | undefined,
      component: Component<TProps>
    ) => void
  >;
  shouldUpdate: Array<
    (
      newProps: TProps & ForgoElementBaseProps,
      oldProps: TProps & ForgoElementBaseProps,
      component: Component<TProps>
    ) => boolean
  >;
}

interface ComponentInternal<TProps extends object> {
  unmounted: boolean;
  registeredMethods: ForgoComponentMethods<TProps>;
  eventListeners: ComponentEventListeners<TProps>;
  element: ForgoElementArg;
}

const lifecycleEmitters = {
  mount<TProps extends object>(
    component: Component<TProps>,
    props: TProps
  ): void {
    component.__internal.eventListeners.mount.forEach((cb) =>
      cb(props, component)
    );
  },
  unmount<TProps extends object>(component: Component<TProps>, props: TProps) {
    component.__internal.eventListeners.unmount.forEach((cb) =>
      cb(props, component)
    );
  },
  shouldUpdate<TProps extends object>(
    component: Component<TProps>,
    newProps: TProps,
    oldProps: TProps
  ): boolean {
    // Always rerender unless we have a specific reason not to
    if (component.__internal.eventListeners.shouldUpdate.length === 0)
      return true;

    return component.__internal.eventListeners.shouldUpdate
      .map((cb) => cb(newProps, oldProps, component))
      .some(Boolean);
  },
  afterRender<TProps extends object>(
    component: Component<TProps>,
    props: TProps,
    previousNode: ChildNode | undefined
  ) {
    component.__internal.eventListeners.afterRender.forEach((cb) =>
      cb(props, previousNode, component)
    );
  },
};

/**
 * This class represents your component. It holds lifecycle methods and event
 * listeners. You may pass it around your application and to 3rd-party libraries
 * to build reusable logic.
 */
export class Component<TProps extends object> {
  /** @internal */
  public __internal: ComponentInternal<TProps>;

  /**
   * @params methods The render method is mandatory. It receives your current
   * props and returns JSX that Forgo will render to the page. Other methods are
   * optional. See the forgojs.org for more details.
   */
  constructor(registeredMethods: ForgoComponentMethods<TProps>) {
    this.__internal = {
      registeredMethods,
      unmounted: false,
      eventListeners: {
        afterRender: [],
        mount: [],
        unmount: [],
        shouldUpdate: [],
      },
      element: {
        componentIndex: MISSING_COMPONENT_INDEX,
        nodeIndex: MISSING_NODE_INDEX,
      },
    };
  }

  public update(props?: TProps & ForgoElementBaseProps) {
    // TODO: When we do our next breaking change, there's no reason for this to
    // return anything, but we need to leave the behavior in while we have our
    // compatibility layer.
    return rerender(this.__internal.element, props);
  }

  public mount(listener: ComponentEventListeners<TProps>["mount"][number]) {
    this.__internal.eventListeners["mount"].push(listener as any);
  }

  public unmount(listener: ComponentEventListeners<TProps>["unmount"][number]) {
    this.__internal.eventListeners["unmount"].push(listener as any);
  }

  public shouldUpdate(
    listener: ComponentEventListeners<TProps>["shouldUpdate"][number]
  ) {
    this.__internal.eventListeners["shouldUpdate"].push(listener as any);
  }

  public afterRender(
    listener: ComponentEventListeners<TProps>["afterRender"][number]
  ) {
    this.__internal.eventListeners["afterRender"].push(listener as any);
  }
}

/**
 * jsxFactory function
 */
export function createElement<
  TProps extends ForgoDOMElementProps & { key?: any }
>(
  type:
    | string
    | ForgoNewComponentCtor<TProps>
    | ForgoSimpleComponentCtor<TProps>,
  props: TProps,
  ...args: any[]
) {
  props = props ?? {};
  props.children =
    args.length > 1
      ? flatten(Array.from(args))
      : args.length === 1
      ? flatten(args[0])
      : undefined;

  const key = props.key ?? undefined;
  return { type, props, key, __is_forgo_element__: true };
}

export const h = createElement;

/*
  HACK: Chrome fires onblur (if defined) immediately after a node.remove().
  This is bad news for us, since a rerender() inside the onblur handler 
  will run on an unattached node. So, disable onblur if node is set to be removed.
*/
function handlerDisabledOnNodeDelete(node: ChildNode, value: any) {
  return (e: any) => {
    if (node.__forgo === undefined || node.__forgo.deleted === false) {
      return value(e);
    }
  };
}

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

  /**
    * This is the main render function.

    * @param forgoNode The node to render. Can be any value renderable by Forgo,
    * not just DOM nodes.
    * @param insertionOptions Which nodes need to be replaced by the new
    * node(s), or whether the new node should be created detached from the DOM
    * (without replacement). 
    * @param statesAwaitingAttach The list of Component State objects which will
    * be attached to the element.
    */
  function internalRender(
    forgoNode: ForgoNode | ForgoNode[],
    insertionOptions: NodeInsertionOptions,
    statesAwaitingAttach: NodeAttachedComponentState<any>[],
    mountOnPreExistingDOM: boolean
  ): RenderResult {
    // Array of Nodes, or Fragment
    if (Array.isArray(forgoNode) || isForgoFragment(forgoNode)) {
      return renderArray(
        flatten(forgoNode),
        insertionOptions,
        statesAwaitingAttach,
        mountOnPreExistingDOM
      );
    }
    // Primitive Nodes
    else if (!isForgoElement(forgoNode)) {
      return renderNonElement(
        forgoNode,
        insertionOptions,
        statesAwaitingAttach
      );
    }
    // HTML Element
    else if (isForgoDOMElement(forgoNode)) {
      return renderDOMElement(
        forgoNode,
        insertionOptions,
        statesAwaitingAttach,
        mountOnPreExistingDOM
      );
    }
    // Component
    else {
      const result = renderComponent(
        forgoNode,
        insertionOptions,
        statesAwaitingAttach,
        mountOnPreExistingDOM
      );

      return result;
    }
  }

  /*
    Render a string.
   * Such as in the render function below:
   * function MyComponent() {
   *   return new forgo.Component({
   *     render() {
   *       return "Hello world"
   *     }
   *   })
   * }
   */
  function renderNonElement(
    forgoNode: ForgoPrimitiveNode,
    insertionOptions: NodeInsertionOptions,
    statesAwaitingAttach: NodeAttachedComponentState<any>[]
  ): RenderResult {
    // Text and comment nodes will always be recreated (why?).
    let node: ChildNode;

    if (isNullOrUndefined(forgoNode)) {
      node = env.document.createComment("null component render");
    } else {
      node = env.document.createTextNode(stringOfNode(forgoNode));
    }

    // We have to find a node to replace.
    if (insertionOptions.type === "attached") {
      const childNodes = insertionOptions.parentElement.childNodes;

      // If we're searching in a list, we replace if the current node is a text node.
      if (insertionOptions.length) {
        const targetNode = childNodes[insertionOptions.currentNodeIndex];
        if (
          targetNode.nodeType === TEXT_NODE_TYPE ||
          targetNode.nodeType === COMMENT_NODE_TYPE
        ) {
          targetNode.replaceWith(node);
        } else {
          const nextNode = childNodes[insertionOptions.currentNodeIndex];
          insertionOptions.parentElement.insertBefore(node, nextNode);
        }
      }
      // There are no target nodes available.
      else if (
        childNodes.length === 0 ||
        insertionOptions.currentNodeIndex === 0
      ) {
        insertionOptions.parentElement.prepend(node);
      } else {
        const nextNode = childNodes[insertionOptions.currentNodeIndex];
        insertionOptions.parentElement.insertBefore(node, nextNode);
      }
      syncAttrsAndState(forgoNode, node, true, statesAwaitingAttach);
    } else {
      syncAttrsAndState(forgoNode, node, true, statesAwaitingAttach);
    }
    return {
      nodes: [node],
    };
  }

  /*
    Render a DOM element. Will find + update an existing DOM element (if
    appropriate), or insert a new element.
  
    Such as in the render function below:
    function MyComponent() {
      return {
        render() {
          return <div>Hello world</div>
        }
      }
    }
  */
  function renderDOMElement<TProps extends ForgoDOMElementProps>(
    forgoElement: ForgoDOMElement<TProps>,
    insertionOptions: NodeInsertionOptions,
    statesAwaitingAttach: NodeAttachedComponentState<any>[],
    mountOnPreExistingDOM: boolean
  ): RenderResult {
    // We need to create a detached node
    if (insertionOptions.type === "detached") {
      return addElement(
        forgoElement,
        insertionOptions,
        statesAwaitingAttach,
        mountOnPreExistingDOM
      );
    }
    // We have to find a node to replace.
    else {
      const found = findReplacementCandidateForElement(
        forgoElement,
        insertionOptions
      );

      if (found) {
        return renderExistingElement(
          forgoElement,
          insertionOptions,
          statesAwaitingAttach,
          mountOnPreExistingDOM
        );
      } else {
        return addElement(
          forgoElement,
          insertionOptions,
          statesAwaitingAttach,
          mountOnPreExistingDOM
        );
      }
    }
  }

  /**
   * Let's create a new DOM element.
   */
  function addElement<TProps extends ForgoDOMElementProps>(
    forgoElement: ForgoDOMElement<TProps>,
    insertionOptions: NodeInsertionOptions,
    statesAwaitingAttach: NodeAttachedComponentState<any>[],
    mountOnPreExistingDOM: boolean
  ): RenderResult {
    const oldNode =
      insertionOptions.type === "attached"
        ? (insertionOptions.parentElement as Element).childNodes[
            insertionOptions.currentNodeIndex
          ]
        : null;

    const newElement = createElement(
      forgoElement,
      insertionOptions.parentElement
    );

    syncAttrsAndState(forgoElement, newElement, true, statesAwaitingAttach);

    if (insertionOptions.parentElement) {
      insertionOptions.parentElement.insertBefore(newElement, oldNode);
    }

    renderChildNodes(
      forgoElement,
      newElement,
      insertionOptions,
      mountOnPreExistingDOM
    );

    if (forgoElement.props.ref) {
      forgoElement.props.ref.value = newElement;
    }
    return {
      nodes: [newElement],
    };
  }

  /**
   * If we're updating a DOM element that was rendered in a previous render,
   * reuse the same DOM element. Just sync its children and attributes.
   */
  function renderExistingElement<TProps extends ForgoDOMElementProps>(
    forgoElement: ForgoDOMElement<TProps>,
    insertionOptions: AttachedNodeInsertionOptions,
    statesAwaitingAttach: NodeAttachedComponentState<any>[],
    mountOnPreExistingDOM: boolean
  ): RenderResult {
    const targetElement = insertionOptions.parentElement.childNodes[
      insertionOptions.currentNodeIndex
    ] as Element;

    syncAttrsAndState(forgoElement, targetElement, false, statesAwaitingAttach);

    renderChildNodes(
      forgoElement,
      targetElement,
      insertionOptions,
      mountOnPreExistingDOM
    );

    return {
      nodes: [targetElement],
    };
  }

  /**
   * Render child nodes of an element.
   */
  function renderChildNodes<TProps extends ForgoDOMElementProps>(
    forgoElement: ForgoDOMElement<TProps>,
    element: Element,
    insertionOptions: NodeInsertionOptions,
    mountOnPreExistingDOM: boolean
  ) {
    // If the user gave us exact HTML to stuff into this parent, we can
    // skip/ignore the usual rendering logic
    if (forgoElement.props.dangerouslySetInnerHTML) {
      element.innerHTML = forgoElement.props.dangerouslySetInnerHTML.__html;
    } else {
      // Coerce children to always be an array, for simplicity
      const forgoChildren = flatten([forgoElement.props.children]).filter(
        // Children may or may not be specified
        (x) => x !== undefined && x !== null
      );

      let currentNodeIndex = 0;

      for (const forgoChild of forgoChildren) {
        const { nodes: nodesJustRendered } = internalRender(
          forgoChild,
          {
            type: insertionOptions.type,
            parentElement: element,
            currentNodeIndex,
            length: element.childNodes.length - currentNodeIndex,
          },
          [],
          mountOnPreExistingDOM
        );

        currentNodeIndex += nodesJustRendered.length;
      }
    }
  }

  /*
    Render a Component.
    Such as <MySideBar size="large" />
  */
  function renderComponent<TProps extends ForgoElementBaseProps>(
    forgoComponentElement: ForgoComponentElement<TProps>,
    insertionOptions: NodeInsertionOptions,
    statesAwaitingAttach: NodeAttachedComponentState<any>[],
    mountOnPreExistingDOM: boolean
    // boundary: ForgoComponent<any> | undefined
  ): RenderResult {
    if (insertionOptions.type === "detached") {
      return addComponent(
        forgoComponentElement,
        insertionOptions,
        statesAwaitingAttach,
        mountOnPreExistingDOM
      );
    }
    // We have to find a node to replace.
    else {
      const found = findReplacementCandidateForComponent(
        forgoComponentElement,
        insertionOptions,
        statesAwaitingAttach.length
      );

      if (found) {
        return renderExistingComponent(
          forgoComponentElement,
          insertionOptions,
          statesAwaitingAttach,
          mountOnPreExistingDOM
        );
      } else {
        return addComponent(
          forgoComponentElement,
          insertionOptions,
          statesAwaitingAttach,
          mountOnPreExistingDOM
        );
      }
    }
  }

  function addComponent<TProps extends ForgoElementBaseProps>(
    forgoComponentElement: ForgoComponentElement<TProps>,
    insertionOptions: NodeInsertionOptions,
    statesAwaitingAttach: NodeAttachedComponentState<any>[],
    mountOnPreExistingDOM: boolean
  ): RenderResult {
    // if statesAwaitingAttach.length = 4, then the next component (which will
    // be added further down) will be at index = 4 (ie, the 5th element)
    const componentIndex = statesAwaitingAttach.length;

    const ctor = forgoComponentElement.type;
    const component = assertIsComponent(
      ctor,
      ctor(forgoComponentElement.props)
    );
    component.__internal.element.componentIndex = componentIndex;

    // Create new component state
    // ... and push it to statesAwaitAttach[]
    const newComponentState: NodeAttachedComponentState<any> = {
      key: forgoComponentElement.key,
      ctor,
      componentElement: forgoComponentElement,
      component,
      props: forgoComponentElement.props,
      nodes: [],
      isMounted: false,
    };

    const statesToAttach = statesAwaitingAttach.concat(newComponentState);

    return withErrorBoundary(
      forgoComponentElement,
      component,
      insertionOptions,
      statesToAttach,
      () => {
        // Create an element by rendering the component
        const newForgoElement = component.__internal.registeredMethods.render(
          forgoComponentElement.props,
          component
        );

        // Create new node insertion options.
        const newInsertionOptions: NodeInsertionOptions =
          insertionOptions.type === "detached"
            ? insertionOptions
            : {
                type: "attached",
                currentNodeIndex: insertionOptions.currentNodeIndex,
                length: mountOnPreExistingDOM ? insertionOptions.length : 0,
                parentElement: insertionOptions.parentElement,
              };

        // Pass it on for rendering...
        const renderResult = internalRender(
          newForgoElement,
          newInsertionOptions,
          statesToAttach,
          mountOnPreExistingDOM
        );

        // In case we rendered an array, set the node to the first node.
        // We do this because args.element.node would be set to the last node otherwise.
        newComponentState.nodes = renderResult.nodes;
        newComponentState.component.__internal.element.node =
          renderResult.nodes[0];

        // No previousNode since new component. So just args and not
        // afterRenderArgs.
        lifecycleEmitters.afterRender(
          component,
          forgoComponentElement.props,
          undefined
        );

        return renderResult;
      },
      mountOnPreExistingDOM
    );
  }

  function renderExistingComponent<TProps extends ForgoElementBaseProps>(
    forgoComponentElement: ForgoComponentElement<TProps>,
    insertionOptions: AttachedNodeInsertionOptions,
    statesAwaitingAttach: NodeAttachedComponentState<any>[],
    mountOnPreExistingDOM: boolean
  ): RenderResult {
    // if statesAwaitingAttach.length = 4, then the next component (which will
    // be added further down) will be at index = 4 (ie, the 5th element)
    const componentIndex = statesAwaitingAttach.length;

    const targetNode =
      insertionOptions.parentElement.childNodes[
        insertionOptions.currentNodeIndex
      ];

    const state = getForgoState(targetNode);
    const componentState = state.components[componentIndex];

    if (
      lifecycleEmitters.shouldUpdate(
        componentState.component,
        forgoComponentElement.props,
        componentState.props
      )
    ) {
      // Since we have compatible state already stored, we'll push the
      // savedComponentState into statesAwaitingAttach for later attachment.
      const updatedComponentState = {
        ...componentState,
        props: forgoComponentElement.props,
      };

      // Get a new element by calling render on existing component.
      const newForgoNode =
        updatedComponentState.component.__internal.registeredMethods.render(
          forgoComponentElement.props,
          updatedComponentState.component
        );

      const allStates = statesAwaitingAttach.concat(updatedComponentState);

      const previousNode = componentState.component.__internal.element.node;

      const renderResult = withErrorBoundary(
        forgoComponentElement,
        updatedComponentState.component,
        insertionOptions,
        allStates,
        () => {
          // Create new node insertion options.
          const newInsertionOptions: NodeInsertionOptions = {
            type: "attached",
            currentNodeIndex: insertionOptions.currentNodeIndex,
            length: updatedComponentState.nodes.length,
            parentElement: insertionOptions.parentElement,
          };

          // Pass it on for rendering...
          const renderResult = internalRender(
            newForgoNode,
            newInsertionOptions,
            allStates,
            mountOnPreExistingDOM
          );

          // In case we rendered an array, set the node to the first node.
          // We do this because args.element.node would be set to the last node otherwise.
          componentState.nodes = renderResult.nodes;
          componentState.component.__internal.element.node =
            renderResult.nodes[0];

          return renderResult;
        },
        mountOnPreExistingDOM
      );

      lifecycleEmitters.afterRender(
        updatedComponentState.component,
        forgoComponentElement.props,
        previousNode
      );

      return renderResult;
    }
    // shouldUpdate() returned false
    else {
      const indexOfNode = findNodeIndex(
        insertionOptions.parentElement.childNodes,
        componentState.component.__internal.element.node
      );

      return {
        nodes: sliceNodes(
          insertionOptions.parentElement.childNodes,
          indexOfNode,
          indexOfNode + componentState.nodes.length
        ),
      };
    }
  }

  function withErrorBoundary<TProps extends ForgoElementBaseProps>(
    forgoComponentElement: ForgoComponentElement<TProps>,
    component: Component<any>,
    insertionOptions: NodeInsertionOptions,
    statesToAttach: NodeAttachedComponentState<any>[],
    exec: () => RenderResult,
    mountOnPreExistingDOM: boolean
  ): RenderResult {
    try {
      return exec();
    } catch (error) {
      if (component.__internal.registeredMethods.error) {
        const newForgoElement = component.__internal.registeredMethods.error(
          forgoComponentElement.props,
          error,
          component
        );
        return internalRender(
          newForgoElement,
          insertionOptions,
          statesToAttach,
          mountOnPreExistingDOM
        );
      } else {
        throw error;
      }
    }
  }

  /*
    Render an array of components. 
    Called when a Component returns an array (or fragment) in its render method.  
  */
  function renderArray(
    forgoNodes: ForgoNode[],
    insertionOptions: NodeInsertionOptions,
    statesAwaitingAttach: NodeAttachedComponentState<any>[],
    mountOnPreExistingDOM: boolean
  ): RenderResult {
    const flattenedNodes = flatten(forgoNodes);

    if (insertionOptions.type === "detached") {
      throw new Error(
        "Arrays and fragments cannot be rendered at the top level."
      );
    } else {
      const renderResults: RenderResult = { nodes: [] };

      let currentNodeIndex = insertionOptions.currentNodeIndex;
      let numNodes = insertionOptions.length;

      for (const forgoNode of flattenedNodes) {
        const totalNodesBeforeRender =
          insertionOptions.parentElement.childNodes.length;

        const newInsertionOptions: AttachedNodeInsertionOptions = {
          ...insertionOptions,
          currentNodeIndex,
          length: numNodes,
        };

        const renderResult = internalRender(
          forgoNode,
          newInsertionOptions,
          statesAwaitingAttach,
          mountOnPreExistingDOM
        );

        renderResults.nodes.push(...renderResult.nodes);

        const totalNodesAfterRender =
          insertionOptions.parentElement.childNodes.length;

        const numNodesRemoved =
          totalNodesBeforeRender +
          renderResult.nodes.length -
          totalNodesAfterRender;

        currentNodeIndex += renderResult.nodes.length;
        numNodes -= numNodesRemoved;
      }

      return renderResults;
    }
  }

  /*
    When states are attached to a new node or when states are reattached, 
    some of the old component states need to go away. The corresponding components 
    will need to be unmounted.

    While rendering, the component gets reused if the ctor is the same. If the 
    ctor is different, the component is discarded. And hence needs to be unmounted.
    So we check the ctor type in old and new.
  */
  function findIndexOfFirstIncompatibleState(
    newStates: NodeAttachedComponentState<any>[],
    oldStates: NodeAttachedComponentState<any>[]
  ): number {
    let i = 0;

    for (const newState of newStates) {
      if (oldStates.length > i) {
        const oldState = oldStates[i];
        if (oldState.component !== newState.component) {
          break;
        }
        i++;
      } else {
        break;
      }
    }

    return i;
  }

  /**
   * Unmount components above an index. This is going to be passed a stale
   * state[].
   *
   * The `unmount` lifecycle event will be called.
   */
  function unmountComponents(
    statesAwaitingAttach: NodeAttachedComponentState<any>[],
    oldComponentStates: NodeAttachedComponentState<any>[] | undefined
  ) {
    if (!oldComponentStates) return;

    // If the parent has already unmounted, we can skip checks on children.
    let parentHasUnmounted = false;

    const indexOfFirstIncompatibleState = findIndexOfFirstIncompatibleState(
      statesAwaitingAttach,
      oldComponentStates
    );

    for (
      let i = indexOfFirstIncompatibleState;
      i < oldComponentStates.length;
      i++
    ) {
      const state = oldComponentStates[i];
      const component = state.component;
      // Render if:
      //  - parent has already unmounted
      //  - OR for all nodes:
      //  -   node is disconnected
      //  -   OR node connected to a different component
      if (
        parentHasUnmounted ||
        state.nodes.every((x) => {
          if (!x.isConnected) {
            return true;
          } else {
            const stateOnCurrentNode = getForgoState(x);
            return (
              stateOnCurrentNode.components[i] === undefined ||
              stateOnCurrentNode.components[i].component !== state.component
            );
          }
        })
      ) {
        if (!component.__internal.unmounted) {
          component.__internal.unmounted = true;
          lifecycleEmitters.unmount(component, state.props);
        }
        parentHasUnmounted = true;
      }
    }
  }

  /**
   * Mount components above an index. This is going to be passed the new
   * state[].
   */
  function mountComponents(
    statesAwaitingAttach: NodeAttachedComponentState<any>[],
    oldComponentStates: NodeAttachedComponentState<any>[] | undefined
  ) {
    const indexOfFirstIncompatibleState = oldComponentStates
      ? findIndexOfFirstIncompatibleState(
          statesAwaitingAttach,
          oldComponentStates
        )
      : 0;

    for (
      let i = indexOfFirstIncompatibleState;
      i < statesAwaitingAttach.length;
      i++
    ) {
      const state = statesAwaitingAttach[i];
      // This function is called in every syncStateAndProps() call, so many of
      // the calls will be for already-mounted components. Only fire the mount
      // lifecycle events when appropriate.
      if (!state.isMounted) {
        state.isMounted = true;
        // Set this before calling the lifecycle handlers to fix #70
        lifecycleEmitters.mount(state.component, state.props);
      }
    }
  }

  /**
   * When we try to find replacement candidates for DOM nodes,
   * we try to:
   *   a) match by the key
   *   b) match by the tagname
   */
  function findReplacementCandidateForElement<
    TProps extends ForgoDOMElementProps
  >(
    forgoElement: ForgoDOMElement<TProps>,
    insertionOptions: AttachedNodeInsertionOptions
  ): boolean {
    const nodes = insertionOptions.parentElement.childNodes;
    for (
      let i = insertionOptions.currentNodeIndex;
      i < insertionOptions.currentNodeIndex + insertionOptions.length;
      i++
    ) {
      const node = nodes[i] as ChildNode;
      if (nodeIsElement(node)) {
        const stateOnNode = getForgoState(node);
        // If the user stuffs random elements into the DOM manually, we don't
        // want to treat them as replacement candidates - they should be left
        // alone.
        if (!stateOnNode) continue;

        if (
          forgoElement.key !== undefined &&
          stateOnNode?.key === forgoElement.key
        ) {
          return true;
        } else {
          // If the candidate has a key defined,
          //  we don't match it with an unkeyed forgo element
          if (
            node.tagName.toLowerCase() === forgoElement.type &&
            (stateOnNode === undefined || stateOnNode.key === undefined)
          ) {
            return true;
          }
        }
      }
    }
    // Let's check deleted nodes as well.
    if (forgoElement.key !== undefined) {
      const deletedNodes = getDeletedNodes(insertionOptions.parentElement);
      for (let i = 0; i < deletedNodes.length; i++) {
        const { node } = deletedNodes[i];
        const stateOnNode = getForgoState(node);
        if (stateOnNode?.key === forgoElement.key) {
          // Remove it from deletedNodes.
          deletedNodes.splice(i, 1);
          // Append it to the beginning of the node list.
          const firstNodeInSearchList =
            nodes[insertionOptions.currentNodeIndex];
          if (!isNullOrUndefined(firstNodeInSearchList)) {
            insertionOptions.parentElement.insertBefore(
              node,
              firstNodeInSearchList
            );
          } else {
            insertionOptions.parentElement.appendChild(node);
          }
          return true;
        }
      }
    }
    return false;
  }

  /**
   * When we try to find replacement candidates for Components,
   * we try to:
   *   a) match by the key
   *   b) match by the component constructor
   */
  function findReplacementCandidateForComponent<
    TProps extends ForgoDOMElementProps
  >(
    forgoElement: ForgoComponentElement<TProps>,
    insertionOptions: AttachedNodeInsertionOptions,
    componentIndex: number
  ): boolean {
    const nodes = insertionOptions.parentElement.childNodes;
    for (
      let i = insertionOptions.currentNodeIndex;
      i < insertionOptions.currentNodeIndex + insertionOptions.length;
      i++
    ) {
      const node = nodes[i] as ChildNode;
      const stateOnNode = getForgoState(node);
      if (stateOnNode && stateOnNode.components.length > componentIndex) {
        if (forgoElement.key !== undefined) {
          if (
            stateOnNode.components[componentIndex].ctor === forgoElement.type &&
            stateOnNode.components[componentIndex].key === forgoElement.key
          ) {
            return true;
          }
        } else {
          if (
            stateOnNode.components[componentIndex].ctor === forgoElement.type
          ) {
            return true;
          }
        }
      }
    }

    // Check if a keyed component is mounted on this node.
    function nodeBelongsToKeyedComponent(
      node: ChildNode,
      forgoElement: ForgoComponentElement<TProps>,
      componentIndex: number
    ) {
      const stateOnNode = getForgoState(node);
      if (stateOnNode && stateOnNode.components.length > componentIndex) {
        if (
          stateOnNode.components[componentIndex].ctor === forgoElement.type &&
          stateOnNode.components[componentIndex].key === forgoElement.key
        ) {
          return true;
        }
      }
      return false;
    }

    // Let's check deleted nodes as well.
    if (forgoElement.key !== undefined) {
      const deletedNodes = getDeletedNodes(insertionOptions.parentElement);
      for (let i = 0; i < deletedNodes.length; i++) {
        const { node: deletedNode } = deletedNodes[i];
        if (
          nodeBelongsToKeyedComponent(deletedNode, forgoElement, componentIndex)
        ) {
          const nodesToResurrect: ChildNode[] = [deletedNode];
          // Found a match!
          // Collect all consecutive matching nodes.
          for (let j = i + 1; j < deletedNodes.length; j++) {
            const { node: subsequentNode } = deletedNodes[j];
            if (
              nodeBelongsToKeyedComponent(
                subsequentNode,
                forgoElement,
                componentIndex
              )
            ) {
              nodesToResurrect.push(subsequentNode);
            }
          }
          // Remove them from deletedNodes.
          deletedNodes.splice(i, nodesToResurrect.length);

          // Append resurrected nodes to the beginning of the node list.
          const insertBeforeNode = nodes[insertionOptions.currentNodeIndex];

          if (!isNullOrUndefined(insertBeforeNode)) {
            for (const node of nodesToResurrect) {
              insertionOptions.parentElement.insertBefore(
                node,
                insertBeforeNode
              );
            }
          } else {
            for (const node of nodesToResurrect) {
              insertionOptions.parentElement.appendChild(node);
            }
          }

          return true;
        }
      }
    }
    return false;
  }

  /**
   * Attach props from the forgoElement onto the DOM node. We also need to attach
   * states from statesAwaitingAttach
   */
  function syncAttrsAndState(
    forgoNode: ForgoNode,
    node: ChildNode,
    isNewNode: boolean,
    statesAwaitingAttach: NodeAttachedComponentState<any>[]
  ) {
    // We have to inject node into the args object.
    // components are already holding a reference to the args object.
    // They don't know yet that args.element.node is undefined.
    if (statesAwaitingAttach.length > 0) {
      statesAwaitingAttach[
        statesAwaitingAttach.length - 1
      ].component.__internal.element.node = node;
    }

    if (isForgoElement(forgoNode)) {
      const existingState = getForgoState(node);

      // Remove props which don't exist
      if (existingState && existingState.props) {
        for (const key in existingState.props) {
          if (!(key in forgoNode.props)) {
            if (key !== "children" && key !== "xmlns") {
              if (
                node.nodeType === TEXT_NODE_TYPE ||
                node.nodeType === COMMENT_NODE_TYPE
              ) {
                delete (node as any)[key];
              } else if (node instanceof env.__internal.HTMLElement) {
                if (key in node) {
                  delete (node as any)[key];
                } else {
                  (node as HTMLElement).removeAttribute(key);
                }
              } else {
                (node as Element).removeAttribute(key);
              }
            }
          }
        }
      } else {
        // A new node which doesn't have forgoState is SSR.
        // We have to manually extinguish props
        if (!isNewNode && nodeIsElement(node)) {
          if (node.hasAttributes()) {
            const attributes = Array.from(node.attributes);
            for (const attr of attributes) {
              const key = attr.name;
              if (!(key in forgoNode.props)) {
                node.removeAttribute(key);
              }
            }
          }
        }
      }

      // TODO: What preact does to figure out attr vs prop
      //  - do a (key in element) check.
      const entries = Object.entries(forgoNode.props);
      for (const [key, value] of entries) {
        if (suppressedAttributes.includes(key)) continue;

        // The browser will sometimes perform side effects if an attribute is
        // set, even if its value hasn't changed, so only update attrs if
        // necessary. See issue #32.
        if (existingState?.props?.[key] !== value) {
          if (key !== "children" && key !== "xmlns") {
            if (
              node.nodeType === TEXT_NODE_TYPE ||
              node.nodeType === COMMENT_NODE_TYPE
            ) {
              (node as any)[key] = value;
            } else if (node instanceof env.__internal.HTMLElement) {
              if (key === "style") {
                // Optimization: many times in CSS to JS, style objects are re-used.
                // If they're the same, skip the expensive styleToString() call.
                if (
                  existingState === undefined ||
                  existingState.style === undefined ||
                  existingState.style !== forgoNode.props.style
                ) {
                  const stringOfCSS = styleToString(forgoNode.props.style);
                  if ((node as HTMLElement).style.cssText !== stringOfCSS) {
                    (node as HTMLElement).style.cssText = stringOfCSS;
                  }
                }
              }
              // This optimization is copied from preact.
              else if (key === "onblur") {
                (node as any)[key] = handlerDisabledOnNodeDelete(node, value);
              } else if (key in node) {
                (node as any)[key] = value;
              } else {
                (node as any).setAttribute(key, value);
              }
            } else {
              if (typeof value === "string") {
                (node as Element).setAttribute(key, value);
              } else {
                (node as any)[key] = value;
              }
            }
          }
        }
      }

      // Now attach the internal forgo state.
      const state: NodeAttachedState = {
        ...existingState,
        key: forgoNode.key,
        props: forgoNode.props,
        components: statesAwaitingAttach,
      };

      setForgoState(node, state);
    } else {
      // Now attach the internal forgo state.
      const state: NodeAttachedState = {
        components: statesAwaitingAttach,
        lookups: {
          keyedComponentNodes: new Map(),
          newlyAddedKeyedComponentNodes: new Map(),
          newlyAddedKeyedElementNodes: new Map(),
          keyedElementNodes: new Map(),
        },
      };

      setForgoState(node, state);
    }
  }

  /*
    Mount will render the DOM as a child of the specified container element.
  */
  function mount(
    forgoNode: ForgoNode,
    container: Element | string | null
  ): RenderResult {
    const parentElement = (
      isString(container) ? env.document.querySelector(container) : container
    ) as Element;

    if (isNullOrUndefined(parentElement)) {
      throw new Error(
        `The mount() function was called on a non-element (${
          typeof container === "string" ? container : container?.tagName
        }).`
      );
    }
    if (parentElement.nodeType !== ELEMENT_NODE_TYPE) {
      throw new Error(
        "The container argument to the mount() function should be an HTML element."
      );
    }

    const mountOnPreExistingDOM = parentElement.childNodes.length > 0;
    const result = internalRender(
      forgoNode,
      {
        type: "attached",
        currentNodeIndex: 0,
        length: parentElement.childNodes.length,
        parentElement,
      },
      [],
      mountOnPreExistingDOM
    );

    // Remove excess nodes.
    // This happens when there are pre-existing nodes.
    if (result.nodes.length < parentElement.childNodes.length) {
      const nodesToRemove = sliceNodes(
        parentElement.childNodes,
        result.nodes.length,
        parentElement.childNodes.length
      );
      for (const node of nodesToRemove) {
        node.remove();
      }
    }

    return result;
  }

  function unmount(container: Element | string | null) {
    const parentElement = (
      isString(container) ? env.document.querySelector(container) : container
    ) as Element;

    if (isNullOrUndefined(parentElement)) {
      throw new Error(
        `The unmount() function was called on a non-element (${
          typeof container === "string" ? container : container?.tagName
        }).`
      );
    }
    if (parentElement.nodeType !== ELEMENT_NODE_TYPE) {
      throw new Error(
        "The container argument to the unmount() function should be an HTML element."
      );
    }
  }

  /*
    This render function returns the rendered dom node.
    forgoNode is the node to render.
  */
  function render(forgoNode: ForgoNode): {
    node: ChildNode;
    nodes: ChildNode[];
  } {
    const renderResult = internalRender(
      forgoNode,
      {
        type: "detached",
        parentElement: undefined,
      },
      [],
      false
    );
    return { node: renderResult.nodes[0], nodes: renderResult.nodes };
  }

  /**
   * Code inside a component will call rerender whenever it wants to rerender.
   * The following function is what they'll need to call.

   * Given only a DOM element, how do we know what component to render? We'll
   * fetch all that information from the state information stored on the
   * element.

   * This is attached to a node inside a NodeAttachedState structure.

   * @param forceUnmount Allows a user to explicitly tear down a Forgo app from
      outside the framework
   */
  function rerender(
    element: ForgoElementArg | undefined,
    props?: any
  ): RenderResult {
    if (!element?.node) {
      throw new Error(`Missing node information in rerender() argument.`);
    }

    const parentElement = element.node.parentElement;
    if (parentElement !== null) {
      const state = getForgoState(element.node);
      const originalComponentState = state.components[element.componentIndex];
      const parentStates = state.components.slice(0, element.componentIndex);

      const insertionOptions: AttachedNodeInsertionOptions = {
        type: "attached",
        currentNodeIndex: element.nodeIndex,
        length: originalComponentState.nodes.length,
        parentElement,
      };

      return renderExistingComponent(
        originalComponentState.componentElement,
        insertionOptions,
        parentStates,
        false
      );
    } else {
      return { nodes: [] };
    }
  }

  function createElement(
    forgoElement: ForgoDOMElement<{ is?: string; xmlns?: string }>,
    parentElement: Element | undefined
  ) {
    const namespaceURI =
      forgoElement.props.xmlns !== undefined
        ? (forgoElement.props.xmlns as string)
        : forgoElement.type === "svg"
        ? SVG_NAMESPACE
        : parentElement
        ? parentElement.namespaceURI
        : null;

    if (forgoElement.props.is !== undefined) {
      return namespaceURI !== null
        ? env.document.createElementNS(namespaceURI, forgoElement.type, {
            is: forgoElement.props.is,
          })
        : env.document.createElement(forgoElement.type, {
            is: forgoElement.props.is,
          });
    } else {
      return namespaceURI !== null
        ? env.document.createElementNS(namespaceURI, forgoElement.type)
        : env.document.createElement(forgoElement.type);
    }
  }

  return {
    mount,
    unmount,
    render,
    rerender,
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

/**
 * Attach a new Forgo application to a DOM element
 */
export function mount(
  forgoNode: ForgoNode,
  container: Element | string | null
): RenderResult {
  return forgoInstance.mount(forgoNode, container);
}

/**
 * Unmount a Forgo application from outside.
 * @param container The root element that the Forgo app was mounted onto
 */
export function unmount(container: Element | string | null): void {
  return forgoInstance.unmount(container);
}

export function render(forgoNode: ForgoNode): {
  node: ChildNode;
  nodes: ChildNode[];
} {
  return forgoInstance.render(forgoNode);
}

export function rerender(
  element: ForgoElementArg | undefined,
  props?: any
): RenderResult {
  return forgoInstance.rerender(element, props);
}

/*
  This recursively flattens an array or a Fragment.
  Fragments are treated as arrays, with the children prop being array items.
*/
function flatten(itemOrItems: ForgoNode | ForgoNode[]): ForgoNode[] {
  function recurse(
    itemOrItems: ForgoNode | ForgoNode[],
    ret: ForgoNode[] = []
  ) {
    const items = Array.isArray(itemOrItems)
      ? itemOrItems
      : isForgoFragment(itemOrItems)
      ? Array.isArray(itemOrItems.props.children)
        ? itemOrItems.props.children
        : !isNullOrUndefined(itemOrItems.props.children)
        ? [itemOrItems.props.children]
        : []
      : [itemOrItems];
    for (const entry of items) {
      if (Array.isArray(entry) || isForgoFragment(entry)) {
        recurse(entry, ret);
      } else {
        ret.push(entry);
      }
    }
    return ret;
  }

  return recurse(itemOrItems, []);
}

/**
 * ForgoNodes can be primitive types. Convert all primitive types to their
 * string representation.
 */
function stringOfNode(node: ForgoNonEmptyPrimitiveNode): string {
  return node.toString();
}

/**
 * Get Node Types
 */
function isForgoElement(forgoNode: ForgoNode): forgoNode is ForgoElement<any> {
  return (
    forgoNode !== undefined &&
    forgoNode !== null &&
    (forgoNode as any).__is_forgo_element__ === true
  );
}

function isForgoDOMElement(node: ForgoNode): node is ForgoDOMElement<any> {
  return isForgoElement(node) && typeof node.type === "string";
}

function isForgoFragment(node: ForgoNode): node is ForgoFragment {
  return node !== undefined && node !== null && (node as any).type === Fragment;
}

/*
  Get the state (NodeAttachedState) saved into an element.
*/
export function getForgoState(node: ChildNode): NodeAttachedState {
  if (node.__forgo === undefined) {
    node.__forgo = {
      props: {},
      components: [],
      lookups: {
        keyedComponentNodes: new Map(),
        newlyAddedKeyedComponentNodes: new Map(),
        keyedElementNodes: new Map(),
        newlyAddedKeyedElementNodes: new Map(),
      },
    };
  }
  return node.__forgo;
}

/*
  Sets the state (NodeAttachedState) on an element.
*/
export function setForgoState(node: ChildNode, state: NodeAttachedState): void {
  node.__forgo = state;
}

/*
  We maintain a list of deleted childNodes on an element.
  In case we need to resurrect it - on account of a subsequent out-of-order key referring that node.
*/
function getDeletedNodes(element: Element): DeletedNode[] {
  if (!element.__forgo_deletedNodes) {
    element.__forgo_deletedNodes = [];
  }
  return element.__forgo_deletedNodes;
}

function clearDeletedNodes(element: Element) {
  if (element.__forgo_deletedNodes) {
    element.__forgo_deletedNodes = [];
  }
}

/**
 * We bridge the old component syntax to the new syntax until our next breaking release
 */
export type ForgoSimpleComponent<TProps extends object> = {
  render: (
    props: TProps & ForgoElementBaseProps,
    args: ForgoRenderArgs
  ) => ForgoNode | ForgoNode[];
  afterRender?: (
    props: TProps & ForgoElementBaseProps,
    args: ForgoAfterRenderArgs
  ) => void;
  error?: (
    props: TProps & ForgoElementBaseProps,
    args: ForgoErrorArgs
  ) => ForgoNode;
  mount?: (
    props: TProps & ForgoElementBaseProps,
    args: ForgoRenderArgs
  ) => void;
  unmount?: (
    props: TProps & ForgoElementBaseProps,
    args: ForgoRenderArgs
  ) => void;
  shouldUpdate?: (
    newProps: TProps & ForgoElementBaseProps,
    oldProps: TProps & ForgoElementBaseProps
  ) => boolean;
  __forgo?: { unmounted?: boolean };
};

export type ForgoRenderArgs = {
  element: ForgoElementArg;
  update: (props?: any) => RenderResult;
};
export type ForgoAfterRenderArgs = ForgoRenderArgs & {
  previousNode?: ChildNode;
};
export type ForgoErrorArgs = ForgoRenderArgs & {
  error: any;
};

// We export this so forgo-state & friends can publish non-breaking
// compatibility releases
export const simpleComponentSyntaxCompat = <TProps extends object>(
  simpleComponent: ForgoSimpleComponent<TProps>
): Component<TProps> => {
  const mkRenderArgs = (component: Component<TProps>): ForgoRenderArgs => ({
    get element() {
      return component.__internal.element;
    },
    update(props) {
      return component.update(props as unknown as TProps);
    },
  });

  const componentBody: ForgoComponentMethods<TProps> = {
    render(props, component) {
      return simpleComponent.render(props, mkRenderArgs(component));
    },
  };
  if (simpleComponent.error) {
    componentBody.error = (props, error) => {
      return simpleComponent.error!(
        props,
        Object.assign(mkRenderArgs(component), { error })
      );
    };
  }
  const component = new Component<TProps>({
    ...componentBody,
  });
  if (simpleComponent.mount) {
    component.mount((props) => {
      simpleComponent.mount!(props, mkRenderArgs(component));
    });
  }
  if (simpleComponent.unmount) {
    component.unmount((props) => {
      simpleComponent.unmount!(props, mkRenderArgs(component));
    });
  }
  if (simpleComponent.afterRender) {
    component.afterRender((props, previousNode) => {
      simpleComponent.afterRender!(
        props,
        Object.assign(mkRenderArgs(component), { previousNode })
      );
    });
  }
  if (simpleComponent.shouldUpdate) {
    component.shouldUpdate((newProps, oldProps) => {
      return simpleComponent.shouldUpdate!(newProps, oldProps);
    });
  }
  return component;
};

/*
  Throw if component is a non-component
*/
function assertIsComponent<TProps extends object>(
  ctor: ForgoNewComponentCtor<TProps> | ForgoSimpleComponentCtor<TProps>,
  component: Component<TProps> | ForgoSimpleComponent<TProps>
): Component<TProps> {
  if (!(component instanceof Component) && Reflect.has(component, "render")) {
    return simpleComponentSyntaxCompat(component);
  }

  if (!(component instanceof Component)) {
    throw new Error(
      `${
        ctor.name || "Unnamed"
      } component constructor must return an instance of the Component class`
    );
  }

  return component;
}

function isNullOrUndefined<T>(
  value: T | null | undefined
): value is null | undefined {
  return value === null || value === undefined;
}

function isString(val: unknown): val is string {
  return typeof val === "string";
}

function nodeIsElement(node: ChildNode): node is Element {
  return node.nodeType === ELEMENT_NODE_TYPE;
}

// Thanks Artem Bochkarev
function styleToString(style: any): string {
  if (typeof style === "string") {
    return style;
  } else if (style === undefined || style === null) {
    return "";
  } else {
    return Object.keys(style).reduce(
      (acc, key) =>
        acc +
        key
          .split(/(?=[A-Z])/)
          .join("-")
          .toLowerCase() +
        ":" +
        style[key] +
        ";",
      ""
    );
  }
}

/**
 * node.childNodes is some funky data structure that's not really not an array,
 * so we can't just slice it like normal
 */
function sliceNodes(
  nodes: ArrayLike<ChildNode>,
  from: number,
  to: number
): ChildNode[] {
  return Array.from(nodes).slice(from, to);
}

/**
 * node.childNodes is some funky data structure that's not really not an array,
 * so we can't just search for the value like normal
 */
function findNodeIndex(
  nodes: ArrayLike<ChildNode>,
  element: ChildNode | undefined
): number {
  if (!element) return -1;
  return Array.from(nodes).indexOf(element);
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
