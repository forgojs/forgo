import * as assert from "assert";
import should from "should";

import * as forgo from "../index.js";
import { run } from "./componentRunner.js";

function componentFactory() {
  const state: {
    component: forgo.Component<TestComponentProps> | null;
    wrapper: forgo.Component<WrapperProps> | null;

    render: {
      key: string;
      args: [TestComponentProps, forgo.Component<TestComponentProps>];
    }[];
    mount: {
      key: string;
      args: [TestComponentProps, forgo.Component<TestComponentProps>];
    }[];
    unmount: {
      key: string;
      args: [TestComponentProps, forgo.Component<TestComponentProps>];
    }[];
    afterRender: {
      key: string;
      args: [
        TestComponentProps,
        ChildNode | undefined,
        forgo.Component<TestComponentProps>
      ];
    }[];
    shouldUpdate: {
      key: string;
      args: [
        TestComponentProps,
        TestComponentProps,
        forgo.Component<TestComponentProps>
      ];
    }[];
  } = {
    component: null,
    wrapper: null,

    render: [],
    mount: [],
    unmount: [],
    afterRender: [],
    shouldUpdate: [],
  };

  interface TestComponentProps {
    foo: string;
    forceUpdate?: boolean;
  }
  const TestComponent: forgo.ForgoComponentCtor<TestComponentProps> = (
    _props
  ) => {
    const component = new forgo.Component<TestComponentProps>({
      render(...args) {
        state.render.push({ key: "render", args });
        return <p>Hello, world!</p>;
      },
    });
    component.addEventListener("mount", (...args) =>
      state.mount.push({ key: "mount1", args })
    );
    component.addEventListener("mount", (...args) => {
      state.mount.push({ key: "mount2", args });

      component.addEventListener("unmount", (...args) =>
        state.unmount.push({ key: "unmount3", args })
      );
    });

    component.addEventListener("unmount", (...args) =>
      state.unmount.push({ key: "unmount1", args })
    );
    component.addEventListener("unmount", (...args) =>
      state.unmount.push({ key: "unmount2", args })
    );

    component.addEventListener("afterRender", (...args) =>
      state.afterRender.push({ key: "afterRender1", args })
    );
    component.addEventListener("afterRender", (...args) =>
      state.afterRender.push({ key: "afterRender2", args })
    );

    component.addEventListener("shouldUpdate", (...args) => {
      state.shouldUpdate.push({ key: "shouldUpdate1", args });
      return false;
    });
    component.addEventListener("shouldUpdate", (...args) => {
      state.shouldUpdate.push({ key: "shouldUpdate2", args });
      return args[0].forceUpdate ?? false;
    });

    state.component = component;

    return component;
  };

  interface WrapperProps extends TestComponentProps {
    unmount?: boolean;
  }
  /**
   * We use the wrapper to have a way for tests to unmount the actual component
   * we're testing
   */
  const Wrapper: forgo.ForgoComponentCtor<WrapperProps> = () => {
    const wrapper = new forgo.Component<WrapperProps>({
      render(props) {
        if (props.unmount) return <p>Unmounted!</p>;
        return <TestComponent {...props} />;
      },
    });
    state.wrapper = wrapper;
    return wrapper;
  };

  return {
    Component: Wrapper,
    state: state,
  };
}

export default function () {
  describe("The component API", () => {
    it("errors out if the ctor doesn't return a Component instance", async () => {
      const Ctor = () => ({});

      await assert.rejects(run(() => <Ctor />));
    });

    it("passes the right arguments to render()", async () => {
      const { Component, state } = componentFactory();
      await run((env) => <Component {...env} foo="foo" />);

      should.equal(state.render.length, 1);
      should.equal(state.render[0].args[0].foo, "foo");
      should.equal(state.render[0].args[1], state.component);
    });

    it("passes the right arguments to mount event listeners", async () => {
      const { Component, state } = componentFactory();
      await run((env) => <Component {...env} foo="foo" />);

      should.equal(state.mount.length, 2);
      should.equal(state.mount[0].args[0].foo, "foo");
      should.equal(state.mount[0].args[1], state.component);
      should.deepEqual(
        state.mount.map(({ key }) => key),
        ["mount1", "mount2"]
      );
    });

    it("passes the right arguments to afterRender event listeners", async () => {
      const { Component, state } = componentFactory();
      await run((env) => <Component {...env} foo="foo" />);

      should.equal(state.afterRender.length, 2);
      should.equal(state.afterRender[0].args[0].foo, "foo");
      should.equal(state.afterRender[0].args[1], undefined);
      should.equal(state.afterRender[0].args[2], state.component);
      should.deepEqual(
        state.afterRender.map(({ key }) => key),
        ["afterRender1", "afterRender2"]
      );
    });

    it("passes the right arguments to shouldUpdate event listeners", async () => {
      const { Component, state } = componentFactory();
      await run((env) => <Component {...env} foo="foo" />);

      state.component!.update();

      should.equal(state.shouldUpdate.length, 2);
      should.equal(state.shouldUpdate[0].args[0].foo, "foo");
      should.equal(state.shouldUpdate[0].args[1].foo, "foo");
      should.equal(state.shouldUpdate[0].args[2], state.component);
      should.deepEqual(
        state.shouldUpdate.map(({ key }) => key),
        ["shouldUpdate1", "shouldUpdate2"]
      );
    });

    it("only rerenders the component if at least one shouldUpdate listeners return true", async () => {
      const { Component, state } = componentFactory();
      await run((env) => <Component {...env} foo="foo" />);

      state.component!.update();
      should.equal(state.render.length, 1);

      state.component!.update({ foo: "foo", forceUpdate: true });
      should.equal(state.render.length, 2);
    });

    it("passes the right arguments to unmount event listeners", async () => {
      const { Component, state } = componentFactory();
      await run((env) => <Component {...env} foo="foo" />);

      state.wrapper!.update({ foo: "foo", unmount: true });

      // 3, sir! Because we want to catch not only the two top-level listeners,
      // but also the listener added by the mount event listener.
      should.equal(state.unmount.length, 3);
      should.equal(state.unmount[0].args[0].foo, "foo");
      should.equal(state.unmount[0].args[1], state.component);
      should.deepEqual(
        state.unmount.map(({ key }) => key),
        ["unmount1", "unmount2", "unmount3"]
      );
    });
  });
}
