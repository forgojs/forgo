# forgo

Forgo is a 4KB library that makes it super easy to create modern web apps using JSX (like React).

Unlike React, there are very few framework specific patterns and lingo to learn. Everything you already know about DOM APIs and JavaScript will easily carry over.

- Use HTML DOM APIs for accessing elements
- There are no synthetic events
- Use closures and ordinary variables for maintaining component state
- There's no vDOM or DOM diffing
- Renders are manually triggered
- Declarative DOM updates

## We'll be tiny. Always.

All of Forgo's code is in one single TypeScript file. It is a goal of the project to remain within that single file.

## Installation

```
npm install forgo
```

## Starting a Forgo project

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
# Switch to the project directory
cd my-project

# Run!
npm start

# To make a production build
npm run build
```

## A Forgo Component

Forgo components are functions that return a Component instance, which has a
`render()` method that returns JSX. Components hold their state using ordinary
variables held in the closure scope of the function (called a Component Constructor).

Forgo likes to keep things simple and explicit. It avoids automatic behavior,
prefers basic functions and variables instead of implicit constructs, and tries
not to come between you and the DOM.

Here's the smallest Forgo component you can make:

```jsx
import * as forgo from "forgo";

const HelloWorld = () => {
  return new forgo.Component({
    render() {
      return <p>Hello, world!</p>;
    }
  });
};
```

When a component is created (either by being mounted onto the DOM when the page
loads, or because it was rendered by a component higher up in your app), Forgo
calls the Component Constructor to generate the component instance. This is
where you can put closure variables to hold the component's state.

Then Forgo calls the component's `render()` method to generate the HTML that
Forgo will show on the page.

After the component's first render, the Constructor won't be called again, but
the `render()` method will be called each time the component (or one of its
ancestors) rerenders.

Forgo will pass any props (i.e., HTML attributes from your JSX) to both the
Constructor and the `render()` method.

Here's a bigger example - the component below increments a counter when a button is
pressed, and counts how many seconds the component has been alive.

```jsx
import * as forgo from "forgo";

const ClickCounter = (initialProps) => {
  let seconds = 0; // Just a regular variable, no hooks!
  let clickCounter = 0;

  const component = new forgo.Component({
    // Every component has a render() method, which declares what HTML Forgo
    // needs to generate.
    render(props) {
      const { firstName } = props;
      // You can declare any DOM event handlers you need inside the render()
      // method.
      const onclick = (_event: Event) => {
        // Forgo doesn't know or care how you manage your state. This frees you
        // to use any library or code pattern that suits your situation, not
        // only tools designed to integrate with the framework.
        clickCounter += 1;
        // When you're ready to rerender, just call component.update(). Manual
        // updates mean the framework only does what you tell it to, putting you
        // in control of efficiency and business logic.
        //
        // An optional package, forgo-state, can automate this for simple scenarios.
        component.update();
      };

      // Forgo uses JSX, like React or Solid, to generate HTML declaratively.
      // JSX is a special syntax for JavaScript, which means you can treat it
      // like ordinary code (assign it to variables, type check it, etc.).
      return (
        <div>
          <p>Hello, {firstName}!</p>
          <button type="button" onclick={onclick}>
            The button has been clicked {clickCounter} times in {seconds} seconds
          </button>
        </div>
      );
    }
  });

  // You can add callbacks to react to lifecycle events,
  // like mounting and unmounting
  component.mount(() => {
    const timeout = setTimeout(() => {
      seconds++;
      component.update();
    }, 1000);
    component.unmount(() => clearTimeout(timeout));
  });

  return component;
};
```

Here's how the API looks when using TypeScript (which is optional):

```tsx
import * as forgo from "forgo";

// The constructor generic type accepts the shape of your component's props
const HelloWorld = () => {
  return new forgo.Component({
    render({ name }) {
      return <p>Hello, {name}!</p>;
    }
  });
};
```

If you assign the component to a variable (such as when adding lifecycle event
handlers), you'll need to annotate the generic types on both the constructor and
the component. 

Generic props can also be used:

```tsx
import * as forgo from "forgo";

// Props have to be assigned to the initial props for TSX to recognize the generic
type ListProps<T extends string | number> = {
  data: T[];
};

