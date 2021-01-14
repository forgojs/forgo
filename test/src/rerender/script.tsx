import { rerender, mount, ForgoRenderArgs } from "../../../dist";

export function Component() {
  let counter = 0;

  return {
    render(props: any, args: ForgoRenderArgs) {
      function updateCounter() {
        counter++;
        rerender(args.element);
      }

      (window as any).myButton = {};

      return (
        <div>
          <button onclick={updateCounter} ref={(window as any).myButton}>
            Click me!
          </button>
          <p>Clicked {counter} times</p>
        </div>
      );
    },
  };
}

window.addEventListener("load", () => {
  mount(<Component />, document.getElementById("root"));
});
