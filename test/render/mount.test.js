const test = require('ava')
const sinon = require('sinon')
const mount = require('../../src/mount')

const componentPath = require.resolve('./fixtures/test-component-a/index.marko')

test('should create an interactable component', async (t) => {
  t.plan(2)

  const { clean, component } = await mount(componentPath)

  t.is(component.state.selected, undefined)

  component.handleClick()

  t.true(component.state.selected)
  clean()
})

test('should allow input to be passed in', async (t) => {
  t.plan(1)

  const input = { selected: true }

  const { clean, component } = await mount(componentPath, input)

  const { selected } = component.state

  t.true(selected)
})

test('should call #window.close after clean is invoked', async (t) => {
  const { window, clean } = await mount(componentPath)
  const spy = sinon.spy(window, 'close')

  clean()

  t.notThrows(() => {
    sinon.assert.calledOnce(spy)
  })
})
