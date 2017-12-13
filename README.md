# enzo

Small testing library for [marko](https://github.com/markojs/marko)
that allows you to test components using any testing framework.
*Note: Work in progress.*

## Installation

```sh
npm install --dev enzo

// or if you use yarn
yarn add --dev enzo
```

## Usage

This module exposes two methods for rendering components, `render` and `mount`.

### `render(componentPath: string [, input: object])`

The `render` function will perform a simple static
render of the component.

ex.

```js
const { render } = require('enzo')
const componentPath = require.resolve('./src/components/button.marko')

const input = { text: 'some-text' }
const markup = render(componentPath, input)

console.log(markup) // prints out the component markup
```

### `mount(componentPath: string, [, input: object])`

The `mount` function will render the component

```js
const { mount } = require('enzo')
const componentPath = require.resolve('./src/components/button.marko')

const input = { text: 'some-text' }
const { component } = await mount(componentPath, input)

component.handleClick()
```
