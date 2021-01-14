import { mount } from "../../../dist";

export function Parent() {
  return {
    render() {
      (window as any).myInput = {};

      return (
        <div>
          <input type="text" ref={(window as any).myInput} />
        </div>
      );
    },
  };
}

window.addEventListener("load", () => {
  mount(<Parent />, document.getElementById("root"));
});
