const test = require('ava')

const render = require('../src/render')
const componentPath = require.resolve('./fixtures/test-component-a/index.marko')

test('should render a static string', (t) => {
  // eslint-disable-next-line
  const string = render(componentPath)

  t.pass()
})
