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

/*
  NodeReplacementOptions decide how nodes get attached by the callee function.
  type = "detached" does not attach the node to the parent.
  type = "search" requires the callee function to search for a compatible replacement.
*/
export type DetachedNodeInsertionOptions = {
  type: "detached";
};

export type SearchableNodeInsertionOptions = {
  type: "search";
  parentElement: Element;
  currentNodeIndex: number;
  length: number;
};

export type NodeInsertionOptions =
  | DetachedNodeInsertionOptions
  | SearchableNodeInsertionOptions;

/*
  Result of the render functions.
*/
export type RenderResult = {
  nodes: ChildNode[];
};

/*
  Fragment constructor.
  We simply use it as a marker in jsx-runtime.
*/
export const Fragment: unique symbol = Symbol("FORGO_FRAGMENT");

/*
  HTML Namespaces
*/
const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const MATH_NAMESPACE = "http://www.w3.org/1998/Math/MathML";
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

/*
  The element types we care about.
  As defined by the standards.
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
    if (!node.__forgo_deleted) {
      return value(e);
    }
  };
}

export function createForgoInstance(customEnv: any) {
  const env: ForgoEnvType = customEnv;
  env.__internal = env.__internal ?? {
    Text: (env.window as any).Text,
    HTMLElement: (env.window as any).HTMLElement,
  };

  /*
    This is the main render function. forgoNode is the node to render.
  
    nodeInsertionOptions specify which nodes need to be replaced by the new node(s), 
    or whether the new node should be created detached from the DOM (without replacement). 
    pendingAttachStates is the list of Component State objects which will be attached to the element.
  */
  function internalRender(
    forgoNode: ForgoNode | ForgoNode[],
    nodeInsertionOptions: NodeInsertionOptions,
    pendingAttachStates: NodeAttachedComponentState<any>[],
    mountOnPreExistingDOM: boolean
  ): RenderResult {
    // Array of Nodes
    if (Array.isArray(forgoNode)) {
      return renderArray(
        forgoNode,
        nodeInsertionOptions,
        pendingAttachStates,
        mountOnPreExistingDOM
      );
    }
    // Primitive Nodes
    else if (!isForgoElement(forgoNode)) {
      return forgoNode === undefined || forgoNode === null
        ? renderNothing(
            forgoNode,
            nodeInsertionOptions,
            pendingAttachStates,
            mountOnPreExistingDOM
          )
        : renderText(
            forgoNode,
            nodeInsertionOptions,
            pendingAttachStates,
            mountOnPreExistingDOM
          );
    }
    // HTML Element
    else if (isForgoDOMElement(forgoNode)) {
      return renderDOMElement(
        forgoNode,
        nodeInsertionOptions,
        pendingAttachStates,
        mountOnPreExistingDOM
      );
    } else if (isForgoFragment(forgoNode)) {
      return renderFragment(
        forgoNode,
        nodeInsertionOptions,
        pendingAttachStates,
        mountOnPreExistingDOM
      );
    }
    // Component.
    else {
      return renderComponent(
        forgoNode,
        nodeInsertionOptions,
        pendingAttachStates,
        mountOnPreExistingDOM
      );
    }
  }

  /* 
    Renders undefined and null
  */
  function renderNothing(
    forgoNode: undefined | null,
    nodeInsertionOptions: NodeInsertionOptions,
    pendingAttachStates: NodeAttachedComponentState<any>[],
    mountOnPreExistingDOM: boolean
  ) {
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
    nodeInsertionOptions: NodeInsertionOptions,
    pendingAttachStates: NodeAttachedComponentState<any>[],
    mountOnPreExistingDOM: boolean
  ): RenderResult {
    // We need to create a detached node.
    if (nodeInsertionOptions.type === "detached") {
      // Text nodes will always be recreated.
      const textNode: ChildNode = env.document.createTextNode(
        stringOfPrimitiveNode(forgoNode)
      );
      syncStateAndProps(
        forgoNode,
        textNode,
        true,
        pendingAttachStates,
        undefined
      );
      return { nodes: [textNode] };
    }
    // We have to find a node to replace.
    else {
      // Text nodes will always be recreated.
      const textNode: ChildNode = env.document.createTextNode(
        stringOfPrimitiveNode(forgoNode)
      );

      // If we're searching in a list, we replace if the current node is a text node.
      const childNodes = nodeInsertionOptions.parentElement.childNodes;
      if (nodeInsertionOptions.length) {
        let targetNode = childNodes[nodeInsertionOptions.currentNodeIndex];
        if (targetNode.nodeType === TEXT_NODE_TYPE) {
          targetNode.replaceWith(textNode);

          const oldComponentState = getForgoState(targetNode)?.components;
          syncStateAndProps(
            forgoNode,
            textNode,
            true,
            pendingAttachStates,
            oldComponentState
          );
          return { nodes: [textNode] };
        } else {
          const nextNode = childNodes[nodeInsertionOptions.currentNodeIndex];
          nodeInsertionOptions.parentElement.insertBefore(textNode, nextNode);
          syncStateAndProps(
            forgoNode,
            textNode,
            true,
            pendingAttachStates,
            undefined
          );
          return { nodes: [textNode] };
        }
      }
      // There are no target nodes available.
      else {
        const childNodes = nodeInsertionOptions.parentElement.childNodes;
        if (
          childNodes.length === 0 ||
          nodeInsertionOptions.currentNodeIndex === 0
        ) {
          nodeInsertionOptions.parentElement.prepend(textNode);
        } else {
          const nextNode = childNodes[nodeInsertionOptions.currentNodeIndex];
          nodeInsertionOptions.parentElement.insertBefore(textNode, nextNode);
        }
        syncStateAndProps(
          forgoNode,
          textNode,
          true,
          pendingAttachStates,
          undefined
        );
        return { nodes: [textNode] };
      }
    }
  }

  /*
    Render a DOM element.
  
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
    nodeInsertionOptions: NodeInsertionOptions,
    pendingAttachStates: NodeAttachedComponentState<any>[],
    mountOnPreExistingDOM: boolean
  ): RenderResult {
    // We need to create a detached node
    if (nodeInsertionOptions.type === "detached") {
      return addElement(undefined, null);
    }
    // We have to find a node to replace.
    else {
      const childNodes = nodeInsertionOptions.parentElement.childNodes;

      if (nodeInsertionOptions.length) {
        const searchResult = findReplacementCandidateForElement(
          forgoElement,
          childNodes,
          nodeInsertionOptions.currentNodeIndex,
          nodeInsertionOptions.length
        );

        if (searchResult.found) {
          return renderExistingElement(
            searchResult.index,
            childNodes,
            nodeInsertionOptions
          );
        } else {
          return addElement(
            nodeInsertionOptions.parentElement,
            childNodes[nodeInsertionOptions.currentNodeIndex]
          );
        }
      } else {
        return addElement(
          nodeInsertionOptions.parentElement,
          childNodes[nodeInsertionOptions.currentNodeIndex]
        );
      }
    }

    function renderChildNodes(parentElement: Element) {
      if (forgoElement.props.dangerouslySetInnerHTML) {
        parentElement.innerHTML =
          forgoElement.props.dangerouslySetInnerHTML.__html;
      } else {
        const forgoChildrenObj = forgoElement.props.children;

        // Children will not be an array if single item.
        const forgoChildren = flatten(
          (Array.isArray(forgoChildrenObj)
            ? forgoChildrenObj
            : [forgoChildrenObj]
          ).filter((x) => x !== undefined && x !== null)
        );

        let currentChildNodeIndex = 0;

        for (const forgoChild of forgoChildren) {
          const { nodes } = internalRender(
            forgoChild,
            {
              type: "search",
              parentElement,
              currentNodeIndex: currentChildNodeIndex,
              length: parentElement.childNodes.length - currentChildNodeIndex,
            },
            [],
            mountOnPreExistingDOM
          );
          currentChildNodeIndex += nodes.length;
        }

        // Get rid the the remaining nodes.
        const nodesToRemove = sliceNodes(
          parentElement.childNodes,
          currentChildNodeIndex,
          parentElement.childNodes.length
        );

        if (nodesToRemove.length) {
          unloadNodes(nodesToRemove, []);
        }
      }
    }

    function renderExistingElement(
      insertAt: number,
      childNodes: NodeListOf<ChildNode>,
      nodeInsertionOptions: SearchableNodeInsertionOptions
    ): RenderResult {
      // Get rid of unwanted nodes.
      unloadNodes(
        sliceNodes(childNodes, nodeInsertionOptions.currentNodeIndex, insertAt),
        pendingAttachStates
      );

      const targetElement = childNodes[
        nodeInsertionOptions.currentNodeIndex
      ] as Element;

      renderChildNodes(targetElement);

      const oldComponentState = getForgoState(targetElement)?.components;

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
    nodeInsertionOptions: NodeInsertionOptions,
    pendingAttachStates: NodeAttachedComponentState<any>[],
    mountOnPreExistingDOM: boolean
    // boundary: ForgoComponent<any> | undefined
  ): RenderResult {
    const componentIndex = pendingAttachStates.length;

    // We need to create a detached node.
    if (nodeInsertionOptions.type === "detached") {
      return addComponent();
    }
    // We have to find a node to replace.
    else {
      if (nodeInsertionOptions.length) {
        if (mountOnPreExistingDOM) {
          return addComponent();
        } else {
          const childNodes = nodeInsertionOptions.parentElement.childNodes;
          const searchResult = findReplacementCandidateForComponent(
            forgoElement,
            childNodes,
            nodeInsertionOptions.currentNodeIndex,
            nodeInsertionOptions.length,
            pendingAttachStates.length
          );

          if (searchResult.found) {
            return renderExistingComponent(
              searchResult.index,
              childNodes,
              nodeInsertionOptions
            );
          }
          // No matching node found.
          else {
            return addComponent();
          }
        }
      }
      // No nodes in target node list.
      // Nothing to unload.
      else {
        return addComponent();
      }
    }

    function renderExistingComponent(
      insertAt: number,
      childNodes: NodeListOf<ChildNode>,
      nodeInsertionOptions: SearchableNodeInsertionOptions
    ): RenderResult {
      const targetNode = childNodes[insertAt];
      const state = getExistingForgoState(targetNode);
      const componentState = state.components[componentIndex];

      // Get rid of unwanted nodes.
      unloadNodes(
        sliceNodes(childNodes, nodeInsertionOptions.currentNodeIndex, insertAt),
        pendingAttachStates.concat(componentState)
      );

      if (
        !componentState.component.shouldUpdate ||
        componentState.component.shouldUpdate(
          forgoElement.props,
          componentState.props
        )
      ) {
        // Since we have compatible state already stored,
        // we'll push the savedComponentState into pending states for later attachment.
        const newComponentState = {
          ...componentState,
          props: forgoElement.props,
        };

        const statesToAttach = pendingAttachStates.concat(newComponentState);

        const previousNode = componentState.args.element.node;

        // Get a new element by calling render on existing component.
        const newForgoNode = newComponentState.component.render(
          forgoElement.props,
          newComponentState.args
        );

        const boundary = newComponentState.component.error
          ? newComponentState.component
          : undefined;

        const renderResult = withErrorBoundary(
          forgoElement.props,
          newComponentState.args,
          statesToAttach,
          boundary,
          () => {
            // Create new node insertion options.
            const insertionOptions: NodeInsertionOptions = {
              type: "search",
              currentNodeIndex: nodeInsertionOptions.currentNodeIndex,
              length: newComponentState.nodes.length,
              parentElement: nodeInsertionOptions.parentElement,
            };

            return renderComponentAndRemoveStaleNodes(
              newForgoNode,
              insertionOptions,
              statesToAttach,
              newComponentState,
              mountOnPreExistingDOM
            );
          }
        );

        if (newComponentState.component.afterRender) {
          newComponentState.component.afterRender(forgoElement.props, {
            ...newComponentState.args,
            previousNode,
          });
        }

        return renderResult;
      }
      // shouldUpdate() returned false
      else {
        let indexOfNode = findNodeIndex(
          nodeInsertionOptions.parentElement.childNodes,
          componentState.args.element.node
        );

        return {
          nodes: sliceNodes(
            nodeInsertionOptions.parentElement.childNodes,
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
          const insertionOptions: NodeInsertionOptions =
            nodeInsertionOptions.type === "detached"
              ? nodeInsertionOptions
              : {
                  type: "search",
                  currentNodeIndex: nodeInsertionOptions.currentNodeIndex,
                  length: mountOnPreExistingDOM
                    ? nodeInsertionOptions.length
                    : 0,
                  parentElement: nodeInsertionOptions.parentElement,
                };

          // Pass it on for rendering...
          const renderResult = internalRender(
            newForgoElement,
            insertionOptions,
            statesToAttach,
            mountOnPreExistingDOM
          );

          // In case we rendered an array, set the node to the first node.
          // We do this because args.element.node would be set to the last node otherwise.
          newComponentState.nodes = renderResult.nodes;
          if (renderResult.nodes.length > 1) {
            newComponentState.args.element.node = renderResult.nodes[0];
          }

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
            nodeInsertionOptions,
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

    const numNodesRemoved =
      totalNodesBeforeRender +
      renderResult.nodes.length -
      totalNodesAfterRender;

    const newIndex =
      insertionOptions.currentNodeIndex + renderResult.nodes.length;

    const nodesToRemove = sliceNodes(
      insertionOptions.parentElement.childNodes,
      newIndex,
      newIndex + componentState.nodes.length - numNodesRemoved
    );

    unloadNodes(nodesToRemove, statesToAttach);

    // In case we rendered an array, set the node to the first node.
    // We do this because args.element.node would be set to the last node otherwise.
    componentState.nodes = renderResult.nodes;
    if (renderResult.nodes.length > 1) {
      componentState.args.element.node = renderResult.nodes[0];
    }

    return renderResult;
  }

  /*
    Render an array of components. 
    Called when a Component returns an array (or fragment) in its render method.  
  */
  function renderArray(
    forgoNodes: ForgoNode[],
    nodeInsertionOptions: NodeInsertionOptions,
    pendingAttachStates: NodeAttachedComponentState<any>[],
    mountOnPreExistingDOM: boolean
  ): RenderResult {
    const flattenedNodes = flatten(forgoNodes);

    if (nodeInsertionOptions.type === "detached") {
      throw new Error(
        "Arrays and fragments cannot be rendered at the top level."
      );
    } else {
      let allNodes: ChildNode[] = [];

      let currentNodeIndex = nodeInsertionOptions.currentNodeIndex;
      let numNodes = nodeInsertionOptions.length;

      for (const forgoNode of flattenedNodes) {
        const totalNodesBeforeRender =
          nodeInsertionOptions.parentElement.childNodes.length;

        const insertionOptions: SearchableNodeInsertionOptions = {
          ...nodeInsertionOptions,
          currentNodeIndex,
          length: numNodes,
        };

        const { nodes } = internalRender(
          forgoNode,
          insertionOptions,
          pendingAttachStates,
          mountOnPreExistingDOM
        );

        allNodes = allNodes.concat(nodes);

        const totalNodesAfterRender =
          nodeInsertionOptions.parentElement.childNodes.length;

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
    nodeInsertionOptions: NodeInsertionOptions,
    pendingAttachStates: NodeAttachedComponentState<any>[],
    mountOnPreExistingDOM: boolean
  ): RenderResult {
    return renderArray(
      flatten(fragment),
      nodeInsertionOptions,
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

  /*
    Unloads components from a node list
    This does:
    a) Remove the node
    b) Calls unload on all attached components
  */
  function unloadNodes(
    nodes: ChildNode[],
    pendingAttachStates: NodeAttachedComponentState<any>[]
  ) {
    for (const node of nodes) {
      node.__forgo_deleted = true;
      node.remove();
      const state = getForgoState(node);
      if (state) {
        const oldComponentStates = state.components;
        const indexOfFirstIncompatibleState = findIndexOfFirstIncompatibleState(
          pendingAttachStates,
          oldComponentStates
        );
        unmountComponents(state.components, indexOfFirstIncompatibleState);
      }
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
      if (state.component.unmount) {
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
              const componentState = getExistingForgoState(x);
              return (
                !componentState.components[i] ||
                componentState.components[i].component !== state.component
              );
            }
          })
        ) {
          state.component.unmount(state.props, state.args);
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

  /*
    When we try to find replacement candidates for DOM nodes,
    we try to:
      a) match by the key
      b) match by the tagname
  */
  function findReplacementCandidateForElement<TProps>(
    forgoElement: ForgoDOMElement<TProps>,
    nodes: NodeListOf<ChildNode> | ChildNode[],
    searchFrom: number,
    length: number
  ): CandidateSearchResult {
    for (let i = searchFrom; i < searchFrom + length; i++) {
      const node = nodes[i] as ChildNode;
      if (nodeIsElement(node)) {
        const stateOnNode = getForgoState(node);
        if (forgoElement.key) {
          if (stateOnNode?.key === forgoElement.key) {
            return { found: true, index: i };
          }
        } else {
          // If the candidate has a key defined,
          //  we don't match it with an unkeyed forgo element
          if (
            node.tagName.toLowerCase() === forgoElement.type &&
            (!stateOnNode || !stateOnNode.key)
          ) {
            return { found: true, index: i };
          }
        }
      }
    }
    return { found: false };
  }

  /*
    When we try to find replacement candidates for Components,
    we try to:
      a) match by the key
      b) match by the component constructor
  */
  function findReplacementCandidateForComponent<TProps>(
    forgoElement: ForgoComponentElement<TProps>,
    nodes: NodeListOf<ChildNode> | ChildNode[],
    searchFrom: number,
    length: number,
    componentIndex: number
  ): CandidateSearchResult {
    for (let i = searchFrom; i < searchFrom + length; i++) {
      const node = nodes[i] as ChildNode;
      const stateOnNode = getForgoState(node);
      if (stateOnNode && stateOnNode.components.length > componentIndex) {
        if (forgoElement.key) {
          if (stateOnNode.components[componentIndex].key === forgoElement.key) {
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
    return { found: false };
  }

  /*
    Attach props from the forgoElement on to the DOM node.
    We also need to attach states from pendingAttachStates
  */
  function attachProps(
    forgoNode: ForgoNode,
    node: ChildNode,
    isNewNode: boolean,
    pendingAttachStates: NodeAttachedComponentState<any>[]
  ) {
    // Capture previous nodes if afterRender is defined;
    const previousNodes: (ChildNode | undefined)[] = [];

    // We have to inject node into the args object.
    // components are already holding a reference to the args object.
    // They don't know yet that args.element.node is undefined.
    for (const state of pendingAttachStates) {
      previousNodes.push(
        state.component.afterRender ? state.args.element.node : undefined
      );
      state.args.element.node = node;
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
        const state = getForgoState(element.node);
        if (state) {
          const originalComponentState =
            state.components[element.componentIndex];

          const effectiveProps =
            props !== undefined ? props : originalComponentState.props;

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

            let nodeIndex = findNodeIndex(
              parentElement.childNodes,
              element.node
            );

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

            // We have to propagate node changes up the tree.
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
                    indexOfOriginalRootNode +
                      originalComponentState.nodes.length
                  )
                );

              // If there are no nodes, call unmount on it (and child states)
              if (parentState.nodes.length === 0) {
                unmountComponents(parentStates, i);
                break;
              } else {
                // The root node might have changed, so fix it up anyway.
                parentState.args.element.node = parentState.nodes[0];
              }
            }

            // Unmount rendered component itself if all nodes are gone.
            if (renderResult.nodes.length === 0) {
              unmountComponents([newComponentState], 0);
            }

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
          throw new Error(`Missing forgo state on node.`);
        }
      } else {
        throw new Error(
          `The rerender() function was called on a node without a parent element.`
        );
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
function flatten(
  itemOrItems: ForgoNode | ForgoNode[],
  ret: ForgoNode[] = []
): ForgoNode[] {
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
      flatten(entry, ret);
    } else {
      ret.push(entry);
    }
  }
  return ret;
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
    throw new Error("Missing state in node.");
  }
}

/*
  Sets the state (NodeAttachedState) on an element.
*/
export function setForgoState(node: ChildNode, state: NodeAttachedState): void {
  node.__forgo = state;
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

/* parentElements.childNodes is not an array. A slice() for it. */
function sliceNodes(
  nodes: ArrayLike<ChildNode>,
  from: number,
  to: number
): ChildNode[] {
  const result: ChildNode[] = [];
  for (let i = from; i < to; i++) {
    result.push(nodes[i]);
  }
  return result;
}

/* parentElements.childNodes is not an array. A findIndex() for it. */
function findNodeIndex(
  nodes: ArrayLike<ChildNode>,
  element: ChildNode | undefined
): number {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i] === element) {
      return i;
    }
  }
  return -1;
}

/* JSX Types */
import { JSXTypes } from "./jsxTypes";

declare global {
  interface ChildNode {
    __forgo?: NodeAttachedState;
    __forgo_deleted?: boolean;
  }
}

export import JSX = JSXTypes;

export namespace createElement {
  export import JSX = JSXTypes;
}
