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
  dangerouslySetInnerHTML?: { __html: string };
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

export type ForgoComponentProps = {
  children?: ForgoNode | ForgoNode[];
};

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

export type ForgoDOMElement<TProps> = ForgoElementBase<TProps> & {
  type: string;
};

export type ForgoComponentElement<TProps> = ForgoElementBase<TProps> & {
  type: ForgoComponentCtor<TProps>;
};

export type ForgoFragment = {
  type: Symbol;
  props: { children?: ForgoNode | ForgoNode[] };
  __is_forgo_element__: true;
};

export type ForgoElement<TProps extends ForgoElementProps> =
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

export function jsxs<TProps extends ForgoElementProps>(
  type: string | ForgoComponentCtor<TProps>,
  props: TProps,
  key: any
): {
  type: string | ForgoComponentCtor<TProps>;
  props: TProps;
  key: any;
  __is_forgo_element__: true;
};

export function jsx<TProps extends ForgoElementProps>(
  type: string | ForgoComponentCtor<TProps>,
  props: TProps,
  key: any
): {
  type: string | ForgoComponentCtor<TProps>;
  props: TProps;
  key: any;
  __is_forgo_element__: true;
};

export function jsxDEV<TProps extends ForgoElementProps>(
  type: string | ForgoComponentCtor<TProps>,
  props: TProps,
  key: any
): {
  type: string | ForgoComponentCtor<TProps>;
  props: TProps;
  key: any;
  __is_forgo_element__: true;
};

// lifted from preact.
type DOMCSSProperties = {
  [key in keyof Omit<
    CSSStyleDeclaration,
    | "item"
    | "setProperty"
    | "removeProperty"
    | "getPropertyValue"
    | "getPropertyPriority"
  >]?: string | number | null | undefined;
};
type AllCSSProperties = {
  [key: string]: string | number | null | undefined;
};
interface CSSProperties extends AllCSSProperties, DOMCSSProperties {
  cssText?: string | null;
}

export type ForgoIntrinsicElement<T> = {
  [key: string]: any;
} & Omit<
  {
    [K in keyof T]?: T[K];
  },
  "key" | "children" | "style"
> & {
    key?: any;
    children?: ForgoNode | ForgoNode[];
    style?: string | CSSProperties;
  };

