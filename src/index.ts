declare global {
  interface ChildNode {
    __forgo?: NodeAttachedState;
  }
}

/*
  A type that wraps a reference.
*/
export type ForgoRef<T> = {
  value?: T;
};

export type ForgoElementProps = {
  xmlns?: string;
  ref?: ForgoRef<Element>;
  children?: ForgoNode | ForgoNode[];
};

/*
  This is the constructor of a ForgoComponent, called a 'Component Constructor'
 
  The terminology is a little different from React here.
  For example, in <MyComponent />, the MyComponent is the Component Constructor.
  The Component Constructor is defined by the type ForgoComponentCtor, and it returns a Component (of type ForgoComponent).
*/
export type ForgoComponentCtor<TProps extends ForgoElementProps> = (
  props: TProps
) => ForgoComponent<TProps>;

export type ForgoElementArg = {
  node?: ChildNode;
  componentIndex: number;
};

export type ForgoRenderArgs = {
  element: ForgoElementArg;
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
export type ForgoComponent<TProps extends ForgoElementProps> = {
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
  - or a Custom Component.
 
  If the ForgoNode is a string, number etc, it's a primitive type.
  eg: "hello"

  If ForgoNode has a type property which is a string, it represents a native DOM element.
  eg: The type will be "div" for <div>Hello</div>

  If the ForgoElement represents a Custom Component, then the type points to a ForgoComponentCtor
  eg: The type will be MyComponent for <MyComponent />
*/
export type ForgoElementBase<TProps extends ForgoElementProps> = {
  key?: any;
  props: TProps;
  __is_forgo_element__: true;
};

export type ForgoDOMElement<TProps> = ForgoElementBase<TProps> & {
  type: string;
};

export type ForgoCustomComponentElement<TProps> = ForgoElementBase<TProps> & {
  type: ForgoComponentCtor<TProps>;
};

export type ForgoFragment = ForgoElementBase<any> & {
  type: typeof Fragment;
};

export type ForgoElement<TProps extends ForgoElementProps> =
  | ForgoDOMElement<TProps>
  | ForgoCustomComponentElement<TProps>
  | ForgoFragment;

export type ForgoNonEmptyPrimitiveNode =
  | string
  | number
  | boolean
  | object
  | BigInt;

export type ForgoPrimitiveNode = ForgoNonEmptyPrimitiveNode | null | undefined;

export type ForgoNode = ForgoPrimitiveNode | ForgoElement<any>;

/*
  Forgo stores Component state on the element on which it is mounted.

  Say Custom1 renders Custom2 which renders Custom3 which renders <div>Hello</div>
  In this case, the components Custom1, Custom2 and Custom3 are stored on the div.
 
  You can also see that it gets passed around as pendingStates in the render methods.
  That's because when Custom1 renders Custom2, there isn't a real DOM node available to attach the state to. So the states are passed around until the last component renders a real DOM node or nodes.

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
};

/*
  This is the state data structure which gets stored on a node.  
  See explanation for NodeAttachedComponentState<TProps>
*/
export type NodeAttachedState = {
  key?: string | number;
  props?: { [key: string]: any };
  components: NodeAttachedComponentState<any>[];
};

/*
  Namespaces
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
  The following adds support for injecting test environment objects.
  Such as JSDOM.
*/
export type EnvType = {
  window: Window | typeof globalThis;
  document: HTMLDocument;
};
const documentObject = globalThis ? globalThis.document : document;
const windowObject = globalThis ? globalThis : window;

let env: EnvType = {
  window: windowObject,
  document: documentObject,
};

function isString(val: unknown): val is string {
  return typeof val === "string";
}

export function setCustomEnv(value: any) {
  env = value;
}

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
  Result of the render functions
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
  This is the main render function.
  forgoNode is the node to render.
 
  node is an existing node to which the element needs to be rendered (if rerendering)
  May not always be passed in, like for first render or when no compatible node exists.

  statesToAttach is the list of Component State objects which will be attached to the element.
*/
function internalRender(
  forgoNode: ForgoNode | ForgoNode[],
  nodeInsertionOptions: NodeInsertionOptions,
  pendingAttachStates: NodeAttachedComponentState<any>[]
): RenderResult {
  // Array of Nodes
  if (Array.isArray(forgoNode)) {
    return renderArray(forgoNode, nodeInsertionOptions, pendingAttachStates);
  }
  // Primitive Nodes
  else if (!isForgoElement(forgoNode)) {
    return typeof forgoNode === "undefined" || forgoNode === null
      ? { nodes: [] }
      : renderText(forgoNode, nodeInsertionOptions, pendingAttachStates);
  }
  // HTML Element
  else if (isForgoDOMElement(forgoNode)) {
    return renderDOMElement(
      forgoNode,
      nodeInsertionOptions,
      pendingAttachStates
    );
  } else if (isForgoFragment(forgoNode)) {
    return renderFragment(forgoNode, nodeInsertionOptions, pendingAttachStates);
  }
  // Custom Component.
  else {
    return renderCustomComponent(
      forgoNode,
      nodeInsertionOptions,
      pendingAttachStates
    );
  }
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
  pendingAttachStates: NodeAttachedComponentState<any>[]
): RenderResult {
  // We need to create a detached node
  if (nodeInsertionOptions.type === "detached") {
    // Text nodes will always be recreated
    const textNode: ChildNode = env.document.createTextNode(
      stringOfPrimitiveNode(forgoNode)
    );

    syncStateAndProps(forgoNode, textNode, textNode, pendingAttachStates);
    return { nodes: [textNode] };
  }
  // We have to find a node to replace.
  else {
    // Text nodes will always be recreated
    const textNode: ChildNode = env.document.createTextNode(
      stringOfPrimitiveNode(forgoNode)
    );

    // If we're searching in a list, we replace if the current node is a text node.
    const childNodes = nodeInsertionOptions.parentElement.childNodes;
    if (nodeInsertionOptions.length) {
      let targetNode = childNodes[nodeInsertionOptions.currentNodeIndex];
      if (targetNode.nodeType === TEXT_NODE_TYPE) {
        syncStateAndProps(forgoNode, textNode, targetNode, pendingAttachStates);
        targetNode.replaceWith(textNode);
        return { nodes: [textNode] };
      } else {
        syncStateAndProps(forgoNode, textNode, textNode, pendingAttachStates);
        const nextNode = childNodes[nodeInsertionOptions.currentNodeIndex];
        nodeInsertionOptions.parentElement.insertBefore(textNode, nextNode);
        return { nodes: [textNode] };
      }
    }
    // There are no target nodes available
    else {
      const childNodes = nodeInsertionOptions.parentElement.childNodes;
      syncStateAndProps(forgoNode, textNode, textNode, pendingAttachStates);
      if (
        childNodes.length === 0 ||
        nodeInsertionOptions.currentNodeIndex === 0
      ) {
        nodeInsertionOptions.parentElement.prepend(textNode);
      } else {
        const nextNode = childNodes[nodeInsertionOptions.currentNodeIndex];
        nodeInsertionOptions.parentElement.insertBefore(textNode, nextNode);
      }
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
function renderDOMElement<TProps extends ForgoElementProps>(
  forgoElement: ForgoDOMElement<TProps>,
  nodeInsertionOptions: NodeInsertionOptions,
  pendingAttachStates: NodeAttachedComponentState<any>[]
): RenderResult {
  // We need to create a detached node
  if (nodeInsertionOptions.type === "detached") {
    let newElement: Element = createElement(forgoElement, undefined);

    syncStateAndProps(
      forgoElement,
      newElement,
      newElement,
      pendingAttachStates
    );
    renderDOMChildNodes(newElement);
    return { nodes: [newElement] };
  }
  // We have to find a node to replace.
  else {
    const childNodes = nodeInsertionOptions.parentElement.childNodes;
    if (nodeInsertionOptions.length) {
      const searchResult = findReplacementCandidateForDOMElement(
        forgoElement,
        childNodes,
        nodeInsertionOptions.currentNodeIndex,
        nodeInsertionOptions.length
      );

      if (searchResult.found) {
        // Get rid of unwanted nodes.
        unloadNodes(
          Array.from(childNodes).slice(
            nodeInsertionOptions.currentNodeIndex,
            searchResult.index
          ),
          pendingAttachStates
        );

        const targetNode = childNodes[
          nodeInsertionOptions.currentNodeIndex
        ] as Element;

        syncStateAndProps(
          forgoElement,
          targetNode,
          targetNode,
          pendingAttachStates
        );

        renderDOMChildNodes(targetNode);

        return { nodes: [targetNode] };
      } else {
        const newElement = addNewDOMElement(
          nodeInsertionOptions.parentElement,
          childNodes[nodeInsertionOptions.currentNodeIndex]
        );
        return { nodes: [newElement] };
      }
    } else {
      const newElement = addNewDOMElement(
        nodeInsertionOptions.parentElement,
        childNodes[nodeInsertionOptions.currentNodeIndex]
      );
      return { nodes: [newElement] };
    }
  }

  function renderDOMChildNodes(parentElement: Element) {
    const forgoChildrenObj = forgoElement.props.children;

    // Children will not be an array if single item
    const forgoChildren = flatten(
      (Array.isArray(forgoChildrenObj)
        ? forgoChildrenObj
        : [forgoChildrenObj]
      ).filter((x) => typeof x !== "undefined" && x !== null)
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
        []
      );
      currentChildNodeIndex += nodes.length;
    }

    // Get rid the the remaining nodes
    const nodesToRemove = Array.from(parentElement.childNodes).slice(
      currentChildNodeIndex
    );
    if (nodesToRemove.length) {
      unloadNodes(nodesToRemove, []);
    }
  }

  function addNewDOMElement(
    parentElement: Element,
    oldNode: ChildNode
  ): Element {
    const newElement = createElement(forgoElement, parentElement);

    if (forgoElement.props.ref) {
      forgoElement.props.ref.value = newElement;
    }

    parentElement.insertBefore(newElement, oldNode);
    syncStateAndProps(
      forgoElement,
      newElement,
      newElement,
      pendingAttachStates
    );
    renderDOMChildNodes(newElement);
    return newElement;
  }
}

/*
  Render a Custom Component
  Such as <MySideBar size="large" />
*/
function renderCustomComponent<TProps extends ForgoElementProps>(
  forgoElement: ForgoCustomComponentElement<TProps>,
  nodeInsertionOptions: NodeInsertionOptions,
  pendingAttachStates: NodeAttachedComponentState<any>[]
  // boundary: ForgoComponent<any> | undefined
): RenderResult {
  const componentIndex = pendingAttachStates.length;

  // We need to create a detached node
  if (nodeInsertionOptions.type === "detached") {
    return addNewComponent();
  }
  // We have to find a node to replace.
  else {
    if (nodeInsertionOptions.length) {
      const childNodes = nodeInsertionOptions.parentElement.childNodes;
      const searchResult = findReplacementCandidateForCustomComponent(
        forgoElement,
        childNodes,
        nodeInsertionOptions.currentNodeIndex,
        nodeInsertionOptions.length
      );

      if (searchResult.found) {
        const targetNode = childNodes[searchResult.index];
        const state = getExistingForgoState(targetNode);
        const componentState = state.components[componentIndex];

        // Get rid of unwanted nodes.
        unloadNodes(
          Array.from(childNodes).slice(
            nodeInsertionOptions.currentNodeIndex,
            searchResult.index
          ),
          pendingAttachStates.concat(componentState)
        );
        return renderExistingComponent(nodeInsertionOptions, componentState);
      }
      // No matching node found
      else {
        return addNewComponent();
      }
    }
    // No nodes in target node list
    else {
      return addNewComponent();
    }
  }

  function renderExistingComponent(
    nodeInsertionOptions: SearchableNodeInsertionOptions,
    componentState: NodeAttachedComponentState<TProps>
  ): RenderResult {
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

      // Get a new element by calling render on existing component.
      const newForgoNode = newComponentState.component.render(
        forgoElement.props,
        newComponentState.args
      );

      const boundary = newComponentState.component.error
        ? newComponentState.component
        : undefined;

      return withErrorBoundary(
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
            newComponentState
          );
        }
      );
    }
    // shouldUpdate() returned false
    else {
      const allNodes = Array.from(
        nodeInsertionOptions.parentElement.childNodes
      );
      const indexOfNode = allNodes.findIndex(
        (x) => x === componentState.args.element.node
      );
      return {
        nodes: allNodes.slice(
          indexOfNode,
          indexOfNode + componentState.nodes.length
        ),
      };
    }
  }

  function addNewComponent(): RenderResult {
    const args: ForgoRenderArgs = {
      element: { componentIndex },
    };

    const ctor = forgoElement.type;
    const component = ctor(forgoElement.props);
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
                length: 0,
                parentElement: nodeInsertionOptions.parentElement,
              };

        // Pass it on for rendering...
        const renderResult = internalRender(
          newForgoElement,
          insertionOptions,
          statesToAttach
        );

        // In case we rendered an array, set the node to the first node.
        // And set numNodes.
        newComponentState.nodes = renderResult.nodes;
        if (renderResult.nodes.length > 1) {
          newComponentState.args.element.node = renderResult.nodes[0];
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
          statesToAttach
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
  componentState: NodeAttachedComponentState<TProps>
): RenderResult {
  const totalNodesBeforeRender =
    insertionOptions.parentElement.childNodes.length;

  // Pass it on for rendering...
  const renderResult = internalRender(
    forgoNode,
    insertionOptions,
    statesToAttach
  );

  const totalNodesAfterRender =
    insertionOptions.parentElement.childNodes.length;

  const numNodesRemoved =
    totalNodesBeforeRender + renderResult.nodes.length - totalNodesAfterRender;

  const newIndex =
    insertionOptions.currentNodeIndex + renderResult.nodes.length;

  const nodesToRemove = Array.from(
    insertionOptions.parentElement.childNodes
  ).slice(newIndex, newIndex + componentState.nodes.length - numNodesRemoved);

  unloadNodes(nodesToRemove, statesToAttach);

  // In case we rendered an array, set the node to the first node.
  // And set numNodes.
  componentState.nodes = renderResult.nodes;
  if (renderResult.nodes.length > 1) {
    componentState.args.element.node = renderResult.nodes[0];
  }

  return renderResult;
}

/*
  Render an array of components
  Called when a CustomComponent returns an array (or fragment) in its render method.  
*/
function renderArray(
  forgoNodes: ForgoNode[],
  nodeInsertionOptions: NodeInsertionOptions,
  pendingAttachStates: NodeAttachedComponentState<any>[]
): RenderResult {
  const flattenedNodes = flatten(forgoNodes);
  const topmostComponentState = pendingAttachStates.slice(-1)[0];
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
        pendingAttachStates
      );

      allNodes = allNodes.concat(nodes);
      topmostComponentState.nodes = allNodes;

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
  pendingAttachStates: NodeAttachedComponentState<any>[]
): RenderResult {
  return renderArray(
    flatten(fragment),
    nodeInsertionOptions,
    pendingAttachStates
  );
}

/*
  Sync component states and props between a newNode and an oldNode.
*/
function syncStateAndProps(
  forgoNode: ForgoNode,
  newNode: ChildNode,
  targetNode: ChildNode,
  pendingAttachStates: NodeAttachedComponentState<any>[]
) {
  // We have to get oldStates before attachProps;
  // coz attachProps will overwrite with new states.
  const oldComponentStates = getForgoState(targetNode)?.components;

  attachProps(forgoNode, newNode, pendingAttachStates);

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
  When states is attached to a new node,
  or when states are reattached, some of the old component states need to go away.
  The corresponding components will need to be unmounted.

  While rendering, the component gets reused if the ctor is the same.
  If the ctor is different, the component is discarded. And hence needs to be unmounted.
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
  Unmount components above an index.
  This is going to be passed a stale state[]
  The from param is the index at which stale state[] differs from new state[]
*/
function unmountComponents(
  states: NodeAttachedComponentState<any>[],
  from: number
) {
  for (let j = from; j < states.length; j++) {
    const state = states[j];
    if (state.component.unmount) {
      if (
        state.nodes.every((x) => {
          if (!x.isConnected) {
            return true;
          } else {
            const componentState = getExistingForgoState(x);
            return (
              !componentState.components[j] ||
              componentState.components[j].component !== state.component
            );
          }
        })
      ) {
        state.component.unmount(state.props, state.args);
      }
    }
  }
}

/*
  Mount components above an index.
  This is going to be passed the new state[].
  The from param is the index at which stale state[] differs from new state[]
*/
function mountComponents(
  states: NodeAttachedComponentState<any>[],
  from: number
) {
  for (let j = from; j < states.length; j++) {
    const state = states[j];
    if (state.component.mount && state.nodes.length === 0) {
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
function findReplacementCandidateForDOMElement<TProps>(
  forgoElement: ForgoDOMElement<TProps>,
  nodes: NodeListOf<ChildNode> | ChildNode[],
  searchFrom: number,
  length: number
): CandidateSearchResult {
  for (let i = searchFrom; i < searchFrom + length; i++) {
    const node = nodes[i] as ChildNode;
    const stateOnNode = getForgoState(node);
    if (forgoElement.key) {
      if (stateOnNode?.key === forgoElement.key) {
        return { found: true, index: i };
      }
    } else {
      if (node.nodeType === ELEMENT_NODE_TYPE) {
        const element = node as Element;
        // If the candidate has a key defined,
        //  we don't match it with an unkeyed forgo element
        if (
          element.tagName.toLowerCase() === forgoElement.type &&
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
  When we try to find replacement candidates for Custom Components,
  we try to:
    a) match by the key
    b) match by the component constructor
*/
function findReplacementCandidateForCustomComponent<TProps>(
  forgoElement: ForgoCustomComponentElement<TProps>,
  nodes: NodeListOf<ChildNode> | ChildNode[],
  searchFrom: number,
  length: number
): CandidateSearchResult {
  for (let i = searchFrom; i < searchFrom + length; i++) {
    const node = nodes[i] as ChildNode;
    const stateOnNode = getForgoState(node);
    if (stateOnNode && stateOnNode.components.length > 0) {
      if (forgoElement.key) {
        if (stateOnNode.components[0].key === forgoElement.key) {
          return { found: true, index: i };
        }
      } else {
        if (stateOnNode.components[0].ctor === forgoElement.type) {
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

    // Remove props which don't match
    if (currentState && currentState.props) {
      const currentEntries = Object.entries(currentState.props);
      for (const [key, value] of currentEntries) {
        if (key !== "children" && key !== "xmlns") {
          if (node.nodeType === ELEMENT_NODE_TYPE) {
            const namespaceURI = (node as Element).namespaceURI;
            if (
              namespaceURI !== MATH_NAMESPACE &&
              namespaceURI !== SVG_NAMESPACE
            ) {
              (node as any)[key] = undefined;
            } else {
              (node as Element).removeAttribute(key);
            }
          }
          // Not an element.
          else {
            (node as any)[key] = undefined;
          }
        }
      }
    }

    // We're gonna keep this simple.
    // Attach everything as is.
    const entries = Object.entries(forgoNode.props);
    for (const [key, value] of entries) {
      if (key !== "children" && key !== "xmlns") {
        if (node.nodeType === ELEMENT_NODE_TYPE) {
          const namespaceURI = (node as Element).namespaceURI;
          if (
            namespaceURI !== MATH_NAMESPACE &&
            namespaceURI !== SVG_NAMESPACE
          ) {
            if (key.includes("-") && typeof value === "string") {
              (node as Element).setAttribute(key, value);
            } else {
              (node as any)[key] = value;
            }
          } else {
            if (typeof value === "string") {
              (node as Element).setAttribute(key, value);
            } else {
              (node as any)[key] = value;
            }
          }
        }
        // Not an element.
        else {
          (node as any)[key] = value;
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

  // Run afterRender() if defined.
  previousNodes.forEach((previousNode, i) => {
    const state = pendingAttachStates[i];
    if (state.component.afterRender) {
      state.component.afterRender(state.props, {
        ...pendingAttachStates[i].args,
        previousNode,
      });
    }
  });
}

/*
  Mount will render the DOM as a child of the specified container element.
*/
export function mount(
  forgoNode: ForgoNode,
  container: Element | string | null
): RenderResult {
  let parentElement = (isString(container)
    ? env.document.querySelector(container)
    : container) as Element;

  if (parentElement) {
    if (parentElement.nodeType === ELEMENT_NODE_TYPE) {
      return internalRender(
        forgoNode,
        {
          type: "search",
          currentNodeIndex: 0,
          length: 0,
          parentElement,
        },
        []
      );
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
export function render(forgoNode: ForgoNode) {
  const renderResult = internalRender(
    forgoNode,
    {
      type: "detached",
    },
    []
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
export function rerender(
  element: ForgoElementArg | undefined,
  props?: any
): RenderResult {
  if (element && element.node) {
    const parentElement = element.node.parentElement;
    if (parentElement !== null) {
      const state = getForgoState(element.node);
      if (state) {
        const originalComponentState = state.components[element.componentIndex];

        const effectiveProps =
          typeof props !== "undefined" ? props : originalComponentState.props;

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

          const forgoNode = originalComponentState.component.render(
            effectiveProps,
            originalComponentState.args
          );

          const nodeIndex = Array.from(parentElement.childNodes).findIndex(
            (x) => x === element.node
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
            newComponentState
          );

          // We have to propagate node changes up the tree.
          for (let i = 0; i < parentStates.length; i++) {
            const parentState = parentStates[i];

            const indexOfOriginalRootNode = parentState.nodes.findIndex(
              (x) => x === originalComponentState.nodes[0]
            );

            // Let's recreate the node list
            parentState.nodes = parentState.nodes
              .slice(0, indexOfOriginalRootNode)
              .concat(renderResult.nodes)
              .concat(
                parentState.nodes.slice(
                  indexOfOriginalRootNode + originalComponentState.nodes.length
                )
              );

            if (parentState.nodes.length === 0) {
              unmountComponents(parentStates, i);
              break;
            } else {
              // The root node might have changed, so fix it up anyway.
              parentState.args.element.node = parentState.nodes[0];
            }
          }

          if (renderResult.nodes.length === 0) {
            unmountComponents([newComponentState], 0);
          }

          return renderResult;
        }
        // shouldUpdate() returned false
        else {
          const allNodes = Array.from(parentElement.childNodes);
          const indexOfNode = allNodes.findIndex((x) => x === element.node);
          return {
            nodes: allNodes.slice(
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
      : typeof itemOrItems.props.children !== "undefined"
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

function createElement(
  forgoElement: ForgoDOMElement<any>,
  parentElement: Element | undefined
) {
  const namespaceURI =
    forgoElement.props.xmlns ?? (parentElement && parentElement.namespaceURI);
  return namespaceURI
    ? env.document.createElementNS(namespaceURI, forgoElement.type)
    : env.document.createElement(forgoElement.type);
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
function isForgoElement(node: ForgoNode): node is ForgoElement<any> {
  return (
    typeof node !== "undefined" &&
    node !== null &&
    (node as any).__is_forgo_element__ === true
  );
}

function isForgoDOMElement(node: ForgoNode): node is ForgoDOMElement<any> {
  return isForgoElement(node) && typeof node.type === "string";
}

function isForgoFragment(node: ForgoNode): node is ForgoFragment {
  return isForgoElement(node) && node.type === Fragment;
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
