// Compiled using marko@4.7.1 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/dist/html").t(__filename),
    marko_componentType = "/enzo$0.0.1/test/render/fixtures/test-component-a/index.marko",
    marko_component = require("./component"),
    components_helpers = require("marko/dist/components/helpers"),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    marko_helpers = require("marko/dist/runtime/html/helpers"),
    marko_classAttr = marko_helpers.ca,
    marko_attr = marko_helpers.a;

function render(input, out, __component, component, state) {
  var data = input;

  const { selected } = state

  out.w("<div" +
    marko_classAttr({
      selected: selected
    }) +
    marko_attr("data-marko", {
      onclick: __component.d("handleClick")
    }, false) +
    ">Sup</div>");
}

marko_template._ = marko_renderer(render, {
    _l_: marko_componentType
  }, marko_component);

marko_template.Component = marko_defineComponent(marko_component, marko_template._);

marko_template.meta = {
    deps: [
      "./style.scss"
    ],
    id: "/enzo$0.0.1/test/render/fixtures/test-component-a/index.marko",
    component: "./index.marko"
  };
