/*
  A type that wraps a reference.
*/
export type ForgoRef<T> = {
  value?: T;
};

/*
  We have two types of elements
  1. DOM Elements
  2. Custom Component Elements
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
  This is the constructor of a ForgoComponent, called a 'Component Constructor'
 
  The terminology is different from React here.
  For example, in <MyComponent />, the MyComponent is the Component Constructor.
  The Component Constructor is defined by the type ForgoComponentCtor, and it returns a Component (of type ForgoComponent).
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

export type ForgoDOMElement<
  TProps extends ForgoDOMElementProps
> = ForgoElementBase<TProps> & {
  type: string;
};

export type ForgoComponentElement<
  TProps extends ForgoComponentProps
> = ForgoElementBase<TProps> & {
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
