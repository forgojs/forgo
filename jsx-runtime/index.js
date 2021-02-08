export { Fragment } from "../";

export function jsxs(type, props, key) {
  return { type, props, key, __is_forgo_element__: true };
}

export function jsx(type, props, key) {
  return { type, props, key, __is_forgo_element__: true };
}

/* TODO: implement this correctly. */
export function jsxDEV(type, props, key, source) {
  return { type, props, key, __is_forgo_element__: true };
}