const List = <T extends string | number>(initial: ListProps<T>) =>
  new forgo.Component<ListProps<T>>({
    render(props) {
      return (
        <ul>
          {props.data.map((item) => (
            <li>{item}</li>
          ))}
        </ul>
      );
    },
  });

const App = () =>
  new forgo.Component({
    render(props) {
      return <List data={[1, "2", 3]} />;
    },
  });
```

_If you're handy with TypeScript, [we'd love a PR to infer the types!](https://github.com/forgojs/forgo/issues/68)_

```tsx
import * as forgo from "forgo";

interface HelloWorldProps {
  name: string;
}
const HelloWorld = () => {
  const component = new forgo.Component<HelloWorldProps>({
    render({ name }) {
      return <p>Hello, {name}!</p>;
    }
  });

  component.mount(() => console.log("Mounted!"));

  return component;
};
```

## Launching your components when the page loads

Use the mount() function once your document has loaded.

```js
import { mount } from "forgo";

// Wait for the page DOM to be ready for changes
function ready(fn) {
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

ready(() => {
  // Attach your app's root component to a specific DOM element
  mount(<App />, document.getElementById("root"));
});
```

Instead of retrieving the DOM element yoursely, you could pass a CSS selector
and Forgo will find the element for you:

```js
ready(() => {
  mount(<App />, "#root");
});
```

## Child Components and Passing Props

Props and children work just like in React and similar frameworks:

```jsx
// Component Constructors will receive the props passed the *first* time the
// component renders. But beware! This value won't be updated on later renders.
// Props passod to the Constructor are useful for one-time setup, but to read
// the latest props you'll need to use the value passed to render().
const Parent = (_initialProps) => {
  return new forgo.Component({
    // The props passed here will always be up-to-date.
    //
    // All lifecycle methods (render, mount, etc.) receive a reference to the
    // component. This makes it easy to create reusable logic that works for
    // many different components.
    render(_props, _component) {
      return (
        <div>
          <Greeter firstName="Jeswin" />
          <Greeter firstName="Kai" />
        </div>
      );
    }
  });
};

const Greeter = (_initialProps) => {
  return new forgo.Component({
    render(props, _component) {
      return <div>Hello {props.firstName}</div>;
    }
  });
};
```

You can pass any kind of value as a prop - not just strings! You just have to
use curly braces instead of quotes:

```jsx
const MyComponent = () => {
  return new forgo.Component({
    render(_props) {
      return <NumberComponent myNumber={2} />;
    }
  });
};
```

You can have one component wrap JSX provided by another. To do this, just render `props.children`.

```jsx
const Parent = () => {
  return new forgo.Component({
    render(_props) {
      return
        <Child>
          <p>Hello, world!</p>
        </Child>
      )
    }
  });
}

const Child = () => {
  return new forgo.Component({
    render(props) {
      return (
        <div>
          <p>Here's what the parent told us to render:</p>
          {props.children}
        </div>
      )
    }
  });
}
```

## Reading Form Input Elements

Forgo encourages you to use the vanilla DOM API when you need to read form field
values, by directly accessing the DOM elements in the form.

To access the actual DOM elements corresponding to your markup (and the values
contained within them), you need to use the `ref` attribute in the JSX markup of
the element you want to reference. An element referenced by the `ref` attribute
will have its 'value' property set to the actual DOM element when it gets
created.

Here's an example:

```jsx
const MyComponent = (_initialProps) => {
  // This starts as an empty object. After the element is created, this object
  // will have a `value` field holding the element.
  const myInputRef = {};

  return new forgo.Component({
    render(_props, _component) {
      const onClick = () => {
        const inputElement = myInputRef.value;
        alert(inputElement.value); // Read the text input.
      };

      return (
        <div>
          <input type="text" ref={myInputRef} />
          <button type="button" onclick={onClick}>Click me!</button>
        </div>
      );
    }
  });
};
```

If you want, you can bypass Forgo entirely when reading form field values. If
you set the `id` field on the form field, then you could use the vanilla DOM API
to access that element directly:

```jsx
const onClick = () => {
  const inputElement = document.getElementById("my-input");
  alert(inputElement.value);
};
```

Lastly, DOM events like key presses and clicks pass the affected element to the
event handler as `event.target`:

```jsx
const Component = (_initialProps) => {
  return new forgo.Component({
    render(_props, _component) {
      const onInput = (event) => {
        alert(event.target.value);
      };

      return (
        <div>
          <input type="text" oninput={onInput} />
        </div>
      );
    }
  });
};
```

## Rendering Lists and using Keys

Forgo will render any arrays it sees in the JSX. To create a list of elements,
just use the array's `myArray.map()` method to generate JSX for each item in the array.

Each item in the array may be given a `key` attribute. Keys help Forgo identify
which items in a list have changed, are added, or are removed. While Forgo works
well without keys, it is a good idea to add them since it lets Forgo be more
efficient by only mounting or unmounting components that actually need it.

You can use any data type for a key strings, numbers or even objects. The key
values only need to be unique. Forgo compares keys using `===` (reference
equality), so be careful when using mutable objects as keys.

When looping over an array, don't use the array index as a key - keys should be
something tied to the specific value being rendered (like a permanent ID field).
The same array index might be associated with different values if you reorder
the array, and so using the array index as a key will cause unexpected behavior.

```jsx
const Parent = () => {
  return new forgo.Component({
    render(_props, _component) {
      const people = [
        { firstName: "jeswin", id: 123 },
        { firstName: "kai", id: 456 },
      ];
      return (
        <div>
          {people.map((item) => (
            <Child key={item.id} firstName={item.firstName} />
          ))}
        </div>
      );
    }
  });
};

