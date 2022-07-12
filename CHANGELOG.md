# Unreleased

- Fix #62: ensure that a child component's `mount` lifecycle method is only
  called after its parent has completely finished rendering.
- Fix #50: Components that returned a fragment saw their `mount` lifecycle
  method called after the first child element had been created instead of after
  the render had completed. 

# 3.1.1
- Fix: components that changed their root HTML tag were erroneously unmounted

# 3.0.2
- Fix: component teardown left old DOM elements in memory (#47)

# 3.0.0

- Feature: Allow the user to manually add DOM elements to a rendered component without modifying or removing them. This allows e.g., using charting libraries with Forgo. (#42)
- Fix: allow components & elements to receive falsey `key`s (`0`, `false`, `null`) (#45)
