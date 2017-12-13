const marko = require('marko')

/**
 * renders a static string
 */
function render (componentPath, input) {
  const template = marko.load(componentPath)
  return template.renderToString(input)
}

module.exports = render
