import {
  ForgoComponentCtor,
  ForgoElementProps,
  ForgoNode,
} from "../src/index.js";

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

export { JSX } from "../src/jsx";
