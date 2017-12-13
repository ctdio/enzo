const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const { JSDOM } = require('jsdom')
const webpack = require('webpack')
const markoCompiler = require('marko/compiler')
const getRandomFileName = require('./util/getRandomFileName')

const tempDirPath = `${process.cwd()}/.enzo`
const outputPath = `${tempDirPath}/dist`

const mkdirAsync = promisify(fs.mkdir)
const writeFileAsync = promisify(fs.writeFile)
const readFileAsync = promisify(fs.readFile)

const baseWebpackConfig = {
  output: {
    path: outputPath
  },
  resolve: {
    extensions: ['.js', '.marko']
  },
  module: {
    loaders: [
      {
        test: /\.marko$/,
        loader: 'marko-loader'
      },
      {
        test: /\.css/,
        loader: [ 'style-loader', 'css-loader' ]
      }
    ]
  }
}


function generatePage (script) {
  return `
    <!DOCTYPE html>
    <html>
      <head></head>
      <body>
        <script>${script}</script>
      </body>
    </html>
  `
}

function generateScript (componentPath, input) {
  return `
    const component = require('${componentPath}')
    window.component = component.renderSync(${JSON.stringify(input)})
      .appendTo(document.body)
      .getComponent()
  `
}

async function mount (componentPath, input) {
  const tempInputPath = `${tempDirPath}/${getRandomFileName()}.js`
  const tempOutputFile = `${getRandomFileName()}.js`

  try {
    await mkdirAsync(tempDirPath)
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err
    }
  }

  const script = generateScript(componentPath, input)
  await writeFileAsync(tempInputPath, script)

  const config = {
    ...baseWebpackConfig,
    entry: tempInputPath
  }

  config.output.filename = tempOutputFile

  const compiler = webpack(config)

  return new Promise((resolve, reject) => {
    compiler.run(async (err, stats) => {
      if (err) {
        return reject(err)
      }

      const tempOutputPath = path.join(outputPath, tempOutputFile)

      try {
        const outputScript = await readFileAsync(tempOutputPath, 'utf8')
        const page = generatePage(outputScript)

        const dom = new JSDOM(page, { runScripts: 'dangerously' })

        const { window } = dom
        const { document, component } = window

        function clean () {
          window.close()
        }

        component.once('destroy', clean)

        resolve({
          dom,
          clean,
          window,
          document,
          component
        })
      } catch (err) {
        reject(err)
      } finally {
        fs.unlinkSync(tempInputPath)
        fs.unlinkSync(tempOutputPath)
      }
    })
  })
}

module.exports = mount
