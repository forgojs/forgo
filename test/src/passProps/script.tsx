import { mount } from "../../../dist";

export function Parent() {
  return {
    render() {
      return (
        <div>
          <Child text="Hello" />
        </div>
      );
    },
  };
}

export function Child(props: { text: string }) {
  return {
    render(props: { text: string }) {
      return <div>{props.text}</div>;
    },
  };
}

window.addEventListener("load", () => {
  mount(<Parent />, document.getElementById("root"));
});
