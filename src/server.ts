import type { ForgoComponentCtor, ForgoElement, ForgoNode } from "./";

const {
  encodeEntities,
  indent,
  isLargeString,
  styleObjToCss,
  getChildren,
} = require("preact-render-to-string/src/util");

interface RenderToStringOptions {
  shallow?: boolean;
  xml?: boolean;
  pretty?: boolean;
  voidElements?: RegExp;
}

const SHALLOW: RenderToStringOptions = { shallow: true };

// components without names, kept as a hash for later comparison to return consistent UnnamedComponentXX names.
const UNNAMED: string[] = [];

const VOID_ELEMENTS = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/;

/**
 * Render Preact JSX + Components to an HTML string.
 */
renderToString.render = renderToString;

let shallowRender = (vnode: ForgoNode, options?: RenderToStringOptions) =>
  renderToString(vnode, { ...options, ...SHALLOW });

function renderToString(vnode: ForgoNode, options?: RenderToStringOptions) {
  const res = _renderToString(vnode, options);
  return res;
}

/** The default export is an alias of `render()`. */
function _renderToString(
  vnode: ForgoNode,
  options?: any,
  inner?: boolean,
  isSvgMode?: boolean,
  selectValue?: boolean
): string {
  if (vnode == null || typeof vnode === "boolean") {
    return "";
  }

  // wrap array nodes in Fragment
  if (Array.isArray(vnode)) {
    // vnode = createElement(Fragment, null, vnode);
    throw new Error("Array vnode not yet supported");
  }

  const forgoNode = vnode as ForgoElement<
    string | ForgoComponentCtor<any>,
    any
  >;

  let nodeName = forgoNode.type,
    props = forgoNode.props,
    isComponent = false;
  let opts = options || {};

  let pretty = opts.pretty,
    indentChar = pretty && typeof pretty === "string" ? pretty : "\t";

  // #text nodes
  if (typeof vnode !== "object" && !nodeName) {
    return encodeEntities(vnode);
  }

  // components
  if (typeof nodeName === "function") {
    isComponent = true;
    if (opts.shallow && (inner || opts.renderRootComponent === false)) {
      nodeName = getComponentName(nodeName);
    } else if (false /*nodeName === Fragment*/) {
      // TODO: Implement fragments
      // let rendered = "";
      // let children = [];
      // getChildren(children, vnode.props.children);
      // for (let i = 0; i < children.length; i++) {
      //   rendered +=
      //     (i > 0 && pretty ? "\n" : "") +
      //     _renderToString(
      //       children[i],
      //       opts,
      //       opts.shallowHighOrder !== false,
      //       isSvgMode,
      //       selectValue
      //     );
      // }
      // return rendered;
    } else {
      let rendered;

      // stateless functional components
      rendered = nodeName
        .call(null, props)
        .render.call(null, props, null as any);

      return _renderToString(
        rendered,
        opts,
        opts.shallowHighOrder !== false,
        isSvgMode,
        selectValue
      );
    }
  }

  // render JSX to HTML
  let s = "",
    propChildren,
    html;

  if (props) {
    let attrs = Object.keys(props);

    for (let i = 0; i < attrs.length; i++) {
      let name = attrs[i],
        v = props[name];
      if (name === "children") {
        propChildren = v;
        continue;
      }

      if (name.match(/[\s\n\\/='"\0<>]/)) continue;

      if (
        !false &&
        (name === "key" ||
          name === "ref" ||
          name === "__self" ||
          name === "__source" ||
          name === "defaultValue")
      )
        continue;

      if (name === "className") {
        if (props.class) continue;
        name = "class";
      } else if (isSvgMode && name.match(/^xlink:?./)) {
        name = name.toLowerCase().replace(/^xlink:?/, "xlink:");
      }

      if (name === "htmlFor") {
        if (props.for) continue;
        name = "for";
      }

      if (name === "style" && v && typeof v === "object") {
        v = styleObjToCss(v);
      }

      // always use string values instead of booleans for aria attributes
      // also see https://github.com/preactjs/preact/pull/2347/files
      if (name[0] === "a" && name[1] === "r" && typeof v === "boolean") {
        v = String(v);
      }

      if (name === "dangerouslySetInnerHTML") {
        html = v && v.__html;
      } else if (nodeName === "textarea" && name === "value") {
        // <textarea value="a&b"> --> <textarea>a&amp;b</textarea>
        propChildren = v;
      } else if ((v || v === 0 || v === "") && typeof v !== "function") {
        if (v === true || v === "") {
          v = name;
          // in non-xml mode, allow boolean attributes
          if (true) {
            s += " " + name;
            continue;
          }
        }

        if (name === "value") {
          if (nodeName === "select") {
            selectValue = v;
            continue;
          } else if (nodeName === "option" && selectValue == v) {
            s += ` selected`;
          }
        }
        s += ` ${name}="${encodeEntities(v)}"`;
      }
    }
  }

  // account for >1 multiline attribute
  if (pretty) {
    let sub = s.replace(/^\n\s*/, " ");
    if (sub !== s && !~sub.indexOf("\n")) s = sub;
    else if (pretty && ~s.indexOf("\n")) s += "\n";
  }

  s = `<${nodeName}${s}>`;
  if (String(nodeName).match(/[\s\n\\/='"\0<>]/))
    throw new Error(`${nodeName} is not a valid HTML tag name in ${s}`);

  let isVoid = String(nodeName).match(VOID_ELEMENTS);
  let pieces = [];

  let children: ForgoNode[] | undefined = undefined;
  if (html) {
    // if multiline, indent.
    if (pretty && isLargeString(html)) {
      html = "\n" + indentChar + indent(html, indentChar);
    }
    s += html;
  } else if (
    propChildren != null &&
    getChildren((children = []), propChildren).length
  ) {
    let hasLarge = pretty && !!~s.indexOf("\n");
    let lastWasText = false;

    for (let i = 0; i < children.length; i++) {
      let child = children[i];

      if (child != null && child !== false) {
        let childSvgMode =
            nodeName === "svg"
              ? true
              : nodeName === "foreignObject"
              ? false
              : isSvgMode,
          ret = _renderToString(
            child,
            opts,
            opts.shallowHighOrder !== false,
            childSvgMode,
            selectValue
          );

        if (pretty && !hasLarge && isLargeString(ret)) hasLarge = true;

        // Skip if we received an empty string
        if (ret) {
          if (pretty) {
            let isText = ret.length > 0 && ret[0] != "<";

            // We merge adjacent text nodes, otherwise each piece would be printed
            // on a new line.
            if (lastWasText && isText) {
              pieces[pieces.length - 1] += ret;
            } else {
              pieces.push(ret);
            }

            lastWasText = isText;
          } else {
            pieces.push(ret);
          }
        }
      }
    }
    if (pretty && hasLarge) {
      for (let i = pieces.length; i--; ) {
        pieces[i] = "\n" + indentChar + indent(pieces[i], indentChar);
      }
    }
  }

  if (pieces.length || html) {
    s += pieces.join("");
  } else if (opts && opts.xml) {
    return s.substring(0, s.length - 1) + " />";
  }

  if (isVoid && !children && !html) {
    s = s.replace(/>$/, " />");
  } else {
    if (pretty && ~s.indexOf("\n")) s += "\n";
    s += `</${nodeName}>`;
  }

  return s;
}

function getComponentName(component: any) {
  return (
    component.displayName ||
    (component !== Function && component.name) ||
    getFallbackComponentName(component)
  );
}

function getFallbackComponentName(component: any) {
  let str = Function.prototype.toString.call(component),
    name = (str.match(/^\s*function\s+([^( ]+)/) || "")[1];
  if (!name) {
    // search for an existing indexed name for the given component:
    let index = -1;
    for (let i = UNNAMED.length; i--; ) {
      if (UNNAMED[i] === component) {
        index = i;
        break;
      }
    }
    // not found, create a new indexed name:
    if (index < 0) {
      index = UNNAMED.push(component) - 1;
    }
    name = `UnnamedComponent${index}`;
  }
  return name;
}

export default renderToString;

export { renderToString, shallowRender };
