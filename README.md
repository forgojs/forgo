# forgo

Forgo is a 4KB library that makes it super easy to create modern web apps using JSX (like React).

Unlike React, there are very few framework specific patterns and lingo to learn. Everything you already know about DOM APIs and JavaScript will easily carry over.

- Use HTML DOM APIs for accessing elements
- There are no synthetic events
- Use closures for maintaining component state
- There's no vDOM or DOM diffing
- Renders are manually triggered

## We'll be tiny. Always.

All of Forgo is in one small JS file (actually it's TypeScript). It is a goal of the project to remain within that single file.

## Installation

```
npm i forgo
```

### Starting a Forgo project

The easiest way to get started is with the 'create-forgo-app' utility. This relies on git, so you should have git installed on your machine.

```sh
npx create-forgo-app my-project
```

It supports TypeScript too:

```sh
npx create-forgo-app my-project --template typescript
```

And then to run it:

```sh
# switch to the project directory
cd my-project

# run!
npm start

# To make a production build
npm run build
```

## A Forgo Component

A Forgo Component must have a function (called Component Constructor) that returns an object with a render() function (called Component).

Here's an Example.

```jsx
import { rerender } from "forgo";

function SimpleTimer(initialProps) {
  let seconds = 0; // Just a regular variable, no hooks!

  return {
    render(props, args) {
      setTimeout(() => {
        seconds++;
        rerender(args.element); // rerender
      }, 1000);

      return (
        <div>
          {seconds} seconds have elapsed... {props.firstName}!
        </div>
      );
    },
  };
}
```

The Component Constructor function and the Component's render() method are both called during the first render with the initial set of props. But for subsequent rerenders of the same component, only the render() gets called (with new props). So if you're using props, remember to get it from the render() method.

## Mounting the Component

Use the mount() function once your document has loaded.

```js
import { mount } from "forgo";

function ready(fn) {
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

ready(() => {
  mount(<App />, document.getElementById("root"));
});
```

You could also pass a selector instead of an element to the mount() function.

```js
ready(() => {
  mount(<App />, "#root");
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

## Lists and Keys

Keys help Forgo identify which items in a list have changed, are added, or are removed. While Forgo works well without keys, it is a good idea to add them since it avoids unnecessary component mounting and unmounting in some cases.

As long as they are unique, there is no restriction on what data type you may use for the key; keys could be strings, numbers or even objects. For string keys and numeric keys, Forgo compares them by value; while for object keys, a reference equality check is used.

```jsx
function Parent() {
  return {
    render(props, args) {
      const people = [
        { firstName: "jeswin", id: 1 },
        { firstName: "kai", id: 2 },
      ];
      return (
        <div>
          {people.map((item) => (
            <Child key={item.id} firstName={item.firstName} />
          ))}
        </div>
      );
    },
  };
}

function Child(initialProps) {
  return {
    render(props) {
      return <div>Hello {props.firstName}</div>;
    },
  };
}
```

## Fetching data asynchronously

Parts of your application might need to fetch data asynchronously, and refresh your component accordingly.

Here's an example of how to do this:

```jsx
async function getMessages() {
  const data = await fetchMessagesFromServer();
  return data;
}

export function InboxComponent(initialProps) {
  // This will be empty initially.
  let messages = undefined;

  return {
    render(props, args) {
      // Messages are empty. Let's fetch them.
      if (!messages) {
        getMessages().then((data) => {
          messages = data.messages;
          rerender(args.element);
        });
        return <p>Loading data...</p>;
      }

      // We have messages to show.
      return (
        <div>
          <header>Your Inbox</header>
          <ul>
            {messages.map((message) => (
              <li>{message}</li>
            ))}
          </ul>
        </div>
      );
    },
  };
}
```

## The Unmount Event

When a component is unmounted, Forgo will invoke the unmount() function if defined for a component. It receives the current props and args as arguments, just as in the render() function. This can be used for any tear down you might want to do.

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

## The Mount Event

If you're an application developer, you'd rarely have to use this. It might however be useful if you're developing libraries or frameworks which use Forgo. mount() gets called with the same arguments as render(), but after getting mounted on a real DOM node. It gets called only once.

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

## The AfterRender Event

Again, if you're an application developer you'd rarely need to use this. The afterRender() event runs every time after the render() runs, but after the rendered elements have been attached to actual DOM nodes. The 'previousNode' property of args will give you the node to which the component was previously attached, if it has changed due to the render().

```jsx
function Greeter(initialProps) {
  return {
    render(props, args) {
      return <div id="hello">Hello {props.firstName}</div>;
    },
    afterRender(props, args) {
      console.log(
        `This component is mounted on ${args.element.node.id}, and previously to ${args.previousNode.id}`
      );
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

```jsx
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

But you could pass newProps as well while rerendering. If you'd like previous props to be used, pass undefined here.

```js
const newProps = { name: "Kai" };
rerender(args.element, newProps);
```

There's also a convenient shortcut for rerendering - the update() function available on the args parameter of `render(props, args)`. Calling args.update() is the same as calling `rerender(args.element)`.

Here's an example:

```jsx
function TodoList(initialProps) {
  let todos = [];

  return {
    render(props, { update }) {
      function addTodos(text) {
        todos.push(text);
        update(); // => rerender(args.element)
      }
      return <div>markup goes here...</div>;
    },
  };
}
```

## Rendering without mounting

Forgo also exports a render method that returns the rendered DOM node that could then be manually mounted.

```jsx
import { render } from "forgo";

const { node } = render(<Component />);

window.addEventListener("load", () => {
  document.getElementById("root")!.firstElementChild!.replaceWith(node);
});
```

## Routing

Forgo Router (forgo-router) is a tiny router for Forgo, and is just around 1KB gzipped. Read more at https://github.com/forgojs/forgo-router

Here's an example:

```js
import { Router, Link, matchExactUrl, matchUrl } from "forgo-router";

function App() {
  return {
    render() {
      return (
        <Router>
          <Link href="/">Go to Home Page</Link>
          {matchExactUrl("/", () => <Home />) ||
            matchUrl("/customers", () => <Customers />) ||
            matchUrl("/about", () => <AboutPage />)}
        </Router>
      );
    },
  };
}
```

## Application State Management

Forgo State (forgo-state) is an easy-to-use application state management solution for Forgo (like Redux or MobX), and is less than 1KB gzipped. Read more at https://github.com/forgojs/forgo-state

Here's an example:

```js
import { bindToStates, defineState } from "forgo-state";

// Define one (or more) application state containers.
const mailboxState = defineState({
  messages: [],
  drafts: [],
  spam: [],
  unread: 0,
});

// A Forgo component
function MailboxView() {
  const component = {
    render(props: any, args: ForgoRenderArgs) {
      return (
        <div>
          {mailboxState.messages.length ? (
            mailboxState.messages.map((m) => <p>{m}</p>)
          ) : (
            <p>There are no messages for {signinState.username}.</p>
          )}
        </div>
      );
    },
  };
  // MailboxView must change whenever mailboxState changes.
  return bindToStates([mailboxState], component);
}

async function updateInbox() {
  const data = await fetchInboxData();
  // The next line causes a rerender of the MailboxView component
  mailboxState.messages = data;
}
```

## Lazy Loading

You can achieve lazy loading with the forgo-lazy package. Read more at https://github.com/jacob-ebey/forgo-lazy

It's as simple as this:

```jsx
import lazy, { Suspense } from "forgo-lazy";

const LazyComponent = lazy(() => import("./lazy-component"));

const App = () => ({
  render: () => (
    <Suspense fallback={() => "Loading..."}>
      <LazyComponent title="It's that easy :D" />
    </Suspense>
  ),
});
```

## Integrating Forgo into an existing app

Forgo is quite easy to integrate into an existing web app written with other frameworks or with older libraries like jQuery.

To help with that, the forgo-powertoys library (less than 1KB in size) exposes a rerenderElement() function which can rerender a mounted Forgo component with just a CSS selector (from outside the Forgo app). Read more at https://github.com/forgojs/forgo-powertoys

Here's an example:

```js
import { rerenderElement } from "forgo-powertoys";

// A forgo component.
function LiveScores() {
  return {
    render(props) {
      return <p id="live-scores">Top score is {props.topscore}</p>;
    },
  };
}

//mount it on a DOM node as usual
window.addEventListener("load", () => {
  mount(<SimpleTimer />, document.getElementById("root"));
});

// Now you can rerender the component from anywhere, anytime!
rerenderElement("#live-scores", { topscore: 244 });
```

## Server-side Rendering (SSR)

You can render components to an html (string) with the forgo-ssr package. This allows you to prerender components on the server and will work with Node.JS servers like Koa, Express etc. Read more at https://github.com/forgojs/forgo-ssr

Here's an example:

```js
import render from "forgo-ssr";

// A forgo component.
function MyComponent() {
  return {
    render() {
      return <div>Hello world</div>;
    },
  };
}

// Get the html (string) and serve it via koa, express etc.
const html = render(<MyComponent />);
```

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
