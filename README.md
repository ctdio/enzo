# enzo

Small testing library for [marko](https://github.com/markojs/marko)
that allows you to test components using any testing framework.

## Installation

```sh
npm install --dev enzo

// or if you use yarn
yarn add --dev enzo
```

## Usage

This module exposes two methods for rendering components: `render` and `mount`.

### `render(componentPath: string [, input: object])`

The `render` function will perform a simple static
render of the component. The first argument is the path to the component
template and the second argument (optional) argument is the
input for rendering the component.

ex.

```js
const { render } = require('enzo')
const componentPath = require.resolve('./src/components/button.marko')

const input = { text: 'some-text' }
const markup = render(componentPath, input)

console.log(markup) // prints out the component markup
```

### `mount(componentPath: string, [, input: object])`

The `mount` function will render the component within
a [jsdom](https://github.com/tmpvar/jsdom) instance.
The input arguments are the same as the arguments for `render`.

Note: this is an `async` function.

This will resolve with an object containing:

-   `dom` - the `jsdom` instance
-   `window` - the `jsdom` instance's window
-   `document` - the `jsdom` instance's document
-   `component` - the rendered component instance
-   `clean` - a helper function for destroying the
    `jsdom` instance.

Note: Calling `component.destroy()` will automatically
trigger the `clean` function and perform cleanup.

```js
const { mount } = require('enzo')
const componentPath = require.resolve('./src/components/button.marko')

const input = { text: 'some-text' }
const { component } = await mount(componentPath, input)

component.handleClick()
```

## Why `enzo`?

I wanted a tool that was similar to what
[enzyme](https://github.com/airbnb/enzyme) provides for
[react](https://github.com/facebook/react).
However, I didn't want _everything_ that `enzyme` provided.
Perhaps in the future, even more opinionated developers can build wrappers
around `enzo` to give it more functionality.

I also wanted a tool that allowed developers a little more flexibility
when testing `marko` components. At the moment, the preferred
way of performing component tests is with
[marko-cli](https://github.com/marko-js/marko-cli), which
is a fantastic tool, but locks users into using the
[mocha](https://github.com/mochajs/mocha) testing framework
and [lasso](https://github.com/lasso-js/lasso).
`enzo` is simply an alternative choice.

_Fun fact: The name `enzo` comes from squishing the names
`enzyme` and `marko` together. No, I didn't name it after
the Ferrari._

## How `enzo` works

`enzo` provides a few helper methods for testing your `marko` components.

The `render` function is essentially a slightly more
concise way of loading the component and calling `renderToString`.
It provides little value over what is already available, but can save
you a few keystrokes. The output string alone can be pretty useless by
itself, but when paired with other tools as
[cheerio](https://github.com/cheeriojs/cheerio)
you can make more powerful assertions.

The `mount` function does quite a bit more work. It takes
your `marko` component and bundles all of the necessary modules
together to run it in a browser environment using
[webpack](https://github.com/webpack/webpack). The resulting
bundle is then passed to a `jsdom` instance and rendered.
Each call to `mount` returns a new component that has been
sandboxed in it's own `jsdom` instance, so you won't have to
worry about messy conflicts when running tests in parallel.
This also means that the `jsdom` `document` object is
_not_ stuffed into the Node globals
(see this [wiki page](https://github.com/tmpvar/jsdom/wiki/Don%27t-stuff-jsdom-globals-onto-the-Node-global)).

## Why `webpack` and not `<insert bundler here>`?

Some sort of bundler was needed to pull dependencies together,
and I wasn't going to write that logic myself. I went with
`webpack`, which is arguably one of the most flexible and well
supported bundlers out there. Although this makes `enzo`
way more appealing to `webpack` users, most users should
still be able to write effective unit tests for their
components regardless of the bundler they use as long as
the more complex bundler specific features are not used.
Testing with the bundler you use in production is still better though,
and not being able to use bundler specific features is
a limitation that I am not happy with.
Perhaps this module can be extended to allow for
custom bundlers to be used in the future (PRs welcome!).

## Example usage

I created a small [example](https://github.com/charlieduong94/enzo-ava-example)
project that shows how components can be tested using
`enzo`, `cheerio`, and [ava](https://github.com/avajs/ava).
It's relatively small in scope, but enough to show off how tests
can be written with `enzo`.

## Todo
-   ~~Allow for custom rules to be added to the `webpack` config.~~
    Allow for custom bundlers to be used.

