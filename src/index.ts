// Some utility types
type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property];
};

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
export type ForgoElementProps = {
  children?: ForgoNode | ForgoNode[];
};

// Since we'll set any attribute the user passes us, we need to be sure not to
// set Forgo-only attributes that don't make sense to appear in the DOM
const suppressedAttributes = ["ref", "dangerouslySetInnerHTML"];
export type ForgoDOMElementProps = {
  xmlns?: string;
  ref?: ForgoRef<Element>;
  dangerouslySetInnerHTML?: { __html: string };
} & ForgoElementProps;

export type ForgoComponentProps = ForgoElementProps;

export type ForgoComponentCtor<Props extends object = object> = (
  props: Props & ForgoComponentProps
) => ForgoComponent<Props>;

export type ForgoNewComponentCtor<Props extends object = object> = (
  props: Props & ForgoComponentProps
) => Component<Props>;

export type ForgoElementArg = {
  node?: ChildNode;
  componentIndex: number;
};

export type ForgoKeyType = string | number;

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
export type ForgoElementBase<TProps extends ForgoElementProps> = {
  key?: ForgoKeyType;
  props: TProps;
  __is_forgo_element__: true;
};

export type ForgoDOMElement<TProps extends ForgoDOMElementProps> =
  ForgoElementBase<TProps> & {
    type: string;
  };

export type ForgoComponentElement<TProps extends ForgoComponentProps> =
  ForgoElementBase<TProps> & {
    type: ForgoNewComponentCtor<TProps>;
  };

export type ForgoFragment = {
  type: typeof Fragment;
  props: { children?: ForgoNode | ForgoNode[] };
  __is_forgo_element__: true;
};

export type ForgoElement<TProps extends ForgoDOMElementProps> =
  | ForgoDOMElement<TProps>
  | ForgoComponentElement<TProps>;

export type ForgoNonEmptyPrimitiveNode =
  | string
  | number
  | boolean
  | object
  | bigint
  | null
  | undefined;

export type ForgoPrimitiveNode = ForgoNonEmptyPrimitiveNode | null | undefined;

/**
 * Anything renderable by Forgo, whether from an external source (e.g.,
 * component.render() output), or internally (e.g., DOM nodes)
 */
export type ForgoNode = ForgoPrimitiveNode | ForgoElement<any> | ForgoFragment;

/*
 * Forgo stores Component state on the element on which it is mounted.
 *
 * Say Custom1 renders Custom2 which renders Custom3 which renders
 * <div>Hello</div>. In this case, the components Custom1, Custom2 and Custom3
 * are stored on the div.
 *
 * You can also see that it gets passed around as pendingStates in the render
 * methods. That's because when Custom1 renders Custom2, there isn't a real DOM
 * node available to attach the state to. So the states are passed around until
 * the last component renders a real DOM node or nodes.
 *
 * In addition it holds a bunch of other things. Like for example, a key which
 * uniquely identifies a child element when rendering a list.
 */
export type ComponentState<TProps extends object> = {
  key?: string | number;
  ctor: ForgoNewComponentCtor<TProps> | ForgoComponentCtor<TProps>;
  component: Component<TProps>;
  props: TProps;
  nodes: ChildNode[];
  isMounted: boolean;
};

/*
 * This is the state data structure which gets stored on a node.
 * See explanation for ComponentState<TProps>
 */