export namespace JSX {
  export interface IntrinsicElements {
    [key: string]: ForgoIntrinsicElement<any>;
    a: ForgoIntrinsicElement<HTMLAnchorElement>;
    abbr: ForgoIntrinsicElement<HTMLElement>;
    address: ForgoIntrinsicElement<HTMLElement>;
    area: ForgoIntrinsicElement<HTMLAreaElement>;
    article: ForgoIntrinsicElement<HTMLElement>;
    aside: ForgoIntrinsicElement<HTMLElement>;
    audio: ForgoIntrinsicElement<HTMLAudioElement>;
    b: ForgoIntrinsicElement<HTMLElement>;
    base: ForgoIntrinsicElement<HTMLBaseElement>;
    bdi: ForgoIntrinsicElement<HTMLElement>;
    bdo: ForgoIntrinsicElement<HTMLElement>;
    big: ForgoIntrinsicElement<HTMLElement>;
    blockquote: ForgoIntrinsicElement<HTMLElement>;
    body: ForgoIntrinsicElement<HTMLBodyElement>;
    br: ForgoIntrinsicElement<HTMLBRElement>;
    button: ForgoIntrinsicElement<HTMLButtonElement>;
    canvas: ForgoIntrinsicElement<HTMLCanvasElement>;
    caption: ForgoIntrinsicElement<HTMLElement>;
    cite: ForgoIntrinsicElement<HTMLElement>;
    code: ForgoIntrinsicElement<HTMLElement>;
    col: ForgoIntrinsicElement<HTMLTableColElement>;
    colgroup: ForgoIntrinsicElement<HTMLTableColElement>;
    data: ForgoIntrinsicElement<HTMLDataElement>;
    datalist: ForgoIntrinsicElement<HTMLDataListElement>;
    dd: ForgoIntrinsicElement<HTMLElement>;
    del: ForgoIntrinsicElement<HTMLElement>;
    details: ForgoIntrinsicElement<HTMLElement>;
    dfn: ForgoIntrinsicElement<HTMLElement>;
    dialog: ForgoIntrinsicElement<HTMLDialogElement>;
    div: ForgoIntrinsicElement<HTMLDivElement>;
    dl: ForgoIntrinsicElement<HTMLDListElement>;
    dt: ForgoIntrinsicElement<HTMLElement>;
    em: ForgoIntrinsicElement<HTMLElement>;
    embed: ForgoIntrinsicElement<HTMLEmbedElement>;
    fieldset: ForgoIntrinsicElement<HTMLFieldSetElement>;
    figcaption: ForgoIntrinsicElement<HTMLElement>;
    figure: ForgoIntrinsicElement<HTMLElement>;
    footer: ForgoIntrinsicElement<HTMLElement>;
    form: ForgoIntrinsicElement<HTMLFormElement>;
    h1: ForgoIntrinsicElement<HTMLHeadingElement>;
    h2: ForgoIntrinsicElement<HTMLHeadingElement>;
    h3: ForgoIntrinsicElement<HTMLHeadingElement>;
    h4: ForgoIntrinsicElement<HTMLHeadingElement>;
    h5: ForgoIntrinsicElement<HTMLHeadingElement>;
    h6: ForgoIntrinsicElement<HTMLHeadingElement>;
    head: ForgoIntrinsicElement<HTMLHeadElement>;
    header: ForgoIntrinsicElement<HTMLElement>;
    hgroup: ForgoIntrinsicElement<HTMLElement>;
    hr: ForgoIntrinsicElement<HTMLHRElement>;
    html: ForgoIntrinsicElement<HTMLHtmlElement>;
    i: ForgoIntrinsicElement<HTMLElement>;
    iframe: ForgoIntrinsicElement<HTMLIFrameElement>;
    img: ForgoIntrinsicElement<HTMLImageElement>;
    input: ForgoIntrinsicElement<HTMLInputElement>;
    ins: ForgoIntrinsicElement<HTMLModElement>;
    kbd: ForgoIntrinsicElement<HTMLElement>;
    keygen: ForgoIntrinsicElement<HTMLElement>;
    label: ForgoIntrinsicElement<HTMLLabelElement>;
    legend: ForgoIntrinsicElement<HTMLLegendElement>;
    li: ForgoIntrinsicElement<HTMLLIElement>;
    link: ForgoIntrinsicElement<HTMLLinkElement>;
    main: ForgoIntrinsicElement<HTMLElement>;
    map: ForgoIntrinsicElement<HTMLMapElement>;
    mark: ForgoIntrinsicElement<HTMLElement>;
    menu: ForgoIntrinsicElement<HTMLElement>;
    menuitem: ForgoIntrinsicElement<HTMLElement>;
    meta: ForgoIntrinsicElement<HTMLMetaElement>;
    meter: ForgoIntrinsicElement<HTMLElement>;
    nav: ForgoIntrinsicElement<HTMLElement>;
    noindex: ForgoIntrinsicElement<HTMLElement>;
    noscript: ForgoIntrinsicElement<HTMLElement>;
    object: ForgoIntrinsicElement<HTMLObjectElement>;
    ol: ForgoIntrinsicElement<HTMLOListElement>;
    optgroup: ForgoIntrinsicElement<HTMLOptGroupElement>;
    option: ForgoIntrinsicElement<HTMLOptionElement>;
    output: ForgoIntrinsicElement<HTMLElement>;
    p: ForgoIntrinsicElement<HTMLParagraphElement>;
    param: ForgoIntrinsicElement<HTMLParamElement>;
    picture: ForgoIntrinsicElement<HTMLElement>;
    pre: ForgoIntrinsicElement<HTMLPreElement>;
    progress: ForgoIntrinsicElement<HTMLProgressElement>;
    q: ForgoIntrinsicElement<HTMLQuoteElement>;
    rp: ForgoIntrinsicElement<HTMLElement>;
    rt: ForgoIntrinsicElement<HTMLElement>;
    ruby: ForgoIntrinsicElement<HTMLElement>;
    s: ForgoIntrinsicElement<HTMLElement>;
    samp: ForgoIntrinsicElement<HTMLElement>;
    slot: ForgoIntrinsicElement<HTMLSlotElement>;
    script: ForgoIntrinsicElement<HTMLScriptElement>;
    section: ForgoIntrinsicElement<HTMLElement>;
    select: ForgoIntrinsicElement<HTMLSelectElement>;
    small: ForgoIntrinsicElement<HTMLElement>;
    source: ForgoIntrinsicElement<HTMLSourceElement>;
    span: ForgoIntrinsicElement<HTMLSpanElement>;
    strong: ForgoIntrinsicElement<HTMLElement>;
    style: ForgoIntrinsicElement<HTMLStyleElement>;
    sub: ForgoIntrinsicElement<HTMLElement>;
    summary: ForgoIntrinsicElement<HTMLElement>;
    sup: ForgoIntrinsicElement<HTMLElement>;
    table: ForgoIntrinsicElement<HTMLTableElement>;
    template: ForgoIntrinsicElement<HTMLTemplateElement>;
    tbody: ForgoIntrinsicElement<HTMLTableSectionElement>;
    td: ForgoIntrinsicElement<HTMLTableDataCellElement>;
    textarea: ForgoIntrinsicElement<HTMLTextAreaElement>;
    tfoot: ForgoIntrinsicElement<HTMLTableSectionElement>;
    th: ForgoIntrinsicElement<HTMLTableHeaderCellElement>;
    thead: ForgoIntrinsicElement<HTMLTableSectionElement>;
    time: ForgoIntrinsicElement<HTMLElement>;
    title: ForgoIntrinsicElement<HTMLTitleElement>;
    tr: ForgoIntrinsicElement<HTMLTableRowElement>;
    track: ForgoIntrinsicElement<HTMLTrackElement>;
    u: ForgoIntrinsicElement<HTMLElement>;
    ul: ForgoIntrinsicElement<HTMLUListElement>;
    var: ForgoIntrinsicElement<HTMLElement>;
    video: ForgoIntrinsicElement<HTMLVideoElement>;
    wbr: ForgoIntrinsicElement<HTMLElement>;