const Child = (initialProps) => {
  return new forgo.Component({
    render(props) {
      return <div>Hello {props.firstName}</div>;
    },
  });
};
```

## Fetching data asynchronously

Your component might need to load data asynchronously (such as making a network
request). Here's how to do that:

```jsx
export const InboxComponent = (_initialProps) => {
  // This will be empty at first, and will get filled in sometime after the
  // component first mounts.
  let messages = undefined;

  const component = new forgo.Component({
    render(_props, _component) {
      // Messages are empty. Let's fetch them.
      if (!messages) {
        return <p>Loading data...</p>;
      }

      // After messages are fetched, the component will rerender and now we can
      // show the data.
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
    }
  });

  component.mount(async () => {
    messages = await fetchMessagesFromServer();
    component.update();
  });

  return component;
};
```

## The Mount Event

The mount event is fired just once per component, when the component has just
been created. This is useful for set-up logic like starting a timer, fetching
data, or opening a WebSocket.

You can register multiple mount callbacks, which is useful if you want to have
reusable logic that you apply to a number of components.

```jsx
const Greeter = (_initialProps) => {
  const component = new forgo.Component({
    render(_props, _component) {
      return <div id="hello">Hello {props.firstName}</div>;
    }
  });

  component.mount((_props, _component) => {
    console.log("The component has been mounted.");
  });

  return component;
};
```

## The Unmount Event

A component is unmounted when your app no longer renders it (such as when a
parent component chooses to display something different, or when an item is
removed from a list you're rendering).

When a component is unmounted, you might want to do tear-down, like canceling a
timer or closing a WebSocket. To do this, you can register unmount callbacks
on your component, which will be called when the component is unmounted.

The callbacks are passed the current props and the component instance, just like
the `render()` method.

```jsx
const Greeter = (_initialProps) => {
  const component = new forgo.Component({
    render(props, _component) {
      return <div>Hello {props.firstName}</div>;
    }
  });

  component.unmount((props, _component) => {
    console.log("The component has been unloaded.");
  });

  return component;
};
```

## Skipping renders

Sometimes you have a reason why a component shouldn't be rendered right now. For
example, if you're using immutable data structures, you may want to only
rerender if the data structure has changed.

Forgo components accept `shouldUpdate` callbacks, which return true/false to
signal whether the component should / should not be rerendered. If any
`shouldUpdate` callbacks return true, the component will be rerendered. If they
all return false (or if none are registered), the component's `render()` method
won't be called, skipping all DOM operations for the component and its
decendants.

The callbacks receive the new props for the proposed render, and the old props
used in the last render.

Using `shouldUpdate` is completely optional, and typically isn't necessary.

```jsx
const Greeter = (_initialProps) => {
  const component = new forgo.Component({
    render(props, component) {
      return <div>Hello {props.firstName}</div>;
    }
  });

  component.shouldUpdate((newProps, oldProps) => {
    return newProps.firstName !== oldProps.firstName;
  });

  return component;
}
```

## Error handling

Forgo lets components define an `error()` method, which is run any time the
component (or any of its decendants) throws an exception while running the
component's `render()` method. The error method can return JSX that is rendered
in place of the render output, to display an error message to the user.

If no ancestors have an `error()` method registered, the render will abort and
Forgo will print an error to the console.

```jsx
// Here's a component which throws an error.
const BadComponent = () => {
  return new forgo.Component({
    render() {
      throw new Error("Some error occurred :(");
    }
  });
}

