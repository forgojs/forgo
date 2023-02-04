import { JSDOM } from "jsdom";

import * as forgo from "../index.js";
import htmlFile from "./htmlFile.js";
import { run } from "./componentRunner.js";

function componentFactory() {
  const state: {} = {};

  interface GreetProps {
    text: string;
  }
  const Greet = (_props: {
    text: string;
  }) => {
    return new forgo.Component<GreetProps>({
      render(props) {
        return <p>{props.text}</p>;
      },
    });
  };
  const Parent = () => {
    return new forgo.Component({
      render() {
        return (
          <div>
            <Greet text="Hello2" />
            <Greet text="World2" />
          </div>
        );
      },
    });
  };

  return {
    Component: Parent,
    state,
  };
}

export default function () {
  it("simple server side rendering", async () => {
    const dom = new JSDOM(htmlFile("<div><p>Hello1</p><p>World1</p></div>"), {
      runScripts: "outside-only",
      resources: "usable",
    });

    const { Component } = componentFactory();
    const { document } = await run(() => <Component />, dom);

    document.body.innerHTML.should.not.containEql("World1");
    document.body.innerHTML.should.containEql("World2");
  });
}
