import { mount } from "../../../dist";

export function BasicComponent() {
  return {
    render() {
      return <div>Hello world</div>;
    },
  };
}

window.addEventListener("load", () => {
  mount(<BasicComponent />, document.getElementById("root"));
});
