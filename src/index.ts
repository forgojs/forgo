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
  ref?: ForgoRef<HTMLElement>;
  children?: ForgoNode[];
};

/*
  This is the constructor of a ForgoComponent
  
  The terminology is a little different from React here.
  In say <MyComponent />, the MyComponent is called the ForgoComponentCtor here.
  This function returns a ForgoComponent.
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

export type ForgoErrorArgs = {
  element: ForgoElementArg;
  error: any;
};

/*
  ForgoComponent contains three functions.
  1. render() returns the actual DOM to render. 
  2. unmount() is optional. Gets called just before unmount.
*/
export type ForgoComponent<TProps extends ForgoElementProps> = {
  render: (
    props: TProps,
    args: ForgoRenderArgs
  ) => ForgoNode;
  error?: (
    props: TProps,
    args: ForgoErrorArgs
  ) => ForgoElement<ForgoComponentCtor<TProps>, TProps>;
  mount?: (props: TProps, args: ForgoRenderArgs) => void;
  unmount?: (props: TProps, args: ForgoRenderArgs) => void;
  shouldUpdate?: (newProps: TProps, oldProps: TProps) => boolean;
};

/*
  A ForgoElement is the output of the render function.
  It can represent a DOM Node or a Custom Component.
  
  If ForgoElement has a type property which is a string, it represents a native DOM element.
  eg: The div in <div>Hello</div>

  If the ForgoElement represents a Custom Component, then the type points to a ForgoComponentCtor.
*/
export type ForgoElement<
  TType extends string | ForgoComponentCtor<TProps>,
  TProps extends ForgoElementProps
> = {
  type: TType;
  key?: string | number;
  props: TProps;
};

/*
  ForgoNode is either a ForgoElement or a string.
  The strings get converted to DOM Text nodes.
*/
export type ForgoNode =
  | string
  | number
  | boolean
  | object
  | null
  | BigInt
  | undefined
  | ForgoElement<string | ForgoComponentCtor<any>, any>;

/*
  Forgo stores Component state on the element on which it is mounted.

  Say Custom1 renders Custom2 which renders Custom3 which renders <div>Hello</div>
  In this case, the components Custom1, Custom2 and Custom3 are stored on the div.
  
  You can also see that it gets passed around as pendingStates in the render methods.
  That's because when Custom1 renders Custom2, there isn't a real DOM node available to attach the state to. So the states are passed around until the last component renders a real DOM node.

  In addition it holds a bunch of other things.
  Like for example, a key which uniquely identifies a child element when rendering a list.
*/
export type NodeAttachedComponentState<TProps> = {
  key?: string | number;
  ctor: ForgoComponentCtor<TProps>;
  component: ForgoComponent<TProps>;
  props: TProps;
  args: ForgoRenderArgs;
};

/*
  This is the actual state data structure which gets stored on a node.  
  See explanation for NodeAttachedComponentState<TProps>
*/
export type NodeAttachedState = {
  key?: string | number;
  props?: { [key: string]: any };
  components: NodeAttachedComponentState<any>[];
};

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

const isString = (val: unknown): val is string => typeof val === "string";

export function setCustomEnv(value: any) {
  env = value;
}

