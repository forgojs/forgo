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

export type ForgoComponentProps = {} & ForgoElementProps;

/*
  This is the constructor of a ForgoComponent, called a 'Component Constructor'.
 
  The terminology is different from React here. 
  For example, in <MyComponent />, the MyComponent is the Component Constructor.
  
  The Component Constructor is defined by the type ForgoComponentCtor, 
  and it returns a Component (of type ForgoComponent).
*/
export type ForgoCtorArgs = {
  environment: ForgoEnvType;
};

export type ForgoComponentCtor<TProps extends ForgoComponentProps> = (
  props: TProps,
  args: ForgoCtorArgs
) => ForgoComponent<TProps>;

export type ForgoElementArg = {
  node?: ChildNode;
  componentIndex: number;
};

export type ForgoRenderArgs = {
  element: ForgoElementArg;
  update: (props?: any) => RenderResult;
};

export type ForgoErrorArgs = ForgoRenderArgs & {
  error: any;
};

export type ForgoAfterRenderArgs = ForgoRenderArgs & {
  previousNode?: ChildNode;
};

/*
  ForgoComponent contains three functions.
  1. render() returns the actual DOM to render.
  2. error() is called with a subcomponent throws an error.
  3. mount() is optional. Gets called when attached to a real DOM Node.
  4. unmount() is optional. Gets called just before unmount.
  5. shouldUpdate() is optional. Let's you bail out of a render().
*/
export type ForgoComponent<TProps extends ForgoComponentProps> = {
  render: (props: TProps, args: ForgoRenderArgs) => ForgoNode | ForgoNode[];
  afterRender?: (props: TProps, args: ForgoAfterRenderArgs) => void;
  error?: (props: TProps, args: ForgoErrorArgs) => ForgoNode;
  mount?: (props: TProps, args: ForgoRenderArgs) => void;
  unmount?: (props: TProps, args: ForgoRenderArgs) => void;
  shouldUpdate?: (newProps: TProps, oldProps: TProps) => boolean;
  __forgo?: { unmounted?: boolean };
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
export type ForgoElementBase<TProps extends ForgoElementProps> = {
  key?: any;
  props: TProps;
  __is_forgo_element__: true;
};

export type ForgoDOMElement<TProps extends ForgoDOMElementProps> =
  ForgoElementBase<TProps> & {
    type: string;
  };

export type ForgoComponentElement<TProps extends ForgoComponentProps> =
  ForgoElementBase<TProps> & {
    type: ForgoComponentCtor<TProps>;
  };

export type ForgoFragment = {
  type: typeof Fragment;
  props: { children?: ForgoNode | ForgoNode[] };
  __is_forgo_element__: true;
};

export type ForgoElement<TProps> =
  | ForgoDOMElement<TProps>
  | ForgoComponentElement<TProps>;

export type ForgoNonEmptyPrimitiveNode =
  | string
  | number
  | boolean
  | object
  | BigInt;

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
 
  You can also see that it gets passed around as pendingStates in the render methods. 
  That's because when Custom1 renders Custom2, there isn't a real DOM node available to attach the state to. 
  So the states are passed around until the last component renders a real DOM node or nodes.

  In addition it holds a bunch of other things. 
  Like for example, a key which uniquely identifies a child element when rendering a list.
*/
export type NodeAttachedComponentState<TProps> = {
  key?: any;
  ctor: ForgoComponentCtor<TProps>;
  component: ForgoComponent<TProps>;
  props: TProps;
  args: ForgoRenderArgs;
  nodes: ChildNode[];
  isMounted: boolean;
};

/*
  This is the state data structure which gets stored on a node.  
  See explanation for NodeAttachedComponentState<TProps>
*/
export type NodeAttachedState = {
  key?: string | number;
  props?: { [key: string]: any };
  components: NodeAttachedComponentState<any>[];
  style?: { [key: string]: any };
  deleted?: boolean;
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
};

/**
 * Instructs the renderer to search for an existing node to modify or replace,
 * before creating a new node.
 */
export type SearchableNodeInsertionOptions = {
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

/**
 * Decides how the called function attaches nodes to the supplied parent
 */
export type NodeInsertionOptions =
  | DetachedNodeInsertionOptions
  | SearchableNodeInsertionOptions;

/*
  These are child nodes which have been removed from the tree (within the 
  render-child loop for an element).
  When a compatible node is found for rendering, the previous incompatible nodes
  are removed from the parent. But when a keyed child node has been removed earlier
  in the loop and a later forgoElement has the same key, it needs to be 
  reattached and it should no longer be unmounted. Otherwise, at the end of the cycle 
  all unloadable nodes are fully unmounted. 
*/
export type UnloadableChildNode = {
  node: ChildNode;
  pendingAttachStates: NodeAttachedComponentState<any>[];
};

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

/*
  These come from the browser's Node interface, which defines an enum of node
  types. We'd like to just reference Node.<whatever>, but JSDOM makes us jump
  through hoops to do that because it hates adding new globals. Getting around
  that is more complex, and more bytes on the wire, than just hardcoding the
  constants we care about.
*/
const ELEMENT_NODE_TYPE = 1;
const ATTRIBUTE_NODE_TYPE = 2;
const TEXT_NODE_TYPE = 3;

/*
  jsxFactory function
*/
export function createElement<TProps extends ForgoElementProps & { key?: any }>(
  type: string | ForgoComponentCtor<TProps>,
  props: TProps
) {
  props = props ?? {};
  props.children =
    arguments.length > 3
      ? flatten(Array.from(arguments).slice(2))
      : arguments.length === 3
      ? flatten(arguments[2])
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
    if (!node.__forgo?.deleted) {
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
    * @param pendingAttachStates The list of Component State objects which will
    * be attached to the element.
    */
  function internalRender(
    forgoNode: ForgoNode | ForgoNode[],
    insertionOptions: NodeInsertionOptions,
    pendingAttachStates: NodeAttachedComponentState<any>[],
    mountOnPreExistingDOM: boolean
  ): RenderResult {
    // Array of Nodes
    if (Array.isArray(forgoNode)) {
      return renderArray(
        forgoNode,
        insertionOptions,
        pendingAttachStates,
        mountOnPreExistingDOM
      );
    }
    // Primitive Nodes
    else if (!isForgoElement(forgoNode)) {
      return forgoNode === undefined || forgoNode === null
        ? renderNothing(
            forgoNode,
            insertionOptions,
            pendingAttachStates,
            mountOnPreExistingDOM
          )
        : renderText(
            forgoNode,
            insertionOptions,
            pendingAttachStates,
            mountOnPreExistingDOM
          );
    }
    // HTML Element
    else if (isForgoDOMElement(forgoNode)) {
      return renderDOMElement(
        forgoNode,
        insertionOptions,
        pendingAttachStates,
        mountOnPreExistingDOM
      );
    } else if (isForgoFragment(forgoNode)) {
      return renderFragment(
        forgoNode,
        insertionOptions,
        pendingAttachStates,
        mountOnPreExistingDOM
      );
    }
    // Component.
    else {
      return renderComponent(
        forgoNode,
        insertionOptions,
        pendingAttachStates,
        mountOnPreExistingDOM
      );
    }
  }

  /* 
    Renders undefined and null
  */
  function renderNothing(
    _forgoNode: undefined | null,
    _insertionOptions: NodeInsertionOptions,
    _pendingAttachStates: NodeAttachedComponentState<any>[],
    _mountOnPreExistingDOM: boolean
  ): RenderResult {
    return { nodes: [] };
  }

  /*
    Render a string.
  
    Such as in the render function below:
    function MyComponent() {
      return {
        render() {
          return "Hello world"
        }
      }
    }
  */
  function renderText(
    forgoNode: ForgoNonEmptyPrimitiveNode,
    insertionOptions: NodeInsertionOptions,
    pendingAttachStates: NodeAttachedComponentState<any>[],
    // TODO: Any reason to keep this parameter?
    _mountOnPreExistingDOM: boolean
  ): RenderResult {
    // Text nodes will always be recreated.
    const textNode: ChildNode = env.document.createTextNode(
      stringOfPrimitiveNode(forgoNode)
    );
    let oldComponentState: NodeAttachedComponentState<any>[] | undefined =
      undefined;

    // We have to find a node to replace.
    if (insertionOptions.type === "search") {
      const childNodes = insertionOptions.parentElement.childNodes;

      // If we're searching in a list, we replace if the current node is a text node.
      if (insertionOptions.length) {
        const targetNode = childNodes[insertionOptions.currentNodeIndex];
        if (targetNode.nodeType === TEXT_NODE_TYPE) {
          targetNode.replaceWith(textNode);
          oldComponentState = getForgoState(targetNode)?.components;
        } else {
          const nextNode = childNodes[insertionOptions.currentNodeIndex];
          insertionOptions.parentElement.insertBefore(textNode, nextNode);
        }
      }
      // There are no target nodes available.
      else if (
        childNodes.length === 0 ||
        insertionOptions.currentNodeIndex === 0
      ) {
        insertionOptions.parentElement.prepend(textNode);
      } else {
        const nextNode = childNodes[insertionOptions.currentNodeIndex];
        insertionOptions.parentElement.insertBefore(textNode, nextNode);
      }
    }

    syncStateAndProps(
      forgoNode,
      textNode,
      true,
      pendingAttachStates,
      oldComponentState
    );
    return { nodes: [textNode] };
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
    pendingAttachStates: NodeAttachedComponentState<any>[],
    mountOnPreExistingDOM: boolean
  ): RenderResult {
    // We need to create a detached node
    if (insertionOptions.type === "detached") {
      return addElement(undefined, null);
    }
    // We have to find a node to replace.
    else {
      const childNodes = insertionOptions.parentElement.childNodes;

      if (insertionOptions.length) {
        const searchResult = findReplacementCandidateForElement(
          forgoElement,
          insertionOptions.parentElement,
          insertionOptions.currentNodeIndex,
          insertionOptions.length
        );

        if (searchResult.found) {
          return renderExistingElement(
            searchResult.index,
            childNodes,
            insertionOptions
          );
        }
      }

      return addElement(
        insertionOptions.parentElement,
        childNodes[insertionOptions.currentNodeIndex]
      );
    }

    function renderChildNodes(parentElement: Element) {
      // If the user gave us exact HTML to stuff into this parent, we can
      // skip/ignore the usual rendering logic
      if (forgoElement.props.dangerouslySetInnerHTML) {
        parentElement.innerHTML =
          forgoElement.props.dangerouslySetInnerHTML.__html;
      } else {
        // Coerce children to always be an array, for simplicity
        const forgoChildren = flatten([forgoElement.props.children]).filter(
          // Children may or may not be specified
          (x) => x !== undefined && x !== null
        );

        // Make sure that if the user prepends non-Forgo DOM children under this
        // parent that we start with the correct offset, otherwise we'll do DOM
        // transformations that don't make any sense for the given input.
        const firstForgoChildIndex = Array.from(
          parentElement.childNodes
        ).findIndex((child) => getForgoState(child));
        // Each node we render will push any leftover children further down the
        // parent's list of children. After rendering everything, we can clean
        // up anything extra. We'll know what's extra because all nodes we want
        // to preserve come before this index.
        let lastRenderedNodeIndex =
          firstForgoChildIndex === -1 ? 0 : firstForgoChildIndex;
        for (const forgoChild of forgoChildren) {
          const { nodes: nodesAfterRender } = internalRender(
            forgoChild,
            {
              type: "search",
              parentElement,
              currentNodeIndex: lastRenderedNodeIndex,
              length: parentElement.childNodes.length - lastRenderedNodeIndex,
            },
            [],
            mountOnPreExistingDOM
          );
          // Continue down the children list to wherever's right after the stuff
          // we just added. Because users are allowed to add arbitrary stuff to
          // the DOM manually, we can't just jump by the count of rendered
          // elements, since that's the count of *managed* elements, which might
          // be interspersed with unmanaged elements that we also need to skip
          // past.
          if (nodesAfterRender.length) {
            while (
              parentElement.childNodes[lastRenderedNodeIndex] !==
              nodesAfterRender[nodesAfterRender.length - 1]
            ) {
              lastRenderedNodeIndex += 1;
            }
            // Move the counter *past* the last node we inserted. E.g., if we just
            // inserted our first node, we need to increment from 0 -> 1, where
            // we'll start searching for the next thing we insert
            lastRenderedNodeIndex += 1;
            // If we're updating an existing DOM element, it's possible that the
            // user manually added some DOM nodes somewhere in the middle of our
            // managed nodes. If that happened, we need to scan forward until we
            // pass them and find the next managed node, which we'll use as the
            // starting point for whatever we render next. We still need the +1
            // above to make sure we always progress the index, in case this is
            // our first render pass and there's nothing to scan forward to.
            while (lastRenderedNodeIndex < parentElement.childNodes.length) {
              if (
                getForgoState(parentElement.childNodes[lastRenderedNodeIndex])
              ) {
                break;
              }
              lastRenderedNodeIndex += 1;
            }
          }
        }

        // Remove all nodes that don't correspond to the rendered output of a
        // live component
        markNodesForUnloading(
          parentElement.childNodes,
          lastRenderedNodeIndex,
          parentElement.childNodes.length
        );
      }
    }

    /**
     * If we're updating an element that was rendered in a previous render,
     * reuse the same DOM element. Just sync its children and attributes.
     */
    function renderExistingElement(
      insertAt: number,
      childNodes: NodeListOf<ChildNode>,
      insertionOptions: SearchableNodeInsertionOptions
    ): RenderResult {
      // Get rid of unwanted nodes.
      markNodesForUnloading(
        childNodes,
        insertionOptions.currentNodeIndex,
        insertAt
      );

      const targetElement = childNodes[
        insertionOptions.currentNodeIndex
      ] as Element;

      const oldComponentState = getForgoState(targetElement)?.components;

      renderChildNodes(targetElement);
      unloadMarkedNodes(targetElement, pendingAttachStates);

      syncStateAndProps(
        forgoElement,
        targetElement,
        false,
        pendingAttachStates,
        oldComponentState
      );

      return { nodes: [targetElement] };
    }

    function addElement(
      parentElement: Element | undefined,
      oldNode: ChildNode | null
    ): RenderResult {
      const newElement = createElement(forgoElement, parentElement);

      if (parentElement) {
        parentElement.insertBefore(newElement, oldNode);
      }

      if (forgoElement.props.ref) {
        forgoElement.props.ref.value = newElement;
      }

      renderChildNodes(newElement);

      syncStateAndProps(
        forgoElement,
        newElement,
        true,
        pendingAttachStates,
        undefined
      );

      return { nodes: [newElement] };
    }
  }

  /*
    Render a Component.
    Such as <MySideBar size="large" />
  */
  function renderComponent<TProps extends ForgoDOMElementProps>(
    forgoElement: ForgoComponentElement<TProps>,
    insertionOptions: NodeInsertionOptions,
    pendingAttachStates: NodeAttachedComponentState<any>[],
    mountOnPreExistingDOM: boolean
    // boundary: ForgoComponent<any> | undefined
  ): RenderResult {
    const componentIndex = pendingAttachStates.length;

    if (
      // We need to create a detached node.
      insertionOptions.type !== "detached" &&
      // We have to find a node to replace.
      insertionOptions.length &&
      !mountOnPreExistingDOM
    ) {
      const childNodes = insertionOptions.parentElement.childNodes;
      const searchResult = findReplacementCandidateForComponent(
        forgoElement,
        insertionOptions.parentElement,
        insertionOptions.currentNodeIndex,
        insertionOptions.length,
        pendingAttachStates.length
      );

      if (searchResult.found) {
        return renderExistingComponent(
          searchResult.index,
          childNodes,
          insertionOptions
        );
      }
    }
    // No nodes in target node list, or no matching node found.
    // Nothing to unload.
    return addComponent();

    function renderExistingComponent(
      insertAt: number,
      childNodes: NodeListOf<ChildNode>,
      insertionOptions: SearchableNodeInsertionOptions
    ): RenderResult {
      const targetNode = childNodes[insertAt];
      const state = getExistingForgoState(targetNode);
      const componentState = state.components[componentIndex];

      // Get rid of unwanted nodes.
      markNodesForUnloading(
        childNodes,
        insertionOptions.currentNodeIndex,
        insertAt
      );

      if (
        !componentState.component.shouldUpdate ||
        !componentState.component.shouldUpdate(
          forgoElement.props,
          componentState.props
        )
      ) {
        // Since we have compatible state already stored,
        // we'll push the savedComponentState into pending states for later attachment.
        const updatedComponentState = {
          ...componentState,
          props: forgoElement.props,
        };

        // Get a new element by calling render on existing component.
        const newForgoNode = updatedComponentState.component.render(
          forgoElement.props,
          updatedComponentState.args
        );

        const statesToAttach = pendingAttachStates.concat(
          updatedComponentState
        );

        const previousNode = componentState.args.element.node;

        const boundary = updatedComponentState.component.error
          ? updatedComponentState.component
          : undefined;

        const renderResult = withErrorBoundary(
          forgoElement.props,
          updatedComponentState.args,
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
              updatedComponentState,
              mountOnPreExistingDOM
            );
          }
        );

        if (updatedComponentState.component.afterRender) {
          updatedComponentState.component.afterRender(forgoElement.props, {
            ...updatedComponentState.args,
            previousNode,
          });
        }

        return renderResult;
      }
      // shouldUpdate() returned false
      else {
        let indexOfNode = findNodeIndex(
          insertionOptions.parentElement.childNodes,
          componentState.args.element.node
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
      const args: ForgoRenderArgs = {
        element: { componentIndex },
        update: (props) => rerender(args.element, props),
      };

      const ctor = forgoElement.type;
      const component = ctor(forgoElement.props, { environment: env });
      assertIsComponent(ctor, component);

      const boundary = component.error ? component : undefined;

      // Create new component state
      // ... and push it to pendingAttachStates
      const newComponentState: NodeAttachedComponentState<any> = {
        key: forgoElement.key,
        ctor,
        component,
        props: forgoElement.props,
        args,
        nodes: [],
        isMounted: false,
      };

      const statesToAttach = pendingAttachStates.concat(newComponentState);

      return withErrorBoundary(
        forgoElement.props,
        args,
        statesToAttach,
        boundary,
        () => {
          // Create an element by rendering the component
          const newForgoElement = component.render(forgoElement.props, args);

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

          // In case we rendered an array, set the node to the first node.
          // We do this because args.element.node would be set to the last node otherwise.
          newComponentState.nodes = renderResult.nodes;
          newComponentState.args.element.node = renderResult.nodes[0];

          if (component.afterRender) {
            // No previousNode since new component. So just args and not afterRenderArgs.
            component.afterRender(forgoElement.props, args);
          }

          return renderResult;
        }
      );
    }

    function withErrorBoundary(
      props: TProps,
      args: ForgoRenderArgs,
      statesToAttach: NodeAttachedComponentState<any>[],
      boundary: ForgoComponent<any> | undefined,
      exec: () => RenderResult
    ): RenderResult {
      try {
        return exec();
      } catch (error) {
        if (boundary && boundary.error) {
          const errorArgs = { ...args, error };
          const newForgoElement = boundary.error(props, errorArgs);
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

  function renderComponentAndRemoveStaleNodes<TProps>(
    forgoNode: ForgoNode,
    insertionOptions: SearchableNodeInsertionOptions,
    statesToAttach: NodeAttachedComponentState<any>[],
    componentState: NodeAttachedComponentState<TProps>,
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

    const newIndex =
      insertionOptions.currentNodeIndex + renderResult.nodes.length;

    markNodesForUnloading(
      insertionOptions.parentElement.childNodes,
      newIndex,
      newIndex + componentState.nodes.length - numNodesReused
    );

    // In case we rendered an array, set the node to the first node.
    // We do this because args.element.node would be set to the last node otherwise.
    componentState.nodes = renderResult.nodes;
    componentState.args.element.node = renderResult.nodes[0];

    return renderResult;
  }

  /*
    Render an array of components. 
    Called when a Component returns an array (or fragment) in its render method.  
  */
  function renderArray(
    forgoNodes: ForgoNode[],
    insertionOptions: NodeInsertionOptions,
    pendingAttachStates: NodeAttachedComponentState<any>[],
    mountOnPreExistingDOM: boolean
  ): RenderResult {
    const flattenedNodes = flatten(forgoNodes);

    if (insertionOptions.type === "detached") {
      throw new Error(
        "Arrays and fragments cannot be rendered at the top level."
      );
    } else {
      let allNodes: ChildNode[] = [];

      let currentNodeIndex = insertionOptions.currentNodeIndex;
      let numNodes = insertionOptions.length;

      for (const forgoNode of flattenedNodes) {
        const totalNodesBeforeRender =
          insertionOptions.parentElement.childNodes.length;

        const newInsertionOptions: SearchableNodeInsertionOptions = {
          ...insertionOptions,
          currentNodeIndex,
          length: numNodes,
        };

        const { nodes } = internalRender(
          forgoNode,
          newInsertionOptions,
          pendingAttachStates,
          mountOnPreExistingDOM
        );

        allNodes = allNodes.concat(nodes);

        const totalNodesAfterRender =
          insertionOptions.parentElement.childNodes.length;

        const numNodesRemoved =
          totalNodesBeforeRender + nodes.length - totalNodesAfterRender;

        currentNodeIndex += nodes.length;
        numNodes -= numNodesRemoved;
      }

      return { nodes: allNodes };
    }
  }

  /*
    Render a Fragment
  */
  function renderFragment(
    fragment: ForgoFragment,
    insertionOptions: NodeInsertionOptions,
    pendingAttachStates: NodeAttachedComponentState<any>[],
    mountOnPreExistingDOM: boolean
  ): RenderResult {
    return renderArray(
      flatten(fragment),
      insertionOptions,
      pendingAttachStates,
      mountOnPreExistingDOM
    );
  }

  /*
    Sync component states and props between a newNode and an oldNode.
  */
  function syncStateAndProps(
    forgoNode: ForgoNode,
    node: ChildNode,
    isNewNode: boolean,
    pendingAttachStates: NodeAttachedComponentState<any>[],
    oldComponentStates: NodeAttachedComponentState<any>[] | undefined
  ) {
    attachProps(forgoNode, node, isNewNode, pendingAttachStates);

    if (oldComponentStates) {
      const indexOfFirstIncompatibleState = findIndexOfFirstIncompatibleState(
        pendingAttachStates,
        oldComponentStates
      );
      unmountComponents(oldComponentStates, indexOfFirstIncompatibleState);
      mountComponents(pendingAttachStates, indexOfFirstIncompatibleState);
    } else {
      mountComponents(pendingAttachStates, 0);
    }
  }

  /**
   * This doesn't unmount components attached to these nodes, but moves the node
   * itself from the DOM to parentNode.__forgo_deletedNodes. We sort of "mark"
   * it for deletion, but it may be resurrected if it's matched by a keyed forgo
   * node that has been reordered.
   *
   * Nodes in between `from` and `to` (not inclusive of `to`) will be marked for
   * unloading. Use `unloadMarkedNodes()` to actually unload the nodes once
   * we're sure we don't need to resurrect them.
   *
   * We don't want to remove DOM nodes that aren't owned by Forgo. I.e., if the
   * user grabs a reference to a DOM element and manually adds children under
   * it, we don't want to remove those children. That'll mess up e.g., charting
   * libraries.
   */
  function markNodesForUnloading(
    nodes: ArrayLike<ChildNode>,
    from: number,
    to: number
  ) {
    const nodesToRemove = sliceNodes(nodes, from, to);
    if (nodesToRemove.length) {
      const parentElement = nodesToRemove[0].parentElement as HTMLElement;
      const deletedNodes = getDeletedNodes(parentElement);
      for (const node of nodesToRemove) {
        // If the consuming application has manually mucked with the DOM don't
        // remove things it added
        if (!getForgoState(node)) continue;

        node.remove();
        deletedNodes.push({ node });
      }
    }
  }

  /*
      Unmount components from nodes.
      We unmount only after first incompatible state, since compatible states 
      will be reattached to new candidate node.
    */
  function unloadMarkedNodes(
    parentElement: Element,
    pendingAttachStates: NodeAttachedComponentState<any>[]
  ) {
    const deletedNodes = getDeletedNodes(parentElement);

    for (const { node } of deletedNodes) {
      const state = getForgoState(node);
      if (state) {
        state.deleted = true;
        const oldComponentStates = state.components;
        const indexOfFirstIncompatibleState = findIndexOfFirstIncompatibleState(
          pendingAttachStates,
          oldComponentStates
        );
        unmountComponents(state.components, indexOfFirstIncompatibleState);
      }
    }
    clearDeletedNodes(parentElement);
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

  /*
    Unmount components above an index. This is going to be passed a stale state[].
    The from param is the index at which stale state[] differs from new state[]
  */
  function unmountComponents(
    states: NodeAttachedComponentState<any>[],
    from: number
  ) {
    // If the parent has already unmounted, we can skip checks on children.
    let parentHasUnmounted = false;

    for (let i = from; i < states.length; i++) {
      const state = states[i];
      const component = state.component;
      if (component.unmount) {
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
              const stateOnCurrentNode = getExistingForgoState(x);
              return (
                !stateOnCurrentNode.components[i] ||
                stateOnCurrentNode.components[i].component !== state.component
              );
            }
          })
        ) {
          if (!component.__forgo?.unmounted) {
            component.unmount!(state.props, state.args);
            if (!component.__forgo) {
              component.__forgo = {};
            }
            component.__forgo.unmounted = true;
          }
          parentHasUnmounted = true;
        }
      }
    }
  }

  /*
    Mount components above an index. This is going to be passed the new state[].
    The from param is the index at which stale state[] differs from new state[]
  */
  function mountComponents(
    states: NodeAttachedComponentState<any>[],
    from: number
  ) {
    for (let i = from; i < states.length; i++) {
      const state = states[i];
      if (state.component.mount && !state.isMounted) {
        state.isMounted = true;
        state.component.mount(state.props, state.args);
      }
    }
  }

  type CandidateSearchResult =
    | {
        found: false;
      }
    | { found: true; index: number };

  /**
   * When we try to find replacement candidates for DOM nodes,
   * we try to:
   *   a) match by the key
   *   b) match by the tagname
   */
  function findReplacementCandidateForElement<TProps>(
    forgoElement: ForgoDOMElement<TProps>,
    parentElement: Element,
    searchFrom: number,
    length: number
  ): CandidateSearchResult {
    const nodes = parentElement.childNodes;
    for (let i = searchFrom; i < searchFrom + length; i++) {
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
          return { found: true, index: i };
        } else {
          // If the candidate has a key defined,
          //  we don't match it with an unkeyed forgo element
          if (
            node.tagName.toLowerCase() === forgoElement.type &&
            !stateOnNode?.key
          ) {
            return { found: true, index: i };
          }
        }
      }
    }
    // Let's check deleted nodes as well.
    if (forgoElement.key !== undefined) {
      const deletedNodes = getDeletedNodes(parentElement);
      for (let i = 0; i < deletedNodes.length; i++) {
        const { node } = deletedNodes[i];
        const stateOnNode = getForgoState(node);
        if (stateOnNode?.key === forgoElement.key) {
          // Remove it from deletedNodes.
          deletedNodes.splice(i, 1);
          // Append it to the beginning of the node list.
          const firstNodeInSearchList = nodes[searchFrom];
          if (firstNodeInSearchList) {
            parentElement.insertBefore(node, firstNodeInSearchList);
          } else {
            parentElement.appendChild(node);
          }
          return { found: true, index: searchFrom };
        }
      }
    }
    return { found: false };
  }

  /**
   * When we try to find replacement candidates for Components,
   * we try to:
   *   a) match by the key
   *   b) match by the component constructor
   */
  function findReplacementCandidateForComponent<TProps>(
    forgoElement: ForgoComponentElement<TProps>,
    parentElement: Element,
    searchFrom: number,
    length: number,
    componentIndex: number
  ): CandidateSearchResult {
    const nodes = parentElement.childNodes;
    for (let i = searchFrom; i < searchFrom + length; i++) {
      const node = nodes[i] as ChildNode;
      const stateOnNode = getForgoState(node);
      if (stateOnNode && stateOnNode.components.length > componentIndex) {
        if (forgoElement.key !== undefined) {
          if (
            stateOnNode.components[componentIndex].ctor === forgoElement.type &&
            stateOnNode.components[componentIndex].key === forgoElement.key
          ) {
            return { found: true, index: i };
          }
        } else {
          if (
            stateOnNode.components[componentIndex].ctor === forgoElement.type
          ) {
            return { found: true, index: i };
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
      const deletedNodes = getDeletedNodes(parentElement);
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
          let insertBeforeNode = nodes[searchFrom];

          if (insertBeforeNode) {
            for (const node of nodesToResurrect) {
              parentElement.insertBefore(node, insertBeforeNode);
            }
          } else {
            for (const node of nodesToResurrect) {
              parentElement.appendChild(node);
            }
          }

          return { found: true, index: searchFrom };
        }
      }
    }
    return { found: false };
  }

  /**
   * Attach props from the forgoElement onto the DOM node. We also need to attach
   * states from pendingAttachStates
   */
  function attachProps(
    forgoNode: ForgoNode,
    node: ChildNode,
    isNewNode: boolean,
    pendingAttachStates: NodeAttachedComponentState<any>[]
  ) {
    // We have to inject node into the args object.
    // components are already holding a reference to the args object.
    // They don't know yet that args.element.node is undefined.
    if (pendingAttachStates.length > 0) {
      pendingAttachStates[pendingAttachStates.length - 1].args.element.node =
        node;
    }

    if (isForgoElement(forgoNode)) {
      const currentState = getForgoState(node);

      // Remove props which don't exist
      if (currentState && currentState.props) {
        for (const key in currentState.props) {
          if (!(key in forgoNode.props)) {
            if (key !== "children" && key !== "xmlns") {
              if (node.nodeType === TEXT_NODE_TYPE) {
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
        if (currentState?.props?.[key] !== value) {
          if (key !== "children" && key !== "xmlns") {
            if (node.nodeType === TEXT_NODE_TYPE) {
              (node as any)[key] = value;
            } else if (node instanceof env.__internal.HTMLElement) {
              if (key === "style") {
                // Optimization: many times in CSS to JS, style objects are re-used.
                // If they're the same, skip the expensive styleToString() call.
                if (
                  currentState === undefined ||
                  currentState.style === undefined ||
                  currentState.style !== forgoNode.props.style
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
        key: forgoNode.key,
        props: forgoNode.props,
        components: pendingAttachStates,
      };

      setForgoState(node, state);
    } else {
      // Now attach the internal forgo state.
      const state: NodeAttachedState = {
        components: pendingAttachStates,
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
    let parentElement = (
      isString(container) ? env.document.querySelector(container) : container
    ) as Element;

    if (parentElement) {
      if (parentElement.nodeType === ELEMENT_NODE_TYPE) {
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
      } else {
        throw new Error(
          "The container argument to the mount() function should be an HTML element."
        );
      }
    } else {
      throw new Error(
        `The mount() function was called on a non-element (${
          typeof container === "string" ? container : container?.tagName
        }).`
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
      },
      [],
      false
    );
    return { node: renderResult.nodes[0], nodes: renderResult.nodes };
  }

  /*
    Code inside a component will call rerender whenever it wants to rerender.
    The following function is what they'll need to call.

    Given only a DOM element, how do we know what component to render?
    We'll fetch all that information from the state information stored on the element.

    This is attached to a node inside a NodeAttachedState structure.
  */
  function rerender(
    element: ForgoElementArg | undefined,
    props?: any
  ): RenderResult {
    if (element && element.node) {
      const parentElement = element.node.parentElement;
      if (parentElement !== null) {
        const state = getExistingForgoState(element.node);

        const originalComponentState = state.components[element.componentIndex];

        const effectiveProps = props ?? originalComponentState.props;

        if (
          !originalComponentState.component.shouldUpdate ||
          originalComponentState.component.shouldUpdate(
            effectiveProps,
            originalComponentState.props
          )
        ) {
          const newComponentState = {
            ...originalComponentState,
            props: effectiveProps,
          };

          const parentStates = state.components.slice(
            0,
            element.componentIndex
          );

          const statesToAttach = parentStates.concat(newComponentState);

          const previousNode = originalComponentState.args.element.node;

          const forgoNode = originalComponentState.component.render(
            effectiveProps,
            originalComponentState.args
          );

          let nodeIndex = findNodeIndex(parentElement.childNodes, element.node);

          const insertionOptions: SearchableNodeInsertionOptions = {
            type: "search",
            currentNodeIndex: nodeIndex,
            length: originalComponentState.nodes.length,
            parentElement,
          };

          const renderResult = renderComponentAndRemoveStaleNodes(
            forgoNode,
            insertionOptions,
            statesToAttach,
            newComponentState,
            false
          );

          // We have to propagate node changes up the component Tree.
          // Reason 1:
          //  Imaging Parent rendering Child1 & Child2
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
              parentState.args.element.node = parentState.nodes[0];
            }
          }

          // Unload marked nodes.
          unloadMarkedNodes(
            parentElement,
            renderResult.nodes.length > 0 ? statesToAttach : []
          );

          // Unmount rendered component itself if all nodes are gone.
          // if (renderResult.nodes.length === 0) {
          //   unmountComponents([newComponentState], 0);
          // }

          // Run afterRender() if defined.
          if (originalComponentState.component.afterRender) {
            originalComponentState.component.afterRender(effectiveProps, {
              ...originalComponentState.args,
              previousNode,
            });
          }

          return renderResult;
        }
        // shouldUpdate() returned false
        else {
          let indexOfNode = findNodeIndex(
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
      } else {
        return { nodes: [] };
      }
    } else {
      throw new Error(`Missing node information in rerender() argument.`);
    }
  }

  function createElement(
    forgoElement: ForgoDOMElement<any>,
    parentElement: Element | undefined
  ) {
    const namespaceURI =
      forgoElement.props.xmlns ?? forgoElement.type === "svg"
        ? SVG_NAMESPACE
        : parentElement && parentElement.namespaceURI;
    if (forgoElement.props.is) {
      return namespaceURI
        ? env.document.createElementNS(namespaceURI, forgoElement.type, {
            is: forgoElement.props.is,
          })
        : env.document.createElement(forgoElement.type, {
            is: forgoElement.props.is,
          });
    } else {
      return namespaceURI
        ? env.document.createElementNS(namespaceURI, forgoElement.type)
        : env.document.createElement(forgoElement.type);
    }
  }

  return {
    mount,
    render,
    rerender,
  };
}

const windowObject = globalThis ? globalThis : window;

let forgoInstance = createForgoInstance({
  window: windowObject,
  document: windowObject.document,
});

export function setCustomEnv(customEnv: any) {
  forgoInstance = createForgoInstance(customEnv);
}

export function mount(
  forgoNode: ForgoNode,
  container: Element | string | null
): RenderResult {
  return forgoInstance.mount(forgoNode, container);
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
        : itemOrItems.props.children !== undefined &&
          itemOrItems.props.children !== null
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

/*
  ForgoNodes can be primitive types.
  Convert all primitive types to their string representation.
*/
function stringOfPrimitiveNode(node: ForgoNonEmptyPrimitiveNode): string {
  return node.toString();
}

/*
  Get Node Types
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
export function getForgoState(node: ChildNode): NodeAttachedState | undefined {
  return node.__forgo;
}

/*
  Same as above, but throws if undefined. (Caller must make sure.)
*/
function getExistingForgoState(node: ChildNode): NodeAttachedState {
  if (node.__forgo) {
    return node.__forgo;
  } else {
    throw new Error("Missing forgo state on node.");
  }
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
  if (!element.__forgo_deletedNodes) {
    delete element.__forgo_deletedNodes;
  }
}

/*
  Throw if component is a non-component
*/
function assertIsComponent<TProps>(
  ctor: ForgoComponentCtor<TProps>,
  component: ForgoComponent<TProps>
) {
  if (!component.render) {
    throw new Error(
      `${
        ctor.name || "Unnamed"
      } component constructor must return an object having a render() function.`
    );
  }
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
// jsxFactory to createElement instead of forgo.createElement.
export namespace createElement {
  export import JSX = JSXTypes;
}
