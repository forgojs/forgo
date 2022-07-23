# Unreleased
The legacy component syntax has been deprecated, and will be removed in v4.0.
For more details, please see the deprecation notice on https://forgojs.org.

# 3.1.1
- Fix: components that changed their root HTML tag were erroneously unmounted

# 3.0.2
- Fix: component teardown left old DOM elements in memory (#47)

# 3.0.0

- Feature: Allow the user to manually add DOM elements to a rendered component without modifying or removing them. This allows e.g., using charting libraries with Forgo. (#42)
- Fix: allow components & elements to receive falsey `key`s (`0`, `false`, `null`) (#45)
