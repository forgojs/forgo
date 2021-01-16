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

/*
  ForgoComponent contains three functions.
  1. render() returns the actual DOM to render. 
  2. unmount() is optional. Gets called just before unmount.
*/
export type ForgoComponent<TProps extends ForgoElementProps> = {
  render: (
    props: TProps,
    args: ForgoRenderArgs
  ) => ForgoElement<ForgoComponentCtor<TProps>, TProps>;
  unmount?: () => void;
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
  | BigInt
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
function render(
  forgoNode: ForgoNode,
  node: ChildNode | undefined,
  pendingAttachStates: NodeAttachedComponentState<any>[],
  fullRerender: boolean
): { node: ChildNode } {
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
      fullRerender
    );
  }
  // Custom Component.
  // We don't renderChildren since that is the CustomComponent's prerogative.
  else {
    return renderCustomComponent(
      forgoNode as ForgoElement<ForgoComponentCtor<any>, any>,
      node,
      pendingAttachStates,
      fullRerender
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
  attachProps(text, textNode, pendingAttachStates);
  if (node) {
    // If there are old component states, we might need to unmount some of em.
    // After comparing with the new states.
    const oldComponentStates = getForgoState(node)?.components;
    if (oldComponentStates) {
      unloadIncompatibleStates(pendingAttachStates, oldComponentStates);
    }

    node.replaceWith(textNode);
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
  fullRerender: boolean
): { node: ChildNode } {
  if (node) {
    let nodeToBindTo: ChildNode;

    // If there are old component states, we might need to unmount some of em.
    // After comparing with the new states.
    const oldComponentStates = getForgoState(node)?.components;
    if (oldComponentStates) {
      unloadIncompatibleStates(pendingAttachStates, oldComponentStates);
    }

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
    attachProps(forgoElement, nodeToBindTo, pendingAttachStates);

    renderChildNodes(forgoElement, nodeToBindTo as HTMLElement, fullRerender);
    return { node: nodeToBindTo };
  } else {
    // There was no node passed in, so create a new element.
    const newElement = env.document.createElement(forgoElement.type);
    if (forgoElement.props.ref) {
      forgoElement.props.ref.value = newElement;
    }
    attachProps(forgoElement, newElement, pendingAttachStates);
    renderChildNodes(forgoElement, newElement, fullRerender);
    return { node: newElement };
  }
}

/*
  Render a Custom Component
  Such as <MySideBar size="large" />
*/
function renderCustomComponent<TProps extends ForgoElementProps>(
  forgoElement: ForgoElement<ForgoComponentCtor<TProps>, TProps>,
  node: ChildNode | undefined,
  pendingAttachStates: NodeAttachedComponentState<any>[],
  fullRerender: boolean
): { node: ChildNode } {
  if (node) {
    const state = getExistingForgoState(node);

    const componentIndex = pendingAttachStates.length;
    const savedComponentState = state.components[componentIndex];
    const hasCompatibleState =
      savedComponentState && savedComponentState.ctor === forgoElement.type;

    if (!hasCompatibleState) {
      // We have to create a new component
      const args: ForgoRenderArgs = { element: { componentIndex } };
      const ctor = forgoElement.type;
      const component = ctor(forgoElement.props);

      // Create new component state
      // ... and push it to pendingAttachStates
      const componentState = {
        key: forgoElement.key,
        ctor,
        component,
        props: forgoElement.props,
        args,
      };
      const statesToAttach = pendingAttachStates.concat(componentState);

      // Create an element by rendering the component
      const newForgoElement = component.render(forgoElement.props, args);

      // Pass it on for rendering...
      return render(newForgoElement, node, statesToAttach, fullRerender);
    }
    // We have compatible state, and this is a rerender
    else {
      if (
        fullRerender ||
        havePropsChanged(savedComponentState.props, forgoElement.props)
      ) {
        const args = {
          element: { componentIndex: pendingAttachStates.length },
        };

        // Since we have compatible state already stored,
        // we'll push the savedComponentState into pending states for later attachment.
        const statesToAttach = pendingAttachStates.concat({
          ...savedComponentState,
          props: forgoElement.props,
        });

        // Get a new element by calling render on existing component.
        const newForgoElement = savedComponentState.component.render(
          forgoElement.props,
          args
        );

        // Pass it on for rendering...
        return render(newForgoElement, node, statesToAttach, fullRerender);
      } else {
        return { node };
      }
    }
  }
  // First time render
  else {
    const args: ForgoRenderArgs = { element: { componentIndex: 0 } };
    const ctor = forgoElement.type;
    const component = ctor(forgoElement.props);

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
    const newForgoElement = component.render(forgoElement.props, args);

    // We have no node to render to yet. So pass undefined for the node.
    return render(newForgoElement, undefined, statesToAttach, fullRerender);
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
  fullRerender: boolean
) {
  const { children: forgoChildrenObj } = forgoElement.props;
  const childNodes = parentElement.childNodes;

  // Children will not be an array if single item
  const forgoChildren = (forgoChildrenObj !== undefined
    ? Array.isArray(forgoChildrenObj)
      ? forgoChildrenObj
      : [forgoChildrenObj]
    : []) as ForgoNode[];

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
          render(
            stringOfPrimitiveNode(forgoChild),
            childNodes[forgoChildIndex],
            [],
            fullRerender
          );
        }
        // But otherwise, don't pass a replacement node. Just insert instead.
        else {
          const { node } = render(
            stringOfPrimitiveNode(forgoChild),
            undefined,
            [],
            fullRerender
          );
          parentElement.insertBefore(node, childNodes[forgoChildIndex]);
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
          for (let i = forgoChildIndex; i < findResult.index; i++) {
            unloadNode(parentElement, childNodes[i]);
          }
          render(forgoChild, childNodes[forgoChildIndex], [], fullRerender);
        } else {
          const { node } = render(forgoChild, undefined, [], fullRerender);
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
  for (let i = forgoChildIndex; i < childNodes.length; i++) {
    unloadNode(parentElement, childNodes[i]);
  }
}

/*
  Unloads components from a node list
  This does:
  a) Remove the node
  b) Calls unload on all attached components
*/
function unloadNode(parentElement: HTMLElement, node: ChildNode) {
  parentElement.removeChild(node);
  const state = getForgoState(node);
  if (state) {
    for (const componentState of state.components) {
      if (componentState.component.unmount) {
        componentState.component.unmount();
      }
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
function unloadIncompatibleStates(
  newStates: NodeAttachedComponentState<any>[],
  oldStates: NodeAttachedComponentState<any>[]
) {
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

  for (let j = i; j < oldStates.length; j++) {
    const oldState = oldStates[j];
    if (oldState.component.unmount) {
      oldState.component.unmount();
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
  if (forgoElement.key) {
    for (let i = searchNodesFrom; i < nodes.length; i++) {
      const node = nodes[i] as ChildNode;
      const stateOnNode = getForgoState(node);
      if (stateOnNode?.key === forgoElement.key) {
        return { found: true, index: i };
      }
    }
    return { found: false };
  } else {
    for (let i = searchNodesFrom; i < nodes.length; i++) {
      const node = nodes[i] as ChildNode;
      if (node.nodeType === ELEMENT_NODE_TYPE) {
        const element = node as HTMLElement;
        if (element.tagName.toLowerCase() === forgoElement.type) {
          return { found: true, index: i };
        }
      }
    }
    return { found: false };
  }
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
  if (forgoElement.key) {
    for (let i = searchNodesFrom; i < nodes.length; i++) {
      const node = nodes[i] as ChildNode;
      const stateOnNode = getForgoState(node);
      if (stateOnNode && stateOnNode.components.length > 0) {
        if (stateOnNode.components[0].key === forgoElement.key) {
          return { found: true, index: i };
        }
      }
    }
    return { found: false };
  } else {
    for (let i = searchNodesFrom; i < nodes.length; i++) {
      const node = nodes[i] as ChildNode;
      const stateOnNode = getForgoState(node);
      if (stateOnNode && stateOnNode.components.length > 0) {
        if (stateOnNode.components[0].ctor === forgoElement.type) {
          return { found: true, index: i };
        }
      }
    }
    return { found: false };
  }
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
  if (isForgoElement(forgoNode)) {
    // We're gonna keep this simple.
    // Attach everything as is.
    const entries = Object.entries(forgoNode.props);
    for (const [key, value] of entries) {
      if (key !== "children") {
        (node as any)[key] = value;
      }
    }
  }

  // We have to inject node into the args object.
  // components are already holding a reference to the args object.
  // They don't know yet that args.element.node is undefined.
  for (const state of pendingAttachStates) {
    state.args.element.node = node;
  }

  // Now attach the internal forgo state.
  const state: NodeAttachedState = {
    key: isForgoElement(forgoNode) ? forgoNode.key : undefined,
    components: pendingAttachStates,
  };

  setForgoState(node, state);
}

/*
  Compare old props and new props.
  We don't rerender if props remain the same.
*/
function havePropsChanged(oldProps: any, newProps: any) {
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
export function mount(forgoNode: ForgoNode, parentElement: HTMLElement | null) {
  if (parentElement) {
    const { node } = render(forgoNode, undefined, [], true);
    parentElement.appendChild(node);
  } else {
    throw new Error(`Mount was called on a non-element (${parentElement}).`);
  }
}

interface HydrateOptions {
  root?: string | (() => HTMLElement) | HTMLElement;
}

/*
  Mount will hydrate the DOM as a child of the specified container element.
*/
export function hydrate(
  forgoNode: ForgoNode,
  parentElement: HTMLElement | null,
  options: HydrateOptions
) {
  const opts = options || {};
  if (parentElement) {
    let root;
    if (typeof opts.root === "function") {
      root = opts.root();
    } else if (typeof opts.root === "object") {
      root = opts.root;
    } else {
      root = parentElement.querySelector(opts.root || "[forgo-root]");
    }

    if (!root) {
      throw new Error("Could not locate root to hydrate into.");
    }

    const { node } = render(forgoNode, undefined, [], false);
    parentElement.replaceChild(node, root);
  } else {
    throw new Error(`Mount was called on a non-element (${parentElement}).`);
  }
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
      const component = state.components[element.componentIndex];

      const effectiveProps =
        typeof props !== "undefined" ? props : component.props;

      const forgoNode = component.component.render(
        effectiveProps,
        component.args
      );

      const statesToAttach = state.components
        .slice(0, element.componentIndex)
        .concat({
          ...component,
          props: effectiveProps,
        });

      render(forgoNode, element.node, statesToAttach, fullRerender);
    } else {
      throw new Error(
        `Rerender was called on an element which was never seen before.`
      );
    }
  }
}

/*
  ForgoNodes can be primitive types.
  Convert all primitive types to their string representation.
*/
function stringOfPrimitiveNode(node: ForgoNode) {
  return typeof node === "undefined" ? "undefined" : node.toString();
}

/*
  Nodes could be strings, numbers, booleans etc.
  Treat them as strings.
*/
function isForgoElement(node: ForgoNode): node is ForgoElement<any, any> {
  return (
    typeof node !== "undefined" && (node as any).__is_forgo_element__ === true
  );
}

/*
  Get the state (NodeAttachedState) saved into an element.
*/
function getForgoState(node: ChildNode): NodeAttachedState | undefined {
  return (node as any).__forgo;
}

/*
  Same as above, but will never be undefined. (Caller makes sure.)
*/
function getExistingForgoState(node: ChildNode): NodeAttachedState {
  return (node as any).__forgo;
}

/*
  Sets the state (NodeAttachedState) on an element.
*/
function setForgoState(node: ChildNode, state: NodeAttachedState): void {
  (node as any).__forgo = state;
}