// The first ancestor with an error() method defined will catch the error
const Parent = (initialProps) => {
  return new forgo.Component({
    render() {
      return (
        <div>
          <BadComponent />
        </div>
      );
    },
    error(props, error, _component) {
      return (
        <p>
          Error in {props.name}: {error.message}
        </p>
      );
    }
  });
}
```

## The AfterRender Event

If you're an application developer you'll rarely need to use this - it's
provided for building libraries that wrap Forgo.

The `afterRender` event runs after `render()` has been called and the rendered
elements have been created in the DOM. The callback is passed the previous DOM
element the component was attached to, if it changed in the latest render.

```jsx
const Greeter = (_initialProps) => {
  const component = new forgo.Component({
    render(props, component) {
      return <div id="hello">Hello {props.firstName}</div>;
    }
  });

  component.afterRender((_props, previousNode, _component) => {
    console.log(
      `This component is mounted on ${component.__internal.element.node.id}, and was previously mounted on ${previousNode.id}`
    );
  });

  return component;
};
```

## Passing new props when rerendering

The most straight forward way to do rerender is by invoking it with `component.update()`, as follows:

```jsx
const TodoList = (initialProps) => {
  let todos = [];

  return new forgo.Component({
    render(props, component) {
      const addTodos = (text) => {
        todos.push(text);
        component.update();
      };
      return (
        <button type="button" onclick={addTodos}>
          Add a Todo
        </button>
      );
    }
  });
}
```

`component.update()` may optionally receive new props to use in the render.
Omitting the props parameter will rerender leave the props unchanged.

```js
const newProps = { name: "Kai" };
component.update(newProps);
```

## Rendering without mounting

Forgo also exports a render method that returns the rendered DOM node that could then be manually mounted.

```jsx
import { render } from "forgo";

const { node } = render(<Component />);

window.addEventListener("load", () => {
  document.getElementById("root").firstElementChild.replaceWith(node);
});
```

## Routing

Forgo offers an optional package (`forgo-router`) for handling client-side
navigation. Forgo Router is just around 1KB gzipped. Read more at
https://github.com/forgojs/forgo-router

Here's an example:

```jsx
import { Router, Link, matchExactUrl, matchUrl } from "forgo-router";

const App = () => {
  return new forgo.Component({
    render() {
      return (
        <Router>
          <Link href="/">Go to Home Page</Link>
          {matchExactUrl("/", () => <Home />) ||
            matchUrl("/customers", () => <Customers />) ||
            matchUrl("/about", () => <AboutPage />)}
        </Router>
      );
    }
  });
}
```

## Application State Management

Forgo offers an optional package (`forgo-state`) with an easy-to-use application
state management solution for Forgo. This solves a similar problem to Redux or
MobX. It's than 1KB gzipped. Read more at https://github.com/forgojs/forgo-state

Here's an example:

```jsx
import { bindToStates, defineState } from "forgo-state";

// Define one (or more) application state containers.
const mailboxState = defineState({
  username: "Bender B. Rodriguez",
  messages: [],
  drafts: [],
  spam: [],
  unread: 0
});

// A Forgo component that should react to state changes
const MailboxView = () => {
  const component = new forgo.Component({
    render() {
      if (mailboxState.messages.length > 0) {
        return (
          <div>
            {mailboxState.messages.map((m) => <p>{m}</p>)}
          </div>
        );
      }

      return (
        <div>
          <p>There are no messages for {mailboxState.username}.</p>
        </div>
      );
    }
  });

  component.mount(() => updateInbox());

  // MailboxView must change whenever mailboxState changes.
  //
  // Under the hood, this registers component.mount() and component.unmount()
  // even handlers
  bindToStates([mailboxState], component);
  return component;
}

