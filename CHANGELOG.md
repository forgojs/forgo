# Unreleased

- Fix #62: ensure that a child component's `mount()` lifecycle method is only called after its parent has completely finished rendering

# 3.0.0

- Allow the user to manually add DOM elements to a rendered component without modifying or removing them. This allows e.g., using charting libraries with Forgo. (#42)
- Fix: allow components & elements to receive falsey `key`s (`0`, `false`, `null`) (#45)
