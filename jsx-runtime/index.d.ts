export namespace JSX {
  export interface IntrinsicElements {
    [e: string]: any;
  }
}

export type ForgoRef<T> = {
  value?: T;
};

export type ForgoElementProps = {
  ref?: ForgoRef<HTMLElement>;
  children?: ForgoNode[];
};

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

export type ForgoComponent<TProps extends ForgoElementProps> = {
  render: (props: TProps, args: ForgoRenderArgs) => ForgoNode | ForgoNode[];
  afterRender?: (props: TProps, args: ForgoAfterRenderArgs) => void;
  error?: (props: TProps, args: ForgoErrorArgs) => ForgoNode;
  mount?: (props: TProps, args: ForgoRenderArgs) => void;
  unmount?: (props: TProps, args: ForgoRenderArgs) => void;
  shouldUpdate?: (newProps: TProps, oldProps: TProps) => boolean;
};

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

export type ForgoElement<TProps extends ForgoElementProps> =
  | ForgoDOMElement<TProps>
  | ForgoCustomComponentElement<TProps>;

export type ForgoPrimitiveNode =
  | string
  | number
  | boolean
  | object
  | null
  | BigInt
  | undefined;

export type ForgoNode = ForgoPrimitiveNode | ForgoElement<any>;

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

export function Fragment(): void;
