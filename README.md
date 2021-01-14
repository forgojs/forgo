# forgo

Forgo is a 4KB library that makes it super easy to create modern web apps using JSX (like React). 


Unlike React, apps are plain JS with very little framework specific code. Everything you already know about DOM APIs and JavaScript will easily carry over.

- Use HTML DOM APIs for accessing elements
- There are no synthetic events, use standard DOM APIs
- Use closures for maintaining component state
- Use any singleton pattern for managing app-wide state
- There's no vDOM, DOM diffing etc. Renders are manually triggered.

Forgo is basically just one small JS file (actually TypeScript). It's somewhat decently documented, but I could use some help here. A stated goal of the project is to always remain within that single file. 

## Installation

```
npm i forgo
```

## A Forgo Component

A Forgo Component is a function that returns an object with a render() function. The render function is called for the first render, and then subsequently for each rerender.

```tsx
import { rerender } from "forgo";

function SimpleTimer() {
  let seconds = 0; // Look ma no useState

  return {
    render(props, args) {
      setTimeout(() => {
        seconds++;
        rerender(args.element); // rerender!
      }, 1000);

      return <div>{seconds} secs have elapsed...</div>;
    },
  };
}
```

## Mounting the Component

Use the mount() function once your document has loaded.

```js
import { mount } from "forgo";

window.addEventListener("load", () => {
  mount(<SimpleTimer />, document.getElementById("root"));
});
```

## Building

Forgo uses the latest JSX createElement factory changes, so you might need to enable this with Babel. More details here: https://babeljs.io/docs/en/babel-plugin-transform-react-jsx

For your babel config:

```json
{
  "plugins": [
    [
      "@babel/plugin-transform-react-jsx",
      {
        "throwIfNamespace": false,
        "runtime": "automatic",
        "importSource": "forgo"
      }
    ]
  ]
}
```

If you're using TypeScript, add the following lines to your tsconfig.json file.

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "forgo"
  },
}
```