# forgo

Forgo is a 4KB library that makes it super easy to create modern web apps using JSX (like React).

Unlike React, apps are plain JS with very little framework specific code. Everything you already know about DOM APIs and JavaScript will easily carry over.

- Use HTML DOM APIs for accessing elements
- There are no synthetic events
- Use closures for maintaining component state
- Use any singleton pattern for managing app-wide state
- There's no vDOM or DOM diffing. Renders are manually triggered

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

## Multiple Components, passing props etc. 

Most of these things work just as you would expect. Let's make a Todo List app.

There will be three components:

1. TodoList (the main component)
2. TodoListItem
3. AddTodo

Here's the TodoList, which hosts the other two components.

```tsx
type TodoListProps = {};

function TodoList(props: TodoListProps) {
  let todos: string[] = [];

  return {
    render(props: TodoListProps, args: ForgoRenderArgs) {
      function onTodoAdd(text: string) {
        todos.push(text);
        rerender(args.element);
      }

      return (
        <div>
          <h1>Forgo Todos</h1>
          <ul>
            {todos.map((t) => (
              <TodoListItem text={t} />
            ))}
          </ul>
          <AddTodo onAdd={onTodoAdd} />
        </div>
      );
    },
  };
}
```

Here's the TodoList item, which simply displays a Todo.

```tsx
type TodoListItemProps = {
  text: string;
};

function TodoListItem(props: TodoListItemProps) {
  return {
    render() {
      return <li>{props.text}</li>;
    },
  };
}
```

And here's the AddTodo component. It takes an onAdd function from the parent, which gets called whenever a new todo is added.

```tsx
type AddTodoProps = {
  onAdd: (text: string) => void;
};

function AddTodo(props: AddTodoProps) {
  const input: { value?: HTMLInputElement } = {};

  function onClick() {
    const inputEl = input.value;
    if (inputEl) {
      props.onAdd(inputEl.value);
      inputEl.value = "";
      inputEl.focus();
    }
  }

  return {
    render() {
      return (
        <div>
          <input type="text" ref={input} />
          <button onclick={onClick}>Add me!</button>
        </div>
      );
    },
  };
}
```

That's all. Mount it, and we're ready to go.

```ts
window.addEventListener("load", () => {
  mount(<TodoList />, document.getElementById("root"));
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
  }
}
```
