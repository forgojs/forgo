# forgo

Forgo is a 4KB library that makes it super easy to create modern web apps using JSX (like React).

Unlike React, there are very few framework specific patterns and lingo to learn. Everything you already know about DOM APIs and JavaScript will easily carry over.

- Use HTML DOM APIs for accessing elements
- There are no synthetic events
- Use closures for maintaining component state
- There's no vDOM or DOM diffing
- Renders are manually triggered

## We'll be tiny. Always.

All of Forgo is in one small JS file (actually it's TypeScript). It is a goal of the project is to remain within that single file.

## Installation

```
npm i forgo
```

An easy way to get a project started is by cloning one of the following templates. These templates use parcel as the bundler/build tool.

- [Starter-kit using JavaScript](https://github.com/forgojs/forgo-template-javascript)
- [Starter-kit using TypeScript](https://github.com/forgojs/forgo-template-typescript)

## A Forgo Component

A Forgo Component must have a function (called Component Constructor) that returns an object with a render() function (called Component). 

Here's an Example.

```tsx
import { rerender } from "forgo";

function SimpleTimer(initialProps) {
  let seconds = 0; // Just a regular variable, no hooks!

  return {
    render(props, args) {
      setTimeout(() => {
        seconds++;
        rerender(args.element); // rerender
      }, 1000);

      return <div>{seconds} seconds have elapsed... {props.firstName}!</div>;
    },
  };
}
```

The Component Constructor function and the Component's render() method are both called during the first render with the initial set of props. But for subsequent rerenders of the same component, only the render() gets called (with new props). So if you're using props, remember to get it from the render() method.

## Mounting the Component

Use the mount() function once your document has loaded.

```js
import { mount } from "forgo";

window.addEventListener("load", () => {
  mount(<SimpleTimer />, document.getElementById("root"));
});
```

You could also pass a selector instead of an element.

```js
window.addEventListener("load", () => {
  mount(<SimpleTimer />, "#root");
});
```

## Child Components and Passing Props

That works just as you'd have seen in React.

```jsx
function Parent(initialProps) {
  return {
    render(props, args) {
      return (
        <div>
          <Greeter firstName="Jeswin" />
          <Greeter firstName="Kai" />
        </div>
      );
    },
  };
}

function Greeter(initialProps) {
  return {
    render(props, args) {
      return <div>Hello {props.firstName}</div>;
    },
  };
}
```

## Reading Form Input Elements

To access the actual DOM elements corresponding to your markup (and the values contained within them), you need to use the ref attribute in the markup. An object referenced by the ref attribute in an element's markup will have its 'value' property set to the actual DOM element when it gets created.

Here's an example:

```jsx
function Component(initialProps) {
  const myInputRef = {};

  return {
    render(props, args) {
      function onClick() {
        const inputElement = myInputRef.value;
        alert(inputElement.value); // Read the text input.
      }

      return (
        <div>
          <input type="text" ref={myInputRef} />
          <button onclick={onClick}>Click me!</button>
        </div>
      );
    },
  };
}
```

You can access and read form input elements using regular DOM APIs as well. For example, the following code will work just fine if you assign an id to the input element.

```jsx
function onClick() {
  const inputElement = document.getElementById("myinput");
  alert(inputElement.value);
}
```

Lastly, you can pass an event handler to an input and extract the current value from the input event:

```jsx
function Component(initialProps) {
  const myInputRef = {};

  return {
    render(props, args) {
      function onInput(e) {
        e.preventDefault();
        alert(e.target.value);
      }

      return (
        <div>
          <input type="text" oninput={onInput} />
        </div>
      );
    },
  };
}
```

## Component Unmount

When a component is unmounted, Forgo will invoke the unmount() function if defined for a component. It receives the current props and args as arguments, just as in the render() function.

```jsx
function Greeter(initialProps) {
  return {
    render(props, args) {
      return <div>Hello {props.firstName}</div>;
    },
    unmount(props, args) {
      console.log("Got unloaded.");
    },
  };
}
```

## Component mount

You'd rarely have to use this. mount() gets called with the same arguments as render () but after getting mounted on a real DOM node. At this point you can expect args.element.node to be populated, where args is the second parameter to mount() and render().

```jsx
function Greeter(initialProps) {
  return {
    render(props, args) {
      return <div id="hello">Hello {props.firstName}</div>;
    },
    mount(props, args) {
      console.log(`Mounted on node with id ${args.element.node.id}`);
    },
  };
}
```

## Bailing out of a render

When the shouldUpdate() function is defined for a component, Forgo will call it with newProps and oldProps and check if the return value is true before rendering the component. Returning false will skip rendering the component.

```jsx
function Greeter(initialProps) {
  return {
    render(props, args) {
      return <div>Hello {props.firstName}</div>;
    },
    shouldUpdate(newProps, oldProps) {
      return newProps.firstName !== oldProps.firstName;
    },
  };
}
```

## Error handling

By defining the error() function, Forgo lets you catch errors in child components (at any level, and not necessarily immediate children).

```jsx
// Here's a component which throws an error.
function BadComponent() {
  return {
    render() {
      throw new Error("Some error occurred :(");
    },
  };
}

// Parent can catch the error by defining the error() function.
function Parent(initialProps) {
  return {
    render() {
      return (
        <div>
          <BadComponent />
        </div>
      );
    },
    error(props, args) {
      return (
        <p>
          Error in {props.name}: {args.error.message}
        </p>
      );
    },
  };
}
```

## Additional Rerender options

The most straight forward way to do rerender is by invoking it with `args.element` as the only argument - as follows.

```tsx
function TodoList(initialProps) {
  let todos = [];

  return {
    render(props, args) {
      function addTodos(text) {
        todos.push(text);
        rerender(args.element);
      }

      return <div>markup goes here...</div>;
    },
  };
}
```

But there are a couple of handy options to rerender, 'newProps' and 'forceRerender'.

newProps let you pass a new set of props while rerendering. If you'd like previous props to be used, pass undefined here.

forceRerender defaults to true, but when set to false skips child component rendering if props haven't changed.

```js
const newProps = { name: "Kai" };
const forceRerender = false;
rerender(args.element, newProps, forceRerender);
```

## Rendering without mounting

Forgo also exports a render method that returns the rendered DOM node that could then be manually mounted.

```tsx
const { node } = render(<Component />);

window.addEventListener("load", () => {
  document.getElementById("root")!.firstElementChild!.replaceWith(node);
});
```

## Routing

Forgo Router (forgo-router) is a tiny router for Forgo, and is just around 1KB gzipped. https://github.com/forgojs/forgo-router

## Application State Management

Forgo State (forgo-state) is an easy-to-use application state management solution for Forgo (like Redux or MobX), and is less than 1KB gzipped. https://github.com/forgojs/forgo-state

## Try it out on CodeSandbox

You can try the [Todo List app with Forgo](https://codesandbox.io/s/forgo-todos-javascript-1oi9b) on CodeSandbox.

Or if you prefer Typescript, try [Forgo TodoList in TypeScript](https://codesandbox.io/s/forgo-todos-typescript-9v0iy).

There is also an example for using [Forgo with forgo-router](https://codesandbox.io/s/forgo-router-typescript-px4sg).

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
  }
}
```

## Getting Help

You can reach out to me via twitter or email. If you find issues, please file a bug on [Github](https://github.com/forgojs/forgo/issues).