export type NodeAttachedState = {
  key?: string | number;
  props?: { [key: string]: any };
  components: ComponentState<any>[];
  style?: { [key: string]: any };
  deleted?: boolean;
  lookups: {
    deletedUnkeyedNodes: DeletedNode[];
    deletedKeyedComponentNodes: Map<string | number, ChildNode[]>;
    keyedComponentNodes: Map<string | number, ChildNode[]>;
    newlyAddedKeyedComponentNodes: Map<string | number, ChildNode[]>;
    deletedKeyedElementNodes: Map<string | number, ChildNode>;
    keyedElementNodes: Map<string | number, ChildNode>;
    newlyAddedKeyedElementNodes: Map<string | number, ChildNode>;
    // This is a counter to check when to reset temp loopups (newly*)
    renderCount: number;
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
 * Nodes will be created as detached DOM nodes, and will not be attached to a parent.
 */
export type DetachedNodeInsertionOptions = {
  type: "detached";
};

/**
 * Instructs the renderer to search for an existing node to modify or replace,
 * before creating a new node.
 */
export type DOMNodeInsertionOptions = {
  type: "search";
  /**
   * The element that holds the previously-rendered version of this component
   */
  parentElement: Element;
  /**
   * Where under the parent's children to find the start of this component
   */
  currentNodeIndex: number;
  /**
   * How many elements after currentNodeIndex belong to the element we're
   * searching
   */
  length: number;
};

/*
 * Decides how the called function attaches nodes to the supplied parent
 */
export type NodeInsertionOptions =
  | DetachedNodeInsertionOptions
  | DOMNodeInsertionOptions;

/*
 * Result of the render functions.
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
  }
}

/*
 * Fragment constructor.
 * We simply use it as a marker in jsx-runtime.
 */
export const Fragment: unique symbol = Symbol.for("FORGO_FRAGMENT");

/*
 * HTML Namespaces
 */
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MATH_NAMESPACE = "http://www.w3.org/1998/Math/MathML";

/*
 * These come from the browser's Node interface, which defines an enum of node
 * types. We'd like to just reference Node.<whatever>, but JSDOM makes us jump
 * through hoops to do that because it hates adding new globals. Getting around
 * that is more complex, and more bytes on the wire, than just hardcoding the
 * constants we care about.
 */
const ELEMENT_NODE_TYPE = 1;
const TEXT_NODE_TYPE = 3;
const COMMENT_NODE_TYPE = 8;

/*
 * These are methods that a component may implement. Every component is required
 * to have a render method.
 * 1. render() returns the actual DOM to render.
 * 2. error() is called when this component, or one of its children, throws an
 *    error.
 */
export interface ForgoComponentMethods<Props extends ForgoComponentProps> {
  render: (
    props: Props & ForgoComponentProps,
    component: Component<Props>
  ) => ForgoNode | ForgoNode[];
  error?: (
    props: Props & ForgoComponentProps,
    error: unknown,
    component: Component<Props>
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

interface ComponentEventListeners<Props extends object>
  extends ComponentEventListenerBase {
  mount: Array<
    (props: Props & ForgoComponentProps, component: Component<Props>) => any
  >;
  remount: Array<
    (props: Props & ForgoComponentProps, component: Component<Props>) => any
  >;
  unmount: Array<
    (props: Props & ForgoComponentProps, component: Component<Props>) => any
  >;
  afterRender: Array<
    (
      props: Props & ForgoComponentProps,
      previousNode: ChildNode | undefined,
      component: Component<Props>
    ) => any
  >;
  shouldUpdate: Array<
    (
      newProps: Props & ForgoComponentProps,
      oldProps: Props & ForgoComponentProps,
      component: Component<Props>
    ) => boolean
  >;
}

interface ComponentInternal<Props extends object> {
  unmounted: boolean;
  registeredMethods: ForgoComponentMethods<Props>;
  eventListeners: ComponentEventListeners<Props>;
  element: ForgoElementArg;
}

const lifecycleEmitters = {
  mount<Props extends object>(component: Component<Props>, props: Props): void {
    component.__internal.eventListeners.mount.forEach((cb) =>
      cb(props, component)
    );
  },
  remount<Props extends object>(
    component: Component<Props>,
    props: Props
  ): void {
    component.__internal.eventListeners.remount.forEach((cb) =>
      cb(props, component)
    );
  },
  unmount<Props extends object>(component: Component<Props>, props: Props) {
    component.__internal.eventListeners.unmount.forEach((cb) =>
      cb(props, component)
    );
  },
  shouldUpdate<Props extends object>(
    component: Component<Props>,
    newProps: Props,
    oldProps: Props
  ): boolean {
    // Always rerender unless we have a specific reason not to
    if (component.__internal.eventListeners.shouldUpdate.length === 0)
      return true;

    return component.__internal.eventListeners.shouldUpdate
      .map((cb) => cb(newProps, oldProps, component))
      .some(Boolean);
  },
  afterRender<Props extends object>(
    component: Component<Props>,
    props: Props,
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
export class Component<Props extends object = object> {
  /** @internal */
  public __internal: ComponentInternal<Props>;

  /**
   * @params methods The render method is mandatory. It receives your current
   * props and returns JSX that Forgo will render to the page. Other methods are
   * optional. See the forgojs.org for more details.
   */
  constructor(registeredMethods: ForgoComponentMethods<Props>) {
    this.__internal = {
      registeredMethods,
      unmounted: false,
      eventListeners: {
        afterRender: [],
        mount: [],
        remount: [],
        unmount: [],
        shouldUpdate: [],
      },
      element: { componentIndex: -1 },
    };
  }

  public update(props?: Props) {
    // TODO: When we do our next breaking change, there's no reason for this to
    // return anything, but we need to leave the behavior in while we have our
    // compatibility layer.
    return rerender(this.__internal.element, props);
  }

  public mount(listener: ComponentEventListeners<Props>["mount"][number]) {
    this.__internal.eventListeners["mount"].push(listener as any);
  }

  public remount(listener: ComponentEventListeners<Props>["remount"][number]) {
    this.__internal.eventListeners["remount"].push(listener as any);
  }

  public unmount(listener: ComponentEventListeners<Props>["unmount"][number]) {
    this.__internal.eventListeners["unmount"].push(listener as any);
  }

  public shouldUpdate(
    listener: ComponentEventListeners<Props>["shouldUpdate"][number]
  ) {
    this.__internal.eventListeners["shouldUpdate"].push(listener as any);
  }

  public afterRender(
    listener: ComponentEventListeners<Props>["afterRender"][number]
  ) {
    this.__internal.eventListeners["afterRender"].push(listener as any);
  }
}

/**
 * jsxFactory function
 */
export function createElement<TProps extends ForgoElementProps & { key?: any }>(
  type: string | ForgoNewComponentCtor<TProps> | ForgoComponentCtor<TProps>,
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
 * HACK: Chrome fires onblur (if defined) immediately after a node.remove().
 * This is bad news for us, since a rerender() inside the onblur handler will
 * run on an unattached node. So, disable onblur if node is set to be removed.
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
   *
   * @param forgoNode The node to render. Can be any value renderable by Forgo,
   * not just DOM nodes.
   * @param insertionOptions Which nodes need to be replaced by the new node(s),
   * or whether the new node should be created detached from the DOM (without
   * replacement).
   * @param pendingAttachStates The list of Component State objects which will
   * be attached to the element.
   */
  function internalRender(
    forgoNode: ForgoNode | ForgoNode[],
    insertionOptions: NodeInsertionOptions,
    pendingAttachStates: ComponentState<object>[],
    mountOnPreExistingDOM: boolean
  ): RenderResult {
    // Array of Nodes, or Fragment
    if (Array.isArray(forgoNode) || isForgoFragment(forgoNode)) {
      return renderArray(
        flatten(forgoNode),
        insertionOptions,
        pendingAttachStates,
        mountOnPreExistingDOM
      );
    }
    // Primitive Nodes
    else if (!isForgoElement(forgoNode)) {
      return renderNonElement(forgoNode, insertionOptions, pendingAttachStates);
    }
    // HTML Element
    else if (isForgoDOMElement(forgoNode)) {
      return renderDOMElement(
        forgoNode,
        insertionOptions,
        pendingAttachStates,
        mountOnPreExistingDOM
      );
    }
    // Component
    else {
      return renderComponent(
        forgoNode,
        insertionOptions,
        pendingAttachStates,
        mountOnPreExistingDOM
      );
    }
  }

  function renderNonElement(
    forgoNode: ForgoNonEmptyPrimitiveNode,
    insertionOptions: NodeInsertionOptions,
    pendingAttachStates: ComponentState<object>[]
  ): RenderResult {
    // Text and comment nodes will always be recreated (why?).
    let node: ChildNode;

    if (isNullOrUndefined(forgoNode)) {
      node = env.document.createComment("null component render");
    } else {
      node = env.document.createTextNode(stringOfPrimitiveNode(forgoNode));
    }
    let oldComponentState: ComponentState<object>[] | undefined = undefined;

    // We have to find a node to replace.
    if (insertionOptions.type === "search") {
      const childNodes = insertionOptions.parentElement.childNodes;

      // If we're searching in a list, we replace if the current node is a text node.
      if (insertionOptions.length) {
        const targetNode = childNodes[insertionOptions.currentNodeIndex];
        if (
          targetNode.nodeType === TEXT_NODE_TYPE ||
          targetNode.nodeType === COMMENT_NODE_TYPE
        ) {
          targetNode.replaceWith(node);
          oldComponentState = getForgoState(targetNode)?.components;
        } else {
          const nextNode = childNodes[insertionOptions.currentNodeIndex];
          insertionOptions.parentElement.insertBefore(node, nextNode ?? null);
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
        insertionOptions.parentElement.insertBefore(node, nextNode ?? null);
      }
    }

    syncAttrsAndState(forgoNode, node, true, pendingAttachStates);
    return {
      nodes: [node],
    };
  }

  function renderDOMElement<TProps extends ForgoDOMElementProps>(
    forgoElement: ForgoDOMElement<TProps>,
    insertionOptions: NodeInsertionOptions,
    pendingAttachStates: ComponentState<object>[],
    mountOnPreExistingDOM: boolean
  ): RenderResult {
    // We need to create a detached node
    if (insertionOptions.type === "detached") {
      return addElement(undefined, undefined);
    }
    // We have to find a node to replace.
    else {
      const childNodes = insertionOptions.parentElement.childNodes;

      const found = findReplacementCandidateForElement(
        forgoElement,
        insertionOptions,
        pendingAttachStates
      );

      const renderResult = found
        ? renderExistingElement(insertionOptions)
        : addElement(
            insertionOptions.parentElement,
            insertionOptions.currentNodeIndex
          );

      return renderResult;
    }

    function renderChildNodes(element: Element) {
      // If the user gave us exact HTML to stuff into this parent, we can
      // skip/ignore the usual rendering logic
      if (forgoElement.props.dangerouslySetInnerHTML) {
        element.innerHTML = forgoElement.props.dangerouslySetInnerHTML.__html;
      } else {
        const state = getForgoState(element);

        initKeyLookupLoop(state);

        // Coerce children to always be an array, for simplicity
        const forgoChildren = flatten([forgoElement.props.children]).filter(
          // Children may or may not be specified
          (x) => !isNullOrUndefined(x)
        );

        let currentNodeIndex = 0;

        for (const forgoChild of forgoChildren) {
          const { nodes: nodesJustRendered } = internalRender(
            forgoChild,
            {
              type: "search",
              parentElement: element,
              currentNodeIndex,
              length: element.childNodes.length - currentNodeIndex,
            },
            [],
            mountOnPreExistingDOM
          );

          currentNodeIndex += nodesJustRendered.length;
        }

        // Clear nodes remaining after currentNodeIndex
        // eg: if currentNodeIndex = 10 (and length = 20), remove everything > 10
        markNodesForUnloading(
          element.childNodes,
          currentNodeIndex,
          element.childNodes.length
        );

        unloadMarkedNodes(element);

        finalizeKeyLookups(state);
      }
    }

    /**
     * If we're updating an element that was rendered in a previous render,
     * reuse the same DOM element. Just sync its children and attributes.
     */
    function renderExistingElement(
      insertionOptions: DOMNodeInsertionOptions
    ): RenderResult {
      const childNodes = insertionOptions.parentElement.childNodes;
      const parentState = getForgoState(insertionOptions.parentElement);
      const targetElement = childNodes[
        insertionOptions.currentNodeIndex
      ] as Element;

      pendingAttachStates.forEach((pendingAttachState, i) => {
        if (pendingAttachState.key !== undefined) {
          const key = deriveComponentKey(pendingAttachState.key, i);
          const nodesForKey =
            parentState.lookups.newlyAddedKeyedComponentNodes.get(key) ?? [];
          nodesForKey.push(targetElement);
          parentState.lookups.newlyAddedKeyedComponentNodes.set(
            key,
            nodesForKey
          );
        }
      });

      if (forgoElement.key !== undefined) {
        parentState.lookups.newlyAddedKeyedElementNodes.set(
          forgoElement.key,
          targetElement
        );
      }

      syncAttrsAndState(
        forgoElement,
        targetElement,
        false,
        pendingAttachStates
      );

      renderChildNodes(targetElement);

      return {
        nodes: [targetElement],
      };
    }

    function addElement(
      parentElement: Element | undefined,
      position: number | undefined
    ): RenderResult {
      const newElement = createElement(forgoElement, parentElement);

      const oldNode =
        position !== undefined
          ? (parentElement as Element).childNodes[position]
          : null;

      if (parentElement) {
        const parentState = getForgoState(parentElement);
        pendingAttachStates.forEach((pendingAttachState, i) => {
          if (pendingAttachState.key !== undefined) {
            const key = deriveComponentKey(pendingAttachState.key, i);
            parentState.lookups.newlyAddedKeyedComponentNodes.set(key, [
              newElement,
            ]);
          }
        });
        if (forgoElement.key !== undefined) {
          parentState.lookups.newlyAddedKeyedElementNodes.set(
            forgoElement.key,
            newElement
          );
        }
      }

      // Let's fire the mount and remount callbacks. If __internal.element.node
      // is not undefined, it means that the component was already mounted
      // somewhere. In that case, we call remount() instead of mount().
      pendingAttachStates.forEach((pendingAttachState, i) => {
        if (
          pendingAttachState.component.__internal.element.node === undefined
        ) {
          lifecycleEmitters.mount(
            pendingAttachState.component,
            pendingAttachState.props
          );
        } else {
          lifecycleEmitters.remount(
            pendingAttachState.component,
            pendingAttachState.props
          );
        }
      });

      if (parentElement) {
        parentElement.insertBefore(newElement, oldNode ?? null);
      }

      if (forgoElement.props.ref) {
        forgoElement.props.ref.value = newElement;
      }

      syncAttrsAndState(forgoElement, newElement, true, pendingAttachStates);
      renderChildNodes(newElement);

      return { nodes: [newElement] };
    }
  }

  function initKeyLookupLoop(state: NodeAttachedState) {
    state.lookups.renderCount++;
  }

  function finalizeKeyLookups(state: NodeAttachedState) {
    state.lookups.renderCount--;

    if (state.lookups.renderCount === 0) {
      state.lookups.keyedComponentNodes =
        state.lookups.newlyAddedKeyedComponentNodes;
      state.lookups.keyedElementNodes =
        state.lookups.newlyAddedKeyedElementNodes;

      state.lookups.newlyAddedKeyedComponentNodes = new Map();
      state.lookups.newlyAddedKeyedElementNodes = new Map();
      state.lookups.deletedKeyedComponentNodes = new Map();
      state.lookups.deletedKeyedElementNodes = new Map();
      state.lookups.deletedUnkeyedNodes = [];
    }
  }

  function renderComponent<TProps extends ForgoDOMElementProps>(
    forgoComponent: ForgoComponentElement<TProps>,
    insertionOptions: NodeInsertionOptions,
    pendingAttachStates: ComponentState<any>[],
    mountOnPreExistingDOM: boolean
    // boundary: ForgoComponent<object> | undefined
  ): RenderResult {
    const componentIndex = pendingAttachStates.length;

    if (
      // We need to create a detached node.
      insertionOptions.type !== "detached" &&
      !mountOnPreExistingDOM
    ) {
      const childNodes = insertionOptions.parentElement.childNodes;
      const found = findReplacementCandidateForComponent(
        forgoComponent,
        insertionOptions,
        pendingAttachStates.length
      );

      if (found) {
        return renderExistingComponent(childNodes, insertionOptions);
      }
    }

    // No nodes in target node list, or no matching node found.
    // Nothing to unload.
    return addComponent();

    function renderExistingComponent(
      childNodes: NodeListOf<ChildNode>,
      insertionOptions: DOMNodeInsertionOptions
    ): RenderResult {
      const targetNode = childNodes[insertionOptions.currentNodeIndex];
      const state = getForgoState(targetNode);
      const componentState = state.components[componentIndex];

      if (
        lifecycleEmitters.shouldUpdate(
          componentState.component,
          forgoComponent.props,
          componentState.props
        )
      ) {
        // Since we have compatible state already stored,
        // we'll push the savedComponentState into pending states for later attachment.
        const updatedComponentState = {
          ...componentState,
          props: forgoComponent.props,
        };

        // Get a new element by calling render on existing component.
        const newForgoNode =
          updatedComponentState.component.__internal.registeredMethods.render(
            forgoComponent.props,
            updatedComponentState.component
          );

        const componentIndex = pendingAttachStates.length;

        const statesToAttach = pendingAttachStates.concat(
          updatedComponentState
        );

        const previousNode = componentState.component.__internal.element.node;

        const boundary = updatedComponentState.component.__internal
          .registeredMethods.error
          ? updatedComponentState.component
          : undefined;

        const renderResult = withErrorBoundary(
          forgoComponent.props,
          statesToAttach,
          boundary,
          () => {
            // Create new node insertion options.
            const newInsertionOptions: NodeInsertionOptions = {
              type: "search",
              currentNodeIndex: insertionOptions.currentNodeIndex,
              length: updatedComponentState.nodes.length,
              parentElement: insertionOptions.parentElement,
            };

            return renderComponentAndRemoveStaleNodes(
              newForgoNode,
              newInsertionOptions,
              statesToAttach,
              componentIndex,
              updatedComponentState.nodes.length,
              mountOnPreExistingDOM
            );
          }
        );

        lifecycleEmitters.afterRender(
          updatedComponentState.component,
          forgoComponent.props,
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

    function addComponent(): RenderResult {
      const ctor = forgoComponent.type;
      const component = assertIsComponent(
        ctor,
        ctor(forgoComponent.props),
        (env.window as any).FORGO_NO_LEGACY_WARN !== true
      );
      component.__internal.element.componentIndex = componentIndex;

      const boundary = component.__internal.registeredMethods.error
        ? component
        : undefined;

      // Create new component state
      // ... and push it to pendingAttachStates
      const newComponentState: ComponentState<TProps> = {
        key: forgoComponent.key,
        ctor,
        component,
        props: forgoComponent.props,
        nodes: [],
        isMounted: false,
      };

      const indexOfNewComponentState = pendingAttachStates.length;

      const statesToAttach = pendingAttachStates.concat(newComponentState);

      return withErrorBoundary(
        forgoComponent.props,
        statesToAttach,
        boundary,
        () => {
          // Create an element by rendering the component
          const newForgoElement = component.__internal.registeredMethods.render(
            forgoComponent.props,
            component
          );

          // Create new node insertion options.
          const newInsertionOptions: NodeInsertionOptions =
            insertionOptions.type === "detached"
              ? insertionOptions
              : {
                  type: "search",
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

          const nodeAttachedState = getForgoState(renderResult.nodes[0]);
          const componentStateAttached =
            nodeAttachedState.components[indexOfNewComponentState];
          componentStateAttached.nodes = renderResult.nodes;
          componentStateAttached.component.__internal.element.node =
            renderResult.nodes[0];

          // No previousNode since new component. So just args and not
          // afterRenderArgs.
          lifecycleEmitters.afterRender(
            component,
            forgoComponent.props,
            undefined
          );

          return renderResult;
        }
      );
    }

    function withErrorBoundary(
      props: TProps,
      statesToAttach: ComponentState<any>[],
      boundary: Component<any> | undefined,
      exec: () => RenderResult
    ): RenderResult {
      try {
        return exec();
      } catch (error) {
        if (boundary?.__internal.registeredMethods.error) {
          const newForgoElement = boundary.__internal.registeredMethods.error(
            props,
            error,
            boundary
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
  }

  function renderComponentAndRemoveStaleNodes(
    forgoNode: ForgoNode,
    insertionOptions: DOMNodeInsertionOptions,
    statesToAttach: ComponentState<object>[],
    componentIndex: number,
    previousNodeCount: number,
    mountOnPreExistingDOM: boolean
  ): RenderResult {
    const totalNodesBeforeRender =
      insertionOptions.parentElement.childNodes.length;

    // Pass it on for rendering...
    const renderResult = internalRender(
      forgoNode,
      insertionOptions,
      statesToAttach,
      mountOnPreExistingDOM
    );

    const totalNodesAfterRender =
      insertionOptions.parentElement.childNodes.length;

    const numNodesReused =
      totalNodesBeforeRender +
      renderResult.nodes.length -
      totalNodesAfterRender;

    // Since we have re-rendered, we might need to delete a bunch of nodes from the previous render.
    // That list begins from currentIndex + num nodes in latest render.
    // Delete up to deleteFromIndex + componentState.nodes.length - numNodesReused,
    //  in which componentState.nodes.length is num nodes from previous render.
    const deleteFromIndex =
      insertionOptions.currentNodeIndex + renderResult.nodes.length;

    markNodesForUnloading(
      insertionOptions.parentElement.childNodes,
      deleteFromIndex,
      deleteFromIndex + previousNodeCount - numNodesReused
    );

    // In case we rendered an array, set the node to the first node.
    // We do this because args.element.node would be set to the last node otherwise.
    const nodeAttachedState = getForgoState(renderResult.nodes[0]);
    const componentStateAttached = nodeAttachedState.components[componentIndex];
    componentStateAttached.nodes = renderResult.nodes;
    componentStateAttached.component.__internal.element.node =
      renderResult.nodes[0];

    return renderResult;
  }

  function renderArray(
    forgoNodes: ForgoNode[],
    insertionOptions: NodeInsertionOptions,
    pendingAttachStates: ComponentState<object>[],
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

      const parentState = getForgoState(insertionOptions.parentElement);

      initKeyLookupLoop(parentState);

      for (const forgoNode of flattenedNodes) {
        const totalNodesBeforeRender =
          insertionOptions.parentElement.childNodes.length;

        const newInsertionOptions: DOMNodeInsertionOptions = {
          ...insertionOptions,
          currentNodeIndex,
          length: numNodes,
        };

        const renderResult = internalRender(
          forgoNode,
          newInsertionOptions,
          pendingAttachStates,
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

      finalizeKeyLookups(parentState);

      return renderResults;
    }
  }

  /**
   * This doesn't unmount components attached to these nodes, but moves the node
   * itself from the DOM to deletedXYXNodes under parentNode.lookups. We sort of
   * "mark" it for deletion, but it may be resurrected if it's matched by a
   * keyed forgo node that has been reordered.
   *
   * Nodes in between `from` and `to` (not inclusive of `to`) will be marked for
   * unloading. Use `unloadMarkedNodes()` to actually unload the nodes once
   * we're sure we don't need to resurrect them.
   */
  function markNodesForUnloading(
    nodes: ArrayLike<ChildNode>,
    from: number,
    to: number
  ): ChildNode[] {
    const removedNodes: ChildNode[] = [];

    const nodesToRemove = sliceNodes(nodes, from, to);
    if (nodesToRemove.length) {
      const parentElement = nodesToRemove[0].parentElement as HTMLElement;
      const parentState = getForgoState(parentElement);

      for (const node of nodesToRemove) {
        const state = getForgoState(node);

        // Remove the node from DOM
        node.remove();

        // If the component is keyed, we have to remove the entry in key-map
        state.components.forEach((component, i) => {
          if (component.key !== undefined) {
            const key = deriveComponentKey(component.key, i);
            const nodesForKey =
              parentState.lookups.keyedComponentNodes.get(key);
            if (nodesForKey !== undefined) {
              const updatedNodesForKey = nodesForKey.filter((x) => x !== node);
              if (updatedNodesForKey.length) {
                parentState.lookups.keyedComponentNodes.set(
                  key,
                  updatedNodesForKey
                );
              } else {
                parentState.lookups.keyedComponentNodes.delete(key);
              }
            }
            const deletedNodesForKey =
              parentState.lookups.deletedKeyedComponentNodes.get(key) ?? [];
            deletedNodesForKey.push(node);
            parentState.lookups.deletedKeyedComponentNodes.set(
              key,
              deletedNodesForKey
            );
          }
        });

        if (state.key !== undefined) {
          parentState.lookups.keyedComponentNodes.delete(state.key);
          parentState.lookups.deletedKeyedComponentNodes.set(state.key, [node]);
        } else {
          parentState.lookups.deletedUnkeyedNodes.push({ node });
        }

        removedNodes.push(node);
      }
    }

    return removedNodes;
  }

  /*
   * Unmount components from nodes. If a componentState is attached to the node
   * that is about to be unloaded, then we should unmount the component.
   */
  function unloadMarkedNodes(parentElement: Element) {
    function unloadNode(node: ChildNode) {
      const state = getForgoState(node);
      state.deleted = true;
      for (const componentState of state.components) {
        if (componentState.component.__internal.element.node === node) {
          if (!componentState.component.__internal.unmounted) {
            lifecycleEmitters.unmount(
              componentState.component,
              componentState.props
            );
          }
        }
      }
    }

    const parentState = getForgoState(parentElement);

    for (const nodeList of parentState.lookups.deletedKeyedComponentNodes.values()) {
      for (const node of nodeList) {
        if (node.isConnected) {
          unloadNode(node);
        }
      }
    }

    for (const { node } of parentState.lookups.deletedUnkeyedNodes) {
      unloadNode(node);
    }

    // Clear deleted nodes
    parentState.lookups.deletedKeyedComponentNodes.clear();
    parentState.lookups.deletedUnkeyedNodes = [];
  }

  function findReplacementCandidateForElement<
    TProps extends ForgoDOMElementProps
  >(
    forgoElement: ForgoDOMElement<TProps>,
    insertionOptions: DOMNodeInsertionOptions,
    pendingAttachStates: ComponentState<object>[]
  ): boolean {
    function isCompatibleElement<TProps extends ForgoDOMElementProps>(
      node: ChildNode,
      forgoElement: ForgoDOMElement<TProps>,
      pendingAttachStates: ComponentState<object>[]
    ): boolean {
      if (nodeIsElement(node)) {
        const state = getForgoState(node);
        return (
          node.tagName.toLowerCase() === forgoElement.type &&
          state.components.every(
            (componentState, i) =>
              pendingAttachStates[i] !== undefined &&
              pendingAttachStates[i].component === componentState.component
          )
        );
      } else {
        return false;
      }
    }

    function findReplacementCandidateForKeyedElement<
      TProps extends ForgoDOMElementProps
    >(
      forgoElement: WithRequiredProperty<ForgoDOMElement<TProps>, "key">,
      insertionOptions: DOMNodeInsertionOptions,
      pendingAttachStates: ComponentState<object>[]
    ): boolean {
      const { parentElement, currentNodeIndex: searchFrom } = insertionOptions;

      // First let's check active nodes.
      const parentState = getForgoState(parentElement);

      // See if the node is in our key lookup
      const nodeFromKeyLookup = parentState.lookups.keyedElementNodes.get(
        forgoElement.key
      );

      if (nodeFromKeyLookup !== undefined) {
        if (
          isCompatibleElement(
            nodeFromKeyLookup,
            forgoElement,
            pendingAttachStates
          )
        ) {
          // Let's insert the nodes at the corresponding position.
          const firstNodeInSearchList = parentElement.childNodes[searchFrom];
          if (nodeFromKeyLookup !== firstNodeInSearchList) {
            parentElement.insertBefore(
              nodeFromKeyLookup,
              firstNodeInSearchList ?? null
            );
          }
          return true;
        } else {
          // Node is mismatched. No point in keeping it in key lookup.
          parentState.lookups.keyedComponentNodes.delete(forgoElement.key);
          return false;
        }
      }
      // Not found in active nodes. Check deleted nodes.
      else {
        const nodeFromKeyLookup =
          parentState.lookups.deletedKeyedElementNodes.get(forgoElement.key);
        if (nodeFromKeyLookup !== undefined) {
          const nodes = parentElement.childNodes;

          // Delete key from lookup since we're either going to resurrect the node or discard it.
          parentState.lookups.deletedKeyedComponentNodes.delete(
            forgoElement.key
          );

          if (
            isCompatibleElement(
              nodeFromKeyLookup,
              forgoElement,
              pendingAttachStates
            )
          ) {
            // Let's insert the nodes at the corresponding position.
            const firstNodeInSearchList = nodes[searchFrom];
            if (nodeFromKeyLookup !== firstNodeInSearchList) {
              parentElement.insertBefore(
                nodeFromKeyLookup,
                firstNodeInSearchList ?? null
              );
            }
            return true;
          }
        }
        return false;
      }
    }

    function findReplacementCandidateForUnKeyedElement<
      TProps extends ForgoDOMElementProps
    >(
      forgoElement: Omit<ForgoDOMElement<TProps>, "key">,
      insertionOptions: DOMNodeInsertionOptions,
      pendingAttachStates: ComponentState<object>[]
    ): boolean {
      const { parentElement, currentNodeIndex: searchFrom, length } = insertionOptions;
      const nodes = parentElement.childNodes;

      for (let i = searchFrom; i < searchFrom + length; i++) {
        const node = nodes[i] as ChildNode;
        if (nodeIsElement(node)) {
          const state = getForgoState(node);

          // If the candidate has a key defined, we don't match it with
          // an unkeyed forgo element
          if (
            node.tagName.toLowerCase() === forgoElement.type &&
            state.key === undefined &&
            isCompatibleElement(node, forgoElement, pendingAttachStates)
          ) {
            const elementAtSearchIndex =
              parentElement.childNodes[searchFrom] ?? null;
            if (node !== elementAtSearchIndex) {
              parentElement.insertBefore(node, elementAtSearchIndex);
            }
            return true;
          }
        }
      }

      return false;
    }

    if (isKeyedElement(forgoElement)) {
      return findReplacementCandidateForKeyedElement(
        forgoElement,
        insertionOptions,
        pendingAttachStates
      );
    } else {
      return findReplacementCandidateForUnKeyedElement(
        forgoElement,
        insertionOptions,
        pendingAttachStates
      );
    }
  }

  function findReplacementCandidateForComponent<
    TProps extends ForgoDOMElementProps
  >(
    forgoComponent: ForgoComponentElement<TProps>,
    insertionOptions: DOMNodeInsertionOptions,
    componentIndex: number
  ): boolean {
    function findReplacementCandidateForKeyedComponent<
      TProps extends ForgoDOMElementProps
    >(
      forgoComponent: WithRequiredProperty<
        ForgoComponentElement<TProps>,
        "key"
      >,
      insertionOptions: DOMNodeInsertionOptions,
      componentIndex: number
    ): boolean {
      const { parentElement, currentNodeIndex: searchFrom } = insertionOptions;
      const key = deriveComponentKey(forgoComponent.key, componentIndex);

      // If forgo element has a key, we gotta find it in the childNodeMap (under active and deleted).
      const parentState = getForgoState(parentElement);

      // Check active nodes first
      const nodesForKey = parentState.lookups.keyedComponentNodes.get(key);

      if (nodesForKey !== undefined) {
        // Let's insert the nodes at the corresponding position.
        const elementAtIndex = parentElement.childNodes[searchFrom];
        for (const node of nodesForKey) {
          if (node !== elementAtIndex) {
            parentElement.insertBefore(node, elementAtIndex ?? null);
          }
        }
        return true;
      }
      // Not found in active nodes. Check deleted nodes.
      else {
        const matchingNodes =
          parentState.lookups.deletedKeyedComponentNodes.get(key);

        if (matchingNodes !== undefined) {
          // Delete key from lookup since we're either going to resurrect these nodes
          parentState.lookups.deletedKeyedComponentNodes.delete(key);

          // Append it to the beginning of the node list.
          for (const node of matchingNodes) {
            const firstNodeInSearchList = parentElement.childNodes[searchFrom];
            if (node !== firstNodeInSearchList) {
              parentElement.insertBefore(node, firstNodeInSearchList ?? null);
            }
          }

          return true;
        }
      }
      return false;
    }

    function findReplacementCandidateForUnkeyedComponent<
      TProps extends ForgoDOMElementProps
    >(
      forgoComponent: Omit<ForgoComponentElement<TProps>, "key">,
      insertionOptions: DOMNodeInsertionOptions,
      componentIndex: number
    ): boolean {
      const { parentElement, currentNodeIndex: searchFrom, length } = insertionOptions;
      const nodes = parentElement.childNodes;

      for (let i = searchFrom; i < searchFrom + length; i++) {
        const node = nodes[i] as ChildNode;
        const state = getForgoState(node);

        if (state !== undefined && state.components.length > componentIndex) {
          if (state.components[componentIndex].ctor === forgoComponent.type) {
            const elementAtSearchIndex =
              parentElement.childNodes[searchFrom] ?? null;
            if (node !== elementAtSearchIndex) {
              parentElement.insertBefore(node, elementAtSearchIndex);
            }
            return true;
          }
        }
      }

      return false;
    }

    if (isKeyedElement(forgoComponent)) {
      return findReplacementCandidateForKeyedComponent(
        forgoComponent,
        insertionOptions,
        componentIndex
      );
    } else {
      return findReplacementCandidateForUnkeyedComponent(
        forgoComponent,
        insertionOptions,
        componentIndex
      );
    }
  }

  /**
   * Attach props from the forgoElement onto the DOM node. We also need to attach
   * states from pendingAttachStates
   */
  function syncAttrsAndState(
    forgoNode: ForgoNode,
    node: ChildNode,
    isNewNode: boolean,
    pendingAttachStates: ComponentState<object>[]
  ) {
    // We have to inject node into the args object.
    // components are already holding a reference to the args object.
    // They don't know yet that args.element.node is undefined.
    if (pendingAttachStates.length > 0) {
      pendingAttachStates[
        pendingAttachStates.length - 1
      ].component.__internal.element.node = node;
    }

    if (isForgoElement(forgoNode)) {
      const existingState = getForgoState(node);

      // Remove props which don't exist
      if (existingState !== undefined && existingState.props) {
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
                  existingState.style !== (forgoNode.props as any).style
                ) {
                  const stringOfCSS = styleToString(
                    (forgoNode.props as any).style
                  );
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
        components: pendingAttachStates,
      };

      setForgoState(node, state);
    } else {
      // Now attach the internal forgo state.
      const state: NodeAttachedState = {
        components: pendingAttachStates,
        lookups: {
          deletedKeyedComponentNodes: new Map(),
          deletedUnkeyedNodes: [],
          keyedComponentNodes: new Map(),
          newlyAddedKeyedComponentNodes: new Map(),
          deletedKeyedElementNodes: new Map(),
          newlyAddedKeyedElementNodes: new Map(),
          keyedElementNodes: new Map(),
          renderCount: 0,
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

    if (parentElement == undefined) {
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
        type: "search",
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
    const parentElement = isString(container)
      ? env.document.querySelector(container)
      : container;

    if (parentElement === null) {
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

    markNodesForUnloading(
      parentElement.childNodes,
      0,
      parentElement.childNodes.length
    );

    unloadMarkedNodes(parentElement);
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
    if (!isNullOrUndefined(parentElement)) {
      const state = getForgoState(element.node);

      const originalComponentState = state.components[element.componentIndex];

      const effectiveProps = props ?? originalComponentState.props;

      if (
        !lifecycleEmitters.shouldUpdate(
          originalComponentState.component,
          effectiveProps,
          originalComponentState.props
        )
      ) {
        const indexOfNode = findNodeIndex(
          parentElement.childNodes,
          element.node
        );

        return {
          nodes: sliceNodes(
            parentElement.childNodes,
            indexOfNode,
            indexOfNode + originalComponentState.nodes.length
          ),
        };
      }

      const componentStateWithUpdatedProps = {
        ...originalComponentState,
        props: effectiveProps,
      };

      const parentStates = state.components.slice(0, element.componentIndex);

      const componentIndex = parentStates.length;

      const statesToAttach = parentStates.concat(
        componentStateWithUpdatedProps
      );

      const previousNode =
        originalComponentState.component.__internal.element.node;

      const forgoNode =
        originalComponentState.component.__internal.registeredMethods.render(
          effectiveProps,
          originalComponentState.component
        );

      const nodeIndex = findNodeIndex(parentElement.childNodes, element.node);

      const insertionOptions: DOMNodeInsertionOptions = {
        type: "search",
        currentNodeIndex: nodeIndex,
        length: originalComponentState.nodes.length,
        parentElement,
      };

      const renderResult = renderComponentAndRemoveStaleNodes(
        forgoNode,
        insertionOptions,
        statesToAttach,
        componentIndex,
        originalComponentState.nodes.length,
        false
      );

      // We have to propagate node changes up the component Tree.
      // Reason 1:
      //  Imagine a Parent rendering Child1 & Child2
      //  Child1 renders [div1, div2], and Child2 renders [div3, div4].
      //  When Child1's rerender is called, it might return [p1] instead of [div1, div2]
      //  Now, Parent's node list (ie state.nodes) must be refreshed to [p1, div3, div4] from [div1, div2, div3, div4]
      // Reason 2:
      //  If Child2 was rerendered (instead of Child1), attachProps() will incorrectly fixup parentState.element.node to div3, then to div4.
      //  That's just how attachProps() works. We need to ressign parentState.element.node to p1.
      for (let i = 0; i < parentStates.length; i++) {
        const parentState = parentStates[i];

        const indexOfOriginalRootNode = parentState.nodes.findIndex(
          (x) => x === originalComponentState.nodes[0]
        );

        // Let's recreate the node list.
        parentState.nodes = parentState.nodes
          // 1. all the nodes before first node associated with rendered component.
          .slice(0, indexOfOriginalRootNode)
          // 2. newly created nodes.
          .concat(renderResult.nodes)
          // 3. nodes after last node associated with rendered component.
          .concat(
            parentState.nodes.slice(
              indexOfOriginalRootNode + originalComponentState.nodes.length
            )
          );

        // Fix up the root node for parent.
        if (parentState.nodes.length > 0) {
          // The root node might have changed, so fix it up just in case.
          parentState.component.__internal.element.node = parentState.nodes[0];
        }
      }

      unloadMarkedNodes(parentElement);

      // Run afterRender() if defined.
      lifecycleEmitters.afterRender(
        originalComponentState.component,
        effectiveProps,
        previousNode
      );

      return renderResult;
    } else {
      return { nodes: [] };
    }
  }

  function createElement(
    forgoElement: ForgoDOMElement<{ is?: string; xmlns?: string }>,
    element?: Element
  ) {
    const namespaceURI = !isNullOrUndefined(forgoElement.props.xmlns)
      ? (forgoElement.props.xmlns as string)
      : forgoElement.type === "svg"
      ? SVG_NAMESPACE
      : element !== undefined
      ? element.namespaceURI
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
function stringOfPrimitiveNode(
  node: NonNullable<ForgoNonEmptyPrimitiveNode>
): string {
  return node.toString();
}

/**
 * Get Node Types
 */
function isForgoElement(
  forgoNode: ForgoNode
): forgoNode is ForgoElement<object> {
  return (
    !isNullOrUndefined(forgoNode) &&
    (forgoNode as any).__is_forgo_element__ === true
  );
}

function isForgoDOMElement(node: ForgoNode): node is ForgoDOMElement<object> {
  return isForgoElement(node) && typeof node.type === "string";
}

function isForgoFragment(node: ForgoNode): node is ForgoFragment {
  return !isNullOrUndefined(node) && (node as any).type === Fragment;
}

/*
  Get the state (NodeAttachedState) saved into an element.
*/
export function getForgoState(node: ChildNode): NodeAttachedState {
  if (node.__forgo === undefined) {
    node.__forgo = {
      components: [],
      lookups: {
        deletedKeyedComponentNodes: new Map(),
        deletedUnkeyedNodes: [],
        keyedComponentNodes: new Map(),
        newlyAddedKeyedComponentNodes: new Map(),
        deletedKeyedElementNodes: new Map(),
        keyedElementNodes: new Map(),
        newlyAddedKeyedElementNodes: new Map(),
        renderCount: 0,
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

/**
 * We bridge the old component syntax to the new syntax until our next breaking release
 */
export type ForgoComponent<TProps extends ForgoComponentProps> = {
  render: (props: TProps, args: ForgoRenderArgs) => ForgoNode | ForgoNode[];
  afterRender?: (props: TProps, args: ForgoAfterRenderArgs) => void;
  error?: (props: TProps, args: ForgoErrorArgs) => ForgoNode;
  mount?: (props: TProps, args: ForgoRenderArgs) => void;
  remount?: (props: TProps, args: ForgoRenderArgs) => void;
  unmount?: (props: TProps, args: ForgoRenderArgs) => void;
  shouldUpdate?: (newProps: TProps, oldProps: TProps) => boolean;
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
export const legacyComponentSyntaxCompat = <Props extends object>(
  legacyComponent: ForgoComponent<Props>
): Component<Props> => {
  const mkRenderArgs = (component: Component<Props>): ForgoRenderArgs => ({
    get element() {
      return component.__internal.element;
    },
    update(props) {
      return component.update(props as unknown as Props);
    },
  });

  const componentBody: ForgoComponentMethods<Props> = {
    render(props, component) {
      return legacyComponent.render(props, mkRenderArgs(component));
    },
  };

  if (legacyComponent.error) {
    componentBody.error = (props, error) => {
      return (
        legacyComponent as WithRequiredProperty<ForgoComponent<Props>, "error">
      ).error(props, Object.assign(mkRenderArgs(component), { error }));
    };
  }

  const component = new Component<Props>({
    ...componentBody,
  });
  if (legacyComponent.mount) {
    component.mount((props) => {
      (
        legacyComponent as WithRequiredProperty<ForgoComponent<Props>, "mount">
      ).mount(props, mkRenderArgs(component));
    });
  }
  if (legacyComponent.remount) {
    component.remount((props) => {
      (
        legacyComponent as WithRequiredProperty<
          ForgoComponent<Props>,
          "remount"
        >
      ).remount(props, mkRenderArgs(component));
    });
  }
  if (legacyComponent.unmount) {
    component.unmount((props) => {
      (
        legacyComponent as WithRequiredProperty<
          ForgoComponent<Props>,
          "unmount"
        >
      ).unmount(props, mkRenderArgs(component));
    });
  }
  if (legacyComponent.afterRender) {
    component.afterRender((props, previousNode) => {
      (
        legacyComponent as WithRequiredProperty<
          ForgoComponent<Props>,
          "afterRender"
        >
      ).afterRender(
        props,
        Object.assign(mkRenderArgs(component), { previousNode })
      );
    });
  }
  if (legacyComponent.shouldUpdate) {
    component.shouldUpdate((newProps, oldProps) => {
      return (
        legacyComponent as WithRequiredProperty<
          ForgoComponent<Props>,
          "shouldUpdate"
        >
      ).shouldUpdate(newProps, oldProps);
    });
  }
  return component;
};

function deriveComponentKey(key: ForgoKeyType, componentIndex: number) {
  return `$Component${componentIndex}_${key}`;
}

/*
  Throw if component is a non-component
*/
function assertIsComponent<Props extends object>(
  ctor: ForgoNewComponentCtor<Props> | ForgoComponentCtor<Props>,
  component: Component<Props> | ForgoComponent<Props>,
  warnOnLegacySyntax: boolean
): Component<Props> {
  if (!(component instanceof Component) && Reflect.has(component, "render")) {
    if (warnOnLegacySyntax) {
      console.warn(
        "Legacy component syntax is deprecated in v3.2.0 and will be removed in v4.0. The affected component was found here:"
      );
      // Minification mangles component names so we have to settle for a
      // stacktrace.
      console.warn(new Error().stack);
    }
    return legacyComponentSyntaxCompat(component);
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

function isKeyedElement<
  T extends ForgoElementBase<TProps>,
  TProps extends ForgoElementProps
>(t: T): t is WithRequiredProperty<T, "key"> {
  return t.key !== undefined;
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export * as JSX from "./jsxTypes.js";

// If jsxTypes is imported using named imports, esbuild doesn't know how to
// erase the imports and gets pset that "JSX" isn't an actual literal value
// inside the jsxTypes.ts module. We have to import as a different name than the
// export within createElement because I can't find a way to export a namespace
// within a namespace without using import aliases.
import * as JSXTypes from "./jsxTypes.js";
// The createElement namespace exists so that users can set their TypeScript
// jsxFactory to createElement instead of forgo.createElement.

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace createElement {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import JSX = JSXTypes;
}