async function updateInbox() {
  const data = await fetchInboxData();
  // The next line causes a rerender of the MailboxView component
  mailboxState.messages = data;
}
```

## Lazy Loading

If you want to lazy load a component, you can use the community-provided
`forgo-lazy` package. This is useful for code splitting, where you want the
initial page load to be quick (loading the smallest JS possible), and then load
in more components only when the user needs them. Read more at
https://github.com/jacob-ebey/forgo-lazy

It's works like this:

```jsx
import lazy, { Suspense } from "forgo-lazy";

const LazyComponent = lazy(() => import("./lazy-component"));

const App = () => {
  return new forgo.Component({
    render() {
      return (
        <Suspense fallback={() => "Loading..."}>
          <LazyComponent title="It's that easy :D" />
        </Suspense>
      );
    }
  });
}
```

## Integrating Forgo into an existing app

Forgo can be integrated into an existing web app written with other frameworks
(React, Vue, etc.), or with lower-level libraries like jQuery.

To help with that, the `forgo-powertoys` package (less than 1KB in size) exposes
a `rerenderElement()` function which can receive a CSS selector and rerender the
Forgo component associated with that element. This works from outside the Forgo
app, so you can drive Forgo components using your framework/library of choice.
Read more at https://github.com/forgojs/forgo-powertoys

Here's an example:

```jsx
import { rerenderElement } from "forgo-powertoys";

// A forgo component.
const LiveScores = () => {
  return new forgo.Component({
    render(props) {
      return <p id="live-scores">Top score is {props.topscore}</p>;
    }
  });
}

// Mount it on a DOM node usual
window.addEventListener("load", () => {
  mount(<SimpleTimer />, document.getElementById("root"));
});

// Now you can rerender the component from anywhere, anytime! Pass in the ID of
// the root element the component returns, as well as new props.
rerenderElement("#live-scores", { topscore: 244 });
```

## Server-side Rendering (SSR)

From Node.js you can render components to an HTML string with the `forgo-ssr`
package. This allows you to prerender components on the server, from server-side
frameworks like Koa, Express etc. Read more at
https://github.com/forgojs/forgo-ssr

Here's an example:

```jsx
import render from "forgo-ssr";

// A forgo component.
const MyComponent = () => {
  return new forgo.Component({
    render() {
      return <div>Hello world</div>;
    }
  });
}

// Get the html (string) and serve it via koa, express etc.
const html = render(<MyComponent />);
```

## Manually adding elements to the DOM

Forgo allows you to use the built-in browser DOM API to insert elements into the
DOM tree rendered by a Forgo component. Forgo will ignore these elements. This
is useful for working with charting libraries, such as D3.

If you add unmanaged nodes as siblings to nodes which Forgo manages, Forgo
pushes the unmanaged nodes towards the bottom of the sibling list when managed
nodes are added and removed. If you don't add/remove managed nodes, the
unmanaged nodes will stay in their original positions.

### ApexCharts example

[Code Sandbox](https://codesandbox.io/s/forgo-apexcharts-demo-ulkqfe?file=/src/index.tsx) for this example

```jsx
const App = () => {
  const chartElement = {};

  const component = new forgo.Component({
    render(_props, component) {
      const now = new Date();
      return (
        <div>
          <p>
            This component continually rerenders. Forgo manages the timestamp,
            but delegates control of the chart to ApexCharts.
          </p>
          <div ref={chartElement}></div>
          <p>
            The current time is:{" "}
            <time datetime={now.toISOString()}>{now.toLocaleString()}</time>
          </p>
        </div>
      );
    }
  });

  component.mount(() => {
    const chartOptions = {
      chart: {
        type: "line",
      },
      series: [
        {
          name: "sales",
          data: [30, 40, 35, 50, 49, 60, 70, 91, 125],
        },
      ],
      xaxis: {
        categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
      },
    };

    const chart = new ApexCharts(chartElement.value, chartOptions);

    chart.render();

    const interval = setInterval(() => component.update(), 1_000);
    component.unmount(() => clearInterval(interval));
  });

  return component;
};
```

## Try it out on CodeSandbox

You can try the [Todo List app with Forgo](https://codesandbox.io/s/forgo-todos-javascript-1oi9b) on CodeSandbox.

Or if you prefer TypeScript, try [Forgo TodoList in TypeScript](https://codesandbox.io/s/forgo-todos-typescript-9v0iy).

There is also an example for using [Forgo with forgo-router](https://codesandbox.io/s/forgo-router-typescript-px4sg).

## Building

Most users should use create-forgo-app to create the project skeleton - in which
case all of this is already set up for you. This is the easiest way to get
started.

If you want to stand up a project manually, we'll cover webpack-specific
configuration here. Other bundlers would need similar configuration.

### esbuild-loader with JavaScript/JSX

Add these lines to webpack.config.js:

```js
module.exports = {
  // remaining config omitted for brevity.
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "esbuild-loader",
        options: {
          loader: "jsx",
          target: "es2015",
          jsxFactory: "forgo.createElement",
          jsxFragment: "forgo.Fragment",
        },
      },
    ],
  },
};
```

### esbuild-loader with TypeScript/TSX

Add these lines to webpack.config.js:

```js
module.exports = {
  // remaining config omitted for brevity.
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "esbuild-loader",
        options: {
          loader: "tsx",
          target: "es2015",
          jsxFactory: "forgo.createElement",
          jsxFragment: "forgo.Fragment",
        },
      },
    ],
  },
};
```

While using TypeScript, also add the following lines to your tsconfig.json. This lets you do `tsc --noEmit` for type checking, which esbuild-loader doesn't do.

Add these lines to tsconfig.json:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "forgo.createElement",
    "jsxFragmentFactory": "forgo.Fragment"
  }
}
```

