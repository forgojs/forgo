# 3.2.2
- Fix #76: Add support for TypeScript 4.8

# 3.2.1

- Feature #73: Add a function to unmount a component tree from outside the Forgo
- Fix #50: Components that returned a fragment saw their `mount` lifecycle
  method called after the first child element had been created instead of after
  the render had completed. 
- Fix #70: Calling `component.update()` during a mount lifecycle handler
  resulted in the component recursively mounting ad infinitum.
- Fix #75: ESLint plugin `eslint-plugin-import` could not resolve imports of Forgo
- Add TSX support for custom element tag names. Non-string attributes are not
  yet supported

# 3.2.0

- #59: Forgo's legacy component syntax (component syntax used through v3.1.1, also called simple component syntax)
  has been deprecated, and will be removed in v4.0. For more details, please see
  the deprecation notice on https://forgojs.org.
- Fix #62: ensure that a child component's `mount()` lifecycle method is only
  called after its parent has completely finished rendering
- Feature: Allow components to return `null` or `undefined` from their
  `render()` method (#39)

# 3.1.1

- Fix: components that changed their root HTML tag were erroneously unmounted

# 3.0.2

- Fix: component teardown left old DOM elements in memory (#47)

# 3.0.0

- Feature: Allow the user to manually add DOM elements to a rendered component without modifying or removing them. This allows e.g., using charting libraries with Forgo. (#42)
- Fix: allow components & elements to receive falsey `key`s (`0`, `false`, `null`) (#45)
