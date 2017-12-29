const test = require('ava')
const sinon = require('sinon')
const mount = require('../src/mount')
const proxyquire = require('proxyquire')

const componentPath = require.resolve('./fixtures/test-component-a/index.marko')

test('should create an interactable component', async (t) => {
  t.plan(2)

  const { component } = await mount(componentPath)

  t.is(component.state.selected, undefined)

  component.handleClick()

  t.true(component.state.selected)

  component.destroy()
})

test('should allow input to be passed in', async (t) => {
  t.plan(1)

  const input = { selected: true }
  const { component } = await mount(componentPath, input)
  const { selected } = component.state

  t.true(selected)

  component.destroy()
})

test('should call #window.close after clean is invoked', async (t) => {
  t.plan(1)

  const { window, clean } = await mount(componentPath)
  const spy = sinon.spy(window, 'close')

  clean()

  t.notThrows(() => {
    sinon.assert.calledOnce(spy)
  })
})

test('should reject on compile error', async (t) => {
  t.plan(1)

  const componentPath =
    require.resolve('./fixtures/bad-component/index.marko')

  await t.throws(mount(componentPath))
})

test('should reject on compile error', async (t) => {
  t.plan(2)

  const compileError = new Error('Compile error')

  const mount = proxyquire('../src/mount', {
    webpack: () => ({
      run: sinon.stub().callsFake((callback) => {
        callback(compileError)
      })
    })
  })

  const error = await t.throws(mount(componentPath))
  t.is(error.message, compileError.message)
})

test('should reject if unable to create a work directory', async (t) => {
  t.plan(2)

  const mkdirError = new Error('Error creating directory')

  const mount = proxyquire('../src/mount', {
    fs: {
      mkdir: (input, callback) => callback(mkdirError)
    }
  })

  const error = await t.throws(mount(componentPath))
  t.is(error.message, mkdirError.message)
})

test.serial('should pull component code from cache after first mount', async (t) => {
  t.plan(1)

  const fs = require('fs')
  const writeFileSpy = sinon.spy(fs, 'writeFile')
  const mount = proxyquire('../src/mount', { fs })

  await mount(componentPath)

  const { callCount } = writeFileSpy

  await mount(componentPath)

  t.is(callCount, writeFileSpy.callCount,
    'call count should be the same after second mount')

  writeFileSpy.restore()
})