/*
  This is the main render function.
  forgoNode is the node to render.
  
  node is an existing node to which the element needs to be rendered (if rerendering)
  May not always be passed in, like for first render or when no compatible node exists.

  statesToAttach is the list of Component State objects which will be attached to the element.
*/
function internalRender(
  forgoNode: ForgoNode,
  node: ChildNode | undefined,
  pendingAttachStates: NodeAttachedComponentState<any>[],
  fullRerender: boolean,
  boundary?: ForgoComponent<any>
): { node: ChildNode; boundary?: ForgoComponent<any> } {
  // Just a string
  if (!isForgoElement(forgoNode)) {
    return renderString(
      stringOfPrimitiveNode(forgoNode),
      node,
      pendingAttachStates,
      fullRerender
    );
  }
  // HTML Element
  else if (typeof forgoNode.type === "string") {
    return renderDOMElement(
      forgoNode as ForgoElement<string, any>,
      node,
      pendingAttachStates,
      fullRerender,
      boundary
    );
  }
  // Custom Component.
  // We don't renderChildren since that is the CustomComponent's prerogative.
  else {
    return renderCustomComponent(
      forgoNode as ForgoElement<ForgoComponentCtor<any>, any>,
      node as Required<ChildNode>,
      pendingAttachStates,
      fullRerender,
      boundary
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
function renderString(
  text: string,
  node: ChildNode | undefined,
  pendingAttachStates: NodeAttachedComponentState<any>[],
  fullRerender: boolean
): { node: ChildNode } {
  // Text nodes will always be recreated
  const textNode = env.document.createTextNode(text);

  if (node) {
    // We have to get oldStates before attachProps;
    // coz attachProps will overwrite with new states.
    const oldComponentStates = getForgoState(node)?.components;

    attachProps(text, textNode, pendingAttachStates);

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

    node.replaceWith(textNode);
  } else {
    attachProps(text, textNode, pendingAttachStates);
    mountComponents(pendingAttachStates, 0);
  }

  return { node: textNode };
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
  forgoElement: ForgoElement<string, TProps>,
  node: ChildNode | undefined,
  pendingAttachStates: NodeAttachedComponentState<any>[],
  fullRerender: boolean,
  boundary?: ForgoComponent<any>
): { node: ChildNode } {
  if (node) {
    let nodeToBindTo: ChildNode;

    // if the nodes are not of the same of the same type, we need to replace.
    if (
      node.nodeType === TEXT_NODE_TYPE ||
      ((node as HTMLElement).tagName &&
        (node as HTMLElement).tagName.toLowerCase() !== forgoElement.type)
    ) {
      const newElement = env.document.createElement(forgoElement.type);
      node.replaceWith(newElement);
      nodeToBindTo = newElement;
    } else {
      nodeToBindTo = node;
    }

    // We have to get oldStates before attachProps;
    // coz attachProps will overwrite with new states.
    const oldComponentStates = getForgoState(node)?.components;

    attachProps(forgoElement, nodeToBindTo, pendingAttachStates);

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

    renderChildNodes(
      forgoElement,
      nodeToBindTo as HTMLElement,
      fullRerender,
      boundary
    );
    return { node: nodeToBindTo };
  }
  // There was no node passed in; have to create a new element.
  else {
    const newElement = env.document.createElement(forgoElement.type);
    if (forgoElement.props.ref) {
      forgoElement.props.ref.value = newElement;
    }
    attachProps(forgoElement, newElement, pendingAttachStates);
    mountComponents(pendingAttachStates, 0);
    renderChildNodes(forgoElement, newElement, fullRerender, boundary);
    return { node: newElement };
  }
}

function boundaryFallback<T>(
  node: ChildNode | undefined,
  props: any,
  args: ForgoRenderArgs,
  statesToAttach: NodeAttachedComponentState<any>[],
  fullRerender: boolean,
  boundary: ForgoComponent<any> | undefined,
  exec: () => T
) {
  try {
    return exec();
  } catch (error) {
    if (boundary && boundary.error) {
      const errorArgs = { ...args, error };
      const newForgoElement = boundary.error(props, errorArgs);
      return internalRender(
        newForgoElement,
        node,
        statesToAttach,
        fullRerender,
        boundary
      );
    } else {
      throw error;
    }
  }
}

/*
  Render a Custom Component
  Such as <MySideBar size="large" />
*/
function renderCustomComponent<TProps extends ForgoElementProps>(
  forgoElement: ForgoElement<ForgoComponentCtor<TProps>, TProps>,
  node: Required<ChildNode> | undefined,
  pendingAttachStates: NodeAttachedComponentState<any>[],
  fullRerender: boolean,
  boundary?: ForgoComponent<any>
): { node: ChildNode; boundary?: ForgoComponent<any> } {
  if (node) {
    const state = getExistingForgoState(node);

    const componentIndex = pendingAttachStates.length;
    const componentState = state.components[componentIndex];
    const haveCompatibleState =
      componentState && componentState.ctor === forgoElement.type;

    // We have compatible state, and this is a rerender
    if (haveCompatibleState) {
      if (
        fullRerender ||
        havePropsChanged(forgoElement.props, componentState.props)
      ) {
        if (
          !componentState.component.shouldUpdate ||
          componentState.component.shouldUpdate(
            forgoElement.props,
            componentState.props
          )
        ) {
          // Since we have compatible state already stored,
          // we'll push the savedComponentState into pending states for later attachment.
          const statesToAttach = pendingAttachStates.concat({
            ...componentState,
            props: forgoElement.props,
          });

          // Get a new element by calling render on existing component.
          const newForgoElement = componentState.component.render(
            forgoElement.props,
            componentState.args
          );

          return boundaryFallback(
            node,
            forgoElement.props,
            componentState.args,
            statesToAttach,
            fullRerender,
            boundary,
            () => {
              // Pass it on for rendering...
              return internalRender(
                newForgoElement,
                node,
                statesToAttach,
                fullRerender,
                boundary
              );
            }
          );
        }
        // shouldUpdate() returned false
        else {
          return { node, boundary };
        }
      }
      // not a fullRender and havePropsChanged() returned false
      else {
        return { node, boundary };
      }
    }
    // We don't have compatible state, have to create a new component.
    else {
      const args: ForgoRenderArgs = { element: { componentIndex } };

      const ctor = forgoElement.type;
      const component = ctor(forgoElement.props);
      assertIsComponent(ctor, component);

      boundary = component.error ? component : boundary;

      // Create new component state
      // ... and push it to pendingAttachStates
      const newComponentState = {
        key: forgoElement.key,
        ctor,
        component,
        props: forgoElement.props,
        args,
      };
      const statesToAttach = pendingAttachStates.concat(newComponentState);

      return boundaryFallback(
        node,
        forgoElement.props,
        args,
        statesToAttach,
        fullRerender,
        boundary,
        () => {
          // Create an element by rendering the component
          const newForgoElement = component.render(forgoElement.props, args);

          // Pass it on for rendering...
          return internalRender(
            newForgoElement,
            node,
            statesToAttach,
            fullRerender,
            boundary
          );
        }
      );
    }
  }
  // First time render
  else {
    const args: ForgoRenderArgs = {
      element: { componentIndex: pendingAttachStates.length },
    };
    const ctor = forgoElement.type;
    const component = ctor(forgoElement.props);
    assertIsComponent(ctor, component);

    boundary = component.error ? component : boundary;

    // We'll have to create a new component state
    // ... and push it to pendingAttachStates
    const componentState = {
      key: forgoElement.key,
      ctor,
      component,
      props: forgoElement.props,
      args,
    };

    const statesToAttach = pendingAttachStates.concat(componentState);

    // We have no node to render to yet. So pass undefined for the node.
    return boundaryFallback(
      undefined,
      forgoElement.props,
      args,
      statesToAttach,
      fullRerender,
      boundary,
      () => {
        const newForgoElement = component.render(forgoElement.props, args);
        // Pass it on for rendering...
        return internalRender(
          newForgoElement,
          undefined,
          statesToAttach,
          fullRerender,
          boundary
        );
      }
    );
  }
}

/*
  Loop through and render child nodes of a forgo DOM element.

  In the following example, if the forgoElement represents the 'parent' node, render the child nodes.
  eg:
    <div id="parent">
      <MyTopBar />
      <p id="first-child">some content goes here...</p>
      <MyFooter />
    </div>

  The parentElement is the actual DOM element which corresponds to forgoElement.
*/
function renderChildNodes<TProps extends ForgoElementProps>(
  forgoElement: ForgoElement<string | ForgoComponentCtor<TProps>, TProps>,
  parentElement: HTMLElement,
  fullRerender: boolean,
  boundary?: ForgoComponent<any>
) {
  const { children: forgoChildrenObj } = forgoElement.props;
  const childNodes = parentElement.childNodes;

  // Children will not be an array if single item
  const forgoChildren = (Array.isArray(forgoChildrenObj)
    ? forgoChildrenObj
    : [forgoChildrenObj]
  ).filter((x) => typeof x !== "undefined" && x !== null);

  let forgoChildIndex = 0;

  if (forgoChildren) {
    for (
      forgoChildIndex = 0;
      forgoChildIndex < forgoChildren.length;
      forgoChildIndex++
    ) {
      const forgoChild = forgoChildren[forgoChildIndex];

      // We have to find a matching node candidate, if any.
      if (!isForgoElement(forgoChild)) {
        // If the first node is a text node, we could pass that along.
        // No need to replace here, callee does that.
        if (
          childNodes[forgoChildIndex] &&
          childNodes[forgoChildIndex].nodeType === TEXT_NODE_TYPE
        ) {
          internalRender(
            stringOfPrimitiveNode(forgoChild),
            childNodes[forgoChildIndex],
            [],
            fullRerender,
            boundary
          );
        }
        // But otherwise, don't pass a replacement node. Just insert instead.
        else {
          const { node } = internalRender(
            stringOfPrimitiveNode(forgoChild),
            undefined,
            [],
            fullRerender,
            boundary
          );

          if (childNodes.length > forgoChildIndex) {
            parentElement.insertBefore(node, childNodes[forgoChildIndex]);
          } else {
            parentElement.appendChild(node);
          }
        }
      } else {
        const findResult =
          typeof forgoChild.type === "string"
            ? findReplacementCandidateForDOMElement(
                forgoChild as ForgoElement<string, any>,
                childNodes,
                forgoChildIndex
              )
            : findReplacementCandidateForCustomComponent(
                forgoChild as ForgoElement<ForgoComponentCtor<any>, any>,
                childNodes,
                forgoChildIndex
              );

        if (findResult.found) {
          const nodesToRemove = Array.from(childNodes).slice(
            forgoChildIndex,
            findResult.index
          );
          unloadNodes(nodesToRemove);
          internalRender(
            forgoChild,
            childNodes[forgoChildIndex],
            [],
            fullRerender
          );
        } else {
          const { node } = internalRender(
            forgoChild,
            undefined,
            [],
            fullRerender
          );
          if (childNodes.length > forgoChildIndex) {
            parentElement.insertBefore(node, childNodes[forgoChildIndex]);
          } else {
            parentElement.appendChild(node);
          }
        }
      }
    }
  }
  // Now we gotta remove old nodes which aren't being used.
  // Everything after forgoChildIndex must go.
  const nodesToRemove = Array.from(childNodes).slice(forgoChildIndex);
  unloadNodes(nodesToRemove);
}

/*
  Unloads components from a node list
  This does:
  a) Remove the node
  b) Calls unload on all attached components
*/
function unloadNodes(nodes: ChildNode[]) {
  for (const node of nodes) {
    node.remove();
    const state = getForgoState(node);
    if (state) {
      unmountComponents(state.components, 0);
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
      if (oldState.ctor !== newState.ctor) {
        break;
      }
      i++;
    } else {
      break;
    }
  }

  return i;
}

function mountComponents(
  states: NodeAttachedComponentState<any>[],
  from: number
) {
  for (let j = from; j < states.length; j++) {
    const state = states[j];
    if (state.component.mount) {
      state.component.mount(state.props, state.args);
    }
  }
}

function unmountComponents(
  states: NodeAttachedComponentState<any>[],
  from: number
) {
  for (let j = from; j < states.length; j++) {
    const state = states[j];
    if (state.component.unmount) {
      state.component.unmount(state.props, state.args);
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
function findReplacementCandidateForDOMElement(
  forgoElement: ForgoElement<string, any>,
  nodes: NodeListOf<ChildNode>,
  searchNodesFrom: number
): CandidateSearchResult {
  for (let i = searchNodesFrom; i < nodes.length; i++) {
    const node = nodes[i] as ChildNode;
    if (forgoElement.key) {
      const stateOnNode = getForgoState(node);
      if (stateOnNode?.key === forgoElement.key) {
        return { found: true, index: i };
      }
    } else {
      if (node.nodeType === ELEMENT_NODE_TYPE) {
        const element = node as HTMLElement;
        if (element.tagName.toLowerCase() === forgoElement.type) {
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
function findReplacementCandidateForCustomComponent(
  forgoElement: ForgoElement<ForgoComponentCtor<any>, any>,
  nodes: NodeListOf<ChildNode>,
  searchNodesFrom: number
): CandidateSearchResult {
  for (let i = searchNodesFrom; i < nodes.length; i++) {
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
  // We have to inject node into the args object.
  // components are already holding a reference to the args object.
  // They don't know yet that args.element.node is undefined.
  for (const state of pendingAttachStates) {
    state.args.element.node = node;
  }

  if (isForgoElement(forgoNode)) {
    const currentState = getForgoState(node);

    // Remove props which don't match
    if (currentState && currentState.props) {
      const currentEntries = Object.entries(currentState.props);
      for (const [key, value] of currentEntries) {
        if (key !== "children" && forgoNode.props[key] !== value) {
          (node as any)[key] = undefined;
        }
      }
    }

    // We're gonna keep this simple.
    // Attach everything as is.
    const entries = Object.entries(forgoNode.props);
    for (const [key, value] of entries) {
      if (key !== "children") {
        (node as any)[key] = value;
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
  Compare old props and new props.
  We don't rerender if props remain the same.
*/
function havePropsChanged(newProps: any, oldProps: any) {
  const oldKeys = Object.keys(oldProps);
  const newKeys = Object.keys(newProps);
  return (
    oldKeys.length !== newKeys.length ||
    oldKeys.some((key) => oldProps[key] !== newProps[key])
  );
}

/*
  Mount will render the DOM as a child of the specified container element.
*/
export function mount(
  forgoNode: ForgoNode,
  container: HTMLElement | string | null
) {
  let parentElement = isString(container)
    ? env.document.querySelector(container)
    : container;

  if (parentElement) {
    const { node } = internalRender(forgoNode, undefined, [], true);
    parentElement.appendChild(node);
  } else {
    throw new Error(`Mount was called on a non-element (${parentElement}).`);
  }
}

/*
  This render function returns the rendered dom node.
  forgoNode is the node to render.
*/
export function render(forgoNode: ForgoNode) {
  return internalRender(forgoNode, undefined, [], true);
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
  props = undefined,
  fullRerender = true
) {
  if (element && element.node) {
    const state = getForgoState(element.node);
    if (state) {
      const componentState = state.components[element.componentIndex];

      const effectiveProps =
        typeof props !== "undefined" ? props : componentState.props;

      if (
        !componentState.component.shouldUpdate ||
        componentState.component.shouldUpdate(
          effectiveProps,
          componentState.props
        )
      ) {
        const forgoNode = componentState.component.render(
          effectiveProps,
          componentState.args
        );

        const statesToAttach = state.components
          .slice(0, element.componentIndex)
          .concat({
            ...componentState,
            props: effectiveProps,
          });

        internalRender(forgoNode, element.node, statesToAttach, fullRerender);
      }
    } else {
      throw new Error(`Missing forgo state on node.`);
    }
  } else {
    throw new Error(`Missing node information in rerender() argument.`);
  }
}

/*
  ForgoNodes can be primitive types.
  Convert all primitive types to their string representation.
*/
function stringOfPrimitiveNode(node: ForgoNode): string {
  return typeof node === "undefined" || node === null ? "" : node.toString();
}

/*
  Nodes could be strings, numbers, booleans etc.
  Treat them as strings.
*/
function isForgoElement(node: ForgoNode): node is ForgoElement<any, any> {
  return (
    typeof node !== "undefined" &&
    node !== null &&
    (node as any).__is_forgo_element__ === true
  );
}

/*
  Get the state (NodeAttachedState) saved into an element.
*/
export function getForgoState(node: ChildNode): NodeAttachedState | undefined {
  return node.__forgo;
}

/*
  Same as above, but will never be undefined. (Caller makes sure.)
*/
function getExistingForgoState(node: Required<ChildNode>): NodeAttachedState {
  return node.__forgo;
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
function assertIsComponent(
  ctor: ForgoComponentCtor<any>,
  component: ForgoComponent<any>
) {
  if (!component.render) {
    throw new Error(
      `${
        ctor.name || "Unnamed"
      } component constructor must return an object having a render() function.`
    );
  }
}
