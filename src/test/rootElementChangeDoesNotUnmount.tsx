import * as forgo from "../index.js";
import { run } from "./componentRunner.js";

function componentFactory() {
  const state = {
    unmountCount: 0,
    renderCount: 0,
    component: null as forgo.Component | null,
  };

  const TestComponent: forgo.ForgoComponentCtor = () => {
    const Child: forgo.ForgoComponentCtor = () => {
      const component = new forgo.Component({
        render() {
          state.renderCount++;
          if (state.renderCount % 2 === 0) {
            return <div>This is a div</div>;
          } else {
            return <p>But this is a paragraph</p>;
          }
        },
      });
      component.unmount(() => {
        state.unmountCount++;
      });
      return component;
    };

    const component = new forgo.Component({
      render() {
        return (
          <section>
            <Child />
          </section>
        );
      },
    });
    state.component = component;
    return component;
  };

  return {
    TestComponent,
    state,
  };
}

export default function () {
  describe("root element changes", () => {
    it("does not unmount", async () => {
      const { TestComponent, state } = componentFactory();
      await run(() => <TestComponent />);

      state.component!.update();
      state.component!.update();
      state.component!.update();
      state.component!.update();
      state.component!.update();

      state.renderCount.should.equal(6);
      state.unmountCount.should.equal(0);
    });
  });
}
