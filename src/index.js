import { validate } from 'schema-utils'
import schema from './options.json'

const path = require('path')

export default class PrerenderSPAPlugin {
  constructor (options = {}) {
    validate(schema, options, {
      name: 'Prerender SPA Plugin',
      baseDataPath: 'options'
    })

    this.options = options

    const PuppeteerRenderer = require('@prerenderer/renderer-puppeteer')
    this.options.renderer = this.options.renderer || new PuppeteerRenderer(Object.assign({}, { headless: true }, this.options.rendererOptions))
  }

  async prerender (compiler, compilation) {
    const Prerenderer = require('@prerenderer/prerenderer')
    const indexPath = this.options.indexPath || 'index.html'

    const PrerendererInstance = new Prerenderer({ staticDir: compiler.options.output.path, ...this.options, assets: compilation.assets })
    const prev = PrerendererInstance.modifyServer
    PrerendererInstance.modifyServer = (server, stage) => {
      if (stage === 'post-fallback') {
        server = server._expressServer
        const routes = server._router.stack
        routes.forEach((route, i) => {
          if (route.route && route.route.path === '*') {
            routes.splice(i, 1)
          }
        })

        server.get('*', (req, res) => {
          let path = req.path.slice(1, req.path.endsWith('/') ? -1 : undefined)
          path = path in compilation.assets || path.includes('.') ? path : path + '/' + indexPath
          if (path.startsWith('/')) {
            path = path.slice(1)
          }
          if (path in compilation.assets) {
            res.type(path)
            res.send(compilation.assets[path].source())
          } else if (indexPath in compilation.assets) {
            res.send(compilation.assets[indexPath].source())
          } else if ('index.html' in compilation.assets) {
            res.send(compilation.assets['index.html'].source())
          } else {
            compilation.errors.push(new Error('[prerender-spa-plugin] ' + path + ' not found during prerender'))
            res.status(404)
          }
        })
      }
      prev.call(PrerendererInstance, server, stage)
    }

    try {
      await PrerendererInstance.initialize()
      const renderedRoutes = await PrerendererInstance.renderRoutes(this.options.routes || [])

      // Run postProcess hooks.
      if (typeof this.options.postProcess === 'function') {
        await Promise.all(renderedRoutes.map(renderedRoute => this.options.postProcess(renderedRoute)))
        // Check to ensure postProcess hooks returned the renderedRoute object properly.

        const isValid = renderedRoutes.every(r => typeof r === 'object')
        if (!isValid) {
          throw new Error('[prerender-spa-plugin] Rendered routes are empty, did you forget to return the `context` object in postProcess?')
        }
      }

      // Calculate outputPath if it hasn't been set already.
      renderedRoutes.forEach(processedRoute => {
        // Create dirs and write prerendered files.
        if (!processedRoute.outputPath) {
          processedRoute.outputPath = path.join(processedRoute.route, indexPath)

          if (processedRoute.outputPath.startsWith('/')) {
            processedRoute.outputPath = processedRoute.outputPath.slice(1)
          }
        }
        const fn = processedRoute.outputPath in compilation.assets ? compilation.updateAsset : compilation.emitAsset
        fn.call(compilation, processedRoute.outputPath, new compiler.webpack.sources.RawSource(processedRoute.html.trim(), false), {
          prerendered: true
        })
      })
    } catch (err) {
      const msg = '[prerender-spa-plugin] Unable to prerender all routes!'
      compilation.errors.push(new Error(msg))
      compilation.errors.push(err)
    }

    PrerendererInstance.destroy()
  }

  apply (compiler) {
    const pluginName = this.constructor.name
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      const HtmlWebpackPlugin = require('html-webpack-plugin')
      const hooks = HtmlWebpackPlugin.getHooks(compilation)

      hooks.afterEmit.tapPromise(pluginName, () => this.prerender(compiler, compilation))
    })
  }
}
