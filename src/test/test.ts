import mount from "./mount/index.js";
import boundary from "./boundary/index.js";
import passProps from "./passProps/index.js";
import elementRef from "./elementRef/index.js";
import rerender from "./rerender/index.js";
import hydrate from "./hydrate/index.js";
import componentUnmount from "./componentUnmount/index.js";
import componentMount from "./componentMount/index.js";
import nodeState from "./nodeState/index.js";
import replaceByKey from "./replaceByKey/index.js";
import clearsOldProps from "./clearsOldProps/index.js";
import shouldUpdate from "./shouldUpdate/index.js";
import renderPrimitives from "./renderPrimitives/index.js";
import assertIsComponent from "./assertIsComponent/index.js";
import rendersArraysInChildren from "./rendersArraysInChildren/index.js";
import rerenderChild from "./rerenderChild/index.js";
import afterRender from "./afterRender/index.js";
import propsChanges from "./propsChanges/index.js";
import componentFragment from "./componentFragment/index.js";
import mountRunsOnceWhenRenderingFragment from "./mountRunsOnceWhenRenderingFragment/index.js";
import mountRunsOnceWhenChildRendersFragment from "./mountRunsOnceWhenChildRendersFragment/index.js";
import fragmentUnmountRunsOnce from "./fragmentUnmountRunsOnce/index.js";
import replacingFragmentWithNodeWontUnmount from "./replacingFragmentWithNodeWontUnmount/index.js";
import childWithFragmentUnmounts from "./childWithFragmentUnmounts/index.js";
import rerenderMayUnmountParents from "./rerenderMayUnmountParents/index.js";
import rerenderMayChangeRootNode from "./rerenderMayChangeRootNode/index.js";
import dangerouslySetInnerHTML from "./dangerouslySetInnerHTML/index.js";
import css from "./css/index.js";
import inheritedCustomElement from "./inheritedCustomElement/index.js";
import fragmentOverwriteDoesNotUnmount from "./fragmentOverwriteDoesNotUnmount/index.js";
import ctorArgs from "./ctorArgs/index.js";
import ssrSimple from "./ssr-simple/index.js";
import componentKeepsStateWhenReordered from "./componentKeepsStateWhenReordered/index.js";
import elementKeepsStateWhenReordered from "./elementKeepsStateWhenReordered/index.js";
import unmountsParentWhenNodeIsNull from "./unmountsParentWhenNodeIsNull/index.js";
import unmountsNonTopLevelParentWhenNodeIsNull from "./unmountsNonTopLevelParentWhenNodeIsNull/index.js";
import rerenderMayChangeRootNodeOnParents from "./rerenderMayChangeRootNodeOnParents/index.js";
import keyedFragmentsPreserveChildStates from "./keyedFragmentsPreserveChildStates/index.js";

mount();
boundary();
passProps();
elementRef();
rerender();
hydrate();
componentMount();
componentUnmount();
nodeState();
replaceByKey();
clearsOldProps();
shouldUpdate();
renderPrimitives();
assertIsComponent();
rendersArraysInChildren();
rerenderChild();
afterRender();
propsChanges();
componentFragment();
mountRunsOnceWhenRenderingFragment();
mountRunsOnceWhenChildRendersFragment();
fragmentUnmountRunsOnce();
replacingFragmentWithNodeWontUnmount();
childWithFragmentUnmounts();
rerenderMayUnmountParents();
rerenderMayChangeRootNode();
rerenderMayChangeRootNodeOnParents();
dangerouslySetInnerHTML();
css();
inheritedCustomElement();
fragmentOverwriteDoesNotUnmount();
ctorArgs();
ssrSimple();
componentKeepsStateWhenReordered();
elementKeepsStateWhenReordered();
unmountsParentWhenNodeIsNull();
unmountsNonTopLevelParentWhenNodeIsNull();
keyedFragmentsPreserveChildStates();
