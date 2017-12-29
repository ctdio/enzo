const fs = require('fs')
const path = require('path')
const promisify = require('pify')

const { JSDOM } = require('jsdom')
const webpack = require('webpack')
const getRandomFileName = require('./util/getRandomFileName')

const tempDirPath = `${process.cwd()}/.enzo`
const outputPath = `${tempDirPath}/dist`

const mkdirAsync = promisify(fs.mkdir)
const writeFileAsync = promisify(fs.writeFile)
const readFileAsync = promisify(fs.readFile)
const unlinkAsync = promisify(fs.unlink)

const componentCache = {}

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

function generateScript (componentPath) {
  return `window.template = require('${componentPath}')`
}

async function createWorkDir () {
  try {
    await mkdirAsync(tempDirPath)
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err
    }
  }
}

function compile (inputPath) {
  const tempOutputFile = `${getRandomFileName()}.js`

  const config = {
    ...baseWebpackConfig,
    entry: inputPath
  }

  config.output.filename = tempOutputFile

  const compiler = webpack(config)

  return new Promise((resolve, reject) => {
    compiler.run(async (err) => {
      let tempOutputPath

      try {
        if (err) {
          throw err
        }

        tempOutputPath = path.join(outputPath, tempOutputFile)
        const outputScript = await readFileAsync(tempOutputPath, 'utf8')

        resolve(outputScript)
      } catch (err) {
        reject(err)
      } finally {
        if (tempOutputPath) {
          await unlinkAsync(tempOutputPath)
        }
      }
    })
  })
}

async function mount (componentPath, input) {
  let tempInputPath
  let outputScript

  await createWorkDir()

  try {
    if (componentCache[componentPath]) {
      outputScript = componentCache[componentPath]
    } else {
      tempInputPath = `${tempDirPath}/${getRandomFileName()}.js`

      const script = generateScript(componentPath)
      await writeFileAsync(tempInputPath, script)

      outputScript = await compile(tempInputPath)
      componentCache[componentPath] = outputScript
    }

    const page = generatePage(outputScript)
    const dom = new JSDOM(page, { runScripts: 'dangerously' })

    const { window } = dom
    const { document, template } = window

    const component = template.renderSync(input)
      .appendTo(document.body)
      .getComponent()

    const clean = () => window.close()
    component.once('destroy', () => setImmediate(clean))

    return {
      dom,
      clean,
      window,
      document,
      component
    }
  } finally {
    if (tempInputPath) {
      await unlinkAsync(tempInputPath)
    }
  }
}

module.exports = mount