    // SVG
    svg: ForgoIntrinsicElement<SVGSVGElement>;
    animate: ForgoIntrinsicElement<SVGElement>;
    animateMotion: ForgoIntrinsicElement<SVGElement>;
    animateTransform: ForgoIntrinsicElement<SVGElement>;
    circle: ForgoIntrinsicElement<SVGCircleElement>;
    clipPath: ForgoIntrinsicElement<SVGClipPathElement>;
    defs: ForgoIntrinsicElement<SVGDefsElement>;
    desc: ForgoIntrinsicElement<SVGDescElement>;
    ellipse: ForgoIntrinsicElement<SVGEllipseElement>;
    feBlend: ForgoIntrinsicElement<SVGFEBlendElement>;
    feColorMatrix: ForgoIntrinsicElement<SVGFEColorMatrixElement>;
    feComponentTransfer: ForgoIntrinsicElement<SVGFEComponentTransferElement>;
    feComposite: ForgoIntrinsicElement<SVGFECompositeElement>;
    feConvolveMatrix: ForgoIntrinsicElement<SVGFEConvolveMatrixElement>;
    feDiffuseLighting: ForgoIntrinsicElement<SVGFEDiffuseLightingElement>;
    feDisplacementMap: ForgoIntrinsicElement<SVGFEDisplacementMapElement>;
    feDistantLight: ForgoIntrinsicElement<SVGFEDistantLightElement>;
    feDropShadow: ForgoIntrinsicElement<SVGFEDropShadowElement>;
    feFlood: ForgoIntrinsicElement<SVGFEFloodElement>;
    feFuncA: ForgoIntrinsicElement<SVGFEFuncAElement>;
    feFuncB: ForgoIntrinsicElement<SVGFEFuncBElement>;
    feFuncG: ForgoIntrinsicElement<SVGFEFuncGElement>;
    feFuncR: ForgoIntrinsicElement<SVGFEFuncRElement>;
    feGaussianBlur: ForgoIntrinsicElement<SVGFEGaussianBlurElement>;
    feImage: ForgoIntrinsicElement<SVGFEImageElement>;
    feMerge: ForgoIntrinsicElement<SVGFEMergeElement>;
    feMergeNode: ForgoIntrinsicElement<SVGFEMergeNodeElement>;
    feMorphology: ForgoIntrinsicElement<SVGFEMorphologyElement>;
    feOffset: ForgoIntrinsicElement<SVGFEOffsetElement>;
    fePointLight: ForgoIntrinsicElement<SVGFEPointLightElement>;
    feSpecularLighting: ForgoIntrinsicElement<SVGFESpecularLightingElement>;
    feSpotLight: ForgoIntrinsicElement<SVGFESpotLightElement>;
    feTile: ForgoIntrinsicElement<SVGFETileElement>;
    feTurbulence: ForgoIntrinsicElement<SVGFETurbulenceElement>;
    filter: ForgoIntrinsicElement<SVGFilterElement>;
    foreignObject: ForgoIntrinsicElement<SVGForeignObjectElement>;
    g: ForgoIntrinsicElement<SVGGElement>;
    image: ForgoIntrinsicElement<SVGImageElement>;
    line: ForgoIntrinsicElement<SVGLineElement>;
    linearGradient: ForgoIntrinsicElement<SVGLinearGradientElement>;
    marker: ForgoIntrinsicElement<SVGMarkerElement>;
    mask: ForgoIntrinsicElement<SVGMaskElement>;
    metadata: ForgoIntrinsicElement<SVGMetadataElement>;
    mpath: ForgoIntrinsicElement<SVGElement>;
    path: ForgoIntrinsicElement<SVGPathElement>;
    pattern: ForgoIntrinsicElement<SVGPatternElement>;
    polygon: ForgoIntrinsicElement<SVGPolygonElement>;
    polyline: ForgoIntrinsicElement<SVGPolylineElement>;
    radialGradient: ForgoIntrinsicElement<SVGRadialGradientElement>;
    rect: ForgoIntrinsicElement<SVGRectElement>;
    stop: ForgoIntrinsicElement<SVGStopElement>;
    switch: ForgoIntrinsicElement<SVGSwitchElement>;
    symbol: ForgoIntrinsicElement<SVGSymbolElement>;
    text: ForgoIntrinsicElement<SVGTextElement>;
    textPath: ForgoIntrinsicElement<SVGTextPathElement>;
    tspan: ForgoIntrinsicElement<SVGTSpanElement>;
    use: ForgoIntrinsicElement<SVGUseElement>;
    view: ForgoIntrinsicElement<SVGViewElement>;
  }
}