### babel-loader with JSX

This is slower than esbuild-loader, so use only as needed.

Add these lines to webpack.config.js:

```js
module.exports = {
  // remaining config omitted for brevity.
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
    ],
  },
};
```

Add these lines to babel.config.json:

```json
{
  "presets": ["@babel/preset-env", "@babel/preset-react"],
  "plugins": [
    ["@babel/plugin-transform-react-jsx", { "pragma": "forgo.createElement" }]
  ]
}
```

### TSX with ts-loader

Add these lines to webpack.config.js:

```js
module.exports = {
  // remaining config omitted for brevity.
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
};
```

Add these lines to tsconfig.json:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "forgo.createElement",
    "jsxFragmentFactory": "forgo.Fragment"
  }
}
```

## Core Team

- [github/jeswin](https://github.com/jeswin)
- [github/spiffytech](https://github.com/spiffytech)

## Getting Help

If you find issues, please file a bug on
[Github](https://github.com/forgojs/forgo/issues). You can also reach out to us
via Twitter (@forgojs).

## Deprecation of legacy component syntax is 3.2.0
In version 3.2.0, Forgo introduced a new syntax for components. This change
makes Forgo easier to extend with reusable libraries, and makes it
straightforward to colocate logic that spans mounts & unmounts.

The legacy component syntax will be removed in v4.0. Until then, Forgo will
print a warning to the console whenever it sees a legacy component. You can
suppress these warnings by setting `window.FORGO_NO_LEGACY_WARN = true;`.

### Migrating
Forgo components are now instances of the `Component` class, rather than
freestanding object values. The `new Component` constructor accepts an object
holding a `render()` an optional `error()` method. All other methods have been
converted to lifecycle methods on the component instance. You may register
multiple handlers for each lifecycle event, and you may register new handlers
from inside a handler (e.g., a mount handler that registers its own unmount
logic).

`args` has been replaced by a reference to the component instance, in all
lifecycle event handlers. This simplifies writing reusable component logic.

The `error()` method now receives the error object as a function parameter,
rather than as a property on `args`.

The `afterRender` lifecycle event now receives the `previousNode` as a function
parameter, instead of a property on `args`.

Before:
```jsx
const MyComponent = () => {
  return {
    render() {},
    error() {},
    mount() {},
    unmount() {},
    shouldUpdate() {},
    afterRender() {},
  };
}
```

After:
```jsx
const MyComponent = () => {
  const component = new Component({
    render() {},
    error() {}
  });

  component.mount(() => {});
  component.unmount(() => {});
  component.shouldUpdate(() => {});
  component.afterRender(() => {});

  return component;
}
```

## Breaking changes in 2.0

Forgo 2.0 drops support for the new JSX transform introduced via "jsx-runtime".
This never worked with esbuild loader, and more importantly doesn't play well
with ES modules. If you were using this previously, switch to the configurations
discussed above.