> <h1>This package has been replaced with <a href="https://github.com/JoshTheDerf/prerenderer">@prerenderer/webpack-plugin</a>, and a fully updated prerendering suite</h1>
>

<h1 align="center">Prerender SPA Plugin</h1>
<p align="center">
  <em>Flexible, framework-agnostic static site generation for sites and SPAs built with webpack.</em>
</p>

---

<div align="center">

[![npm version](https://img.shields.io/npm/v/prerender-spa-plugin-next.svg)]()
[![npm downloads](https://img.shields.io/npm/dt/prerender-spa-plugin-next.svg)]()
[![Dependency Status](https://img.shields.io/david/tofandel/prerender-spa-plugin.svg)](https://david-dm.org/tofandel/prerender-spa-plugin)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://standardjs.com/)
[![license](https://img.shields.io/github/license/chrisvfritz/prerender-spa-plugin.svg)]()

</div>

---

<div align="center">

[![NPM](https://nodei.co/npm/prerender-spa-plugin-next.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/prerender-spa-plugin-next/)

</div>

## About prerender-spa-plugin-next

**:point_right: This is the stable `4.x` version of `prerender-spa-plugin-next` based on puppeteer.**

The goal of this plugin is to provide a simple prerendering solution that is easily extensible and usable for any site or single-page-app built with webpack.

Plugins for other task runners and build systems are planned.

## Requirements
Currently this plugin only works with webpack 5 and requires the html-webpack-plugin to be setup

## Installation
`npm i -D prerender-spa-plugin-next`

## Examples
Framework-specific examples can be found in the `examples/` directory.

- [Vanilla JS](examples/vanilla-simple)
- [Vue.js 2 Simple](examples/vue2-webpack-simple)
- [Vue.js 2 Router](examples/vue2-webpack-router)
- [React (Create React App)](examples/create-react-app)
- [Angular (Angular CLI + Eject)](examples/angular-cli-eject)

### Basic Usage (`webpack.config.js`)
```js
const path = require('path')
const PrerenderSPAPlugin = require('prerender-spa-plugin-next')

module.exports = {
  plugins: [
    ...
    new PrerenderSPAPlugin({
      // Required - Routes to render.
      routes: [ '/', '/about', '/some/deep/nested/route' ],
    })
  ]
}
```

### Advanced Usage (`webpack.config.js`)

```js
const path = require('path')
const PrerenderSPAPlugin = require('prerender-spa-plugin-next')
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer

module.exports = {
  plugins: [
    ...
    new PrerenderSPAPlugin({
      // Optional - The location of index.html
      indexPath: 'index.html',

      // Required - Routes to render.
      routes: [ '/', '/about', '/some/deep/nested/route' ],

      // Optional - Allows you to customize the HTML and output path before
      // writing the rendered contents to a file.
      // renderedRoute can be modified and it or an equivalent should be returned.
      // renderedRoute format:
      // {
      //   route: String, // Where the output file will end up (relative to outputDir)
      //   originalRoute: String, // The route that was passed into the renderer, before redirects.
      //   html: String, // The rendered HTML for this route.
      //   outputPath: String // The path the rendered HTML will be written to.
      // }
      postProcess (renderedRoute) {
        // Ignore any redirects.
        renderedRoute.route = renderedRoute.originalRoute
        // Basic whitespace removal. (Don't use this in production.)
        renderedRoute.html = renderedRoute.html.split(/>[\s]+</gmi).join('><')
        // Remove /index.html from the output path if the dir name ends with a .html file extension.
        // For example: /dist/dir/special.html/index.html -> /dist/dir/special.html
        if (renderedRoute.route.endsWith('.html')) {
          renderedRoute.outputPath = path.join(__dirname, 'dist', renderedRoute.route)
        }

        return renderedRoute
      },

      // Server configuration options.
      server: {
        // Normally a free port is autodetected, but feel free to set this if needed.
        port: 8001
      },
      renderer: require('@prerenderer/renderer-puppeteer'),
      // The actual renderer to use. (Feel free to write your own)
      // Available renderers: https://github.com/Tribex/prerenderer/tree/master/renderers

      //The options to pass to the renderer class's constructor
      rendererOptions: {
        // Optional - The name of the property to add to the window object with the contents of `inject`.
        injectProperty: '__PRERENDER_INJECTED',
        // Optional - Any values you'd like your app to have access to via `window.injectProperty`.
        inject: {
          foo: 'bar'
        },

        // Optional - defaults to 0, no limit.
        // Routes are rendered asynchronously.
        // Use this to limit the number of routes rendered in parallel.
        maxConcurrentRoutes: 4,

        // Optional - Wait to render until the specified event is dispatched on the document.
        // eg, with `document.dispatchEvent(new Event('custom-render-trigger'))`
        renderAfterDocumentEvent: 'custom-render-trigger',

        // Optional - Wait to render until the specified element is detected using `document.querySelector`
        renderAfterElementExists: 'my-app-element',

        // Optional - Wait to render until a certain amount of time has passed.
        // NOT RECOMMENDED
        renderAfterTime: 5000, // Wait 5 seconds.
        // Optional - Cancel render if it takes more than a certain amount of time
        // useful in combination with renderAfterDocumentEvent as it will avoid waiting infinitely if the event doesn't fire
        timeout: 20000, // Cancel render if it takes more than 20 seconds

        // Other puppeteer options.
        // (See here: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions)
        headless: false // Display the browser window when rendering. Useful for debugging.
      }
    })
  ]
}
```

```js
const path = require('path')
const PrerenderSPAPlugin = require('prerender-spa-plugin-next')

module.exports = {

  // ...

  plugins: [
    new PrerenderSPAPlugin({
        // (REQUIRED) List of routes to prerender
        routes:  [ '/', '/about', '/contact' ],

        rendererOptions: {
            // headless: false,
            renderAfterDocumentEvent: 'render-event',
            inject: {},
            timeout: 10000,
        },
        postProcess: function (context) {
          var titles = {
            '/': 'Home',
            '/about': 'Our Story',
            '/contact': 'Contact Us'
          }
          context.html = context.html.replace(
            /<title>[^<]*<\/title>/i,
            '<title>' + titles[context.route] + '</title>'
          )
        }
      }
    )
  ]
}
```

## What is Prerendering?

Recently, SSR (Server Side Rendering) has taken the JavaScript front-end world by storm. The fact that you can now render your sites and apps on the server before sending them to your clients is an absolutely *revolutionary* idea (and totally not what everyone was doing before JS client-side apps got popular in the first place...)

However, the same criticisms that were valid for PHP, ASP, JSP, (and such) sites are valid for server-side rendering today. It's slow, breaks fairly easily, and is difficult to implement properly.

Thing is, despite what everyone might be telling you, you probably don't *need* SSR. You can get almost all the advantages of it (without the disadvantages) by using **prerendering.** Prerendering is basically firing up a headless browser, loading your app's routes, and saving the results to a static HTML file. You can then serve it with whatever static-file-serving solution you were using previously. It *just works* with HTML5 navigation and the likes. No need to change your code or add server-side rendering workarounds.

In the interest of transparency, there are some use-cases where prerendering might not be a great idea.

- **Tons of routes** - If your site has hundreds or thousands of routes, prerendering will be really slow. Sure you only have to do it once per update, but it could take ages. Most people don't end up with thousands of static routes, but just in-case...
- **Dynamic Content** - If your render routes that have content that's specific to the user viewing it or other dynamic sources, you should make sure you have placeholder components that can display until the dynamic content loads on the client-side. Otherwise it might be a tad weird.

## Available Renderers
- `@prerenderer/renderer-puppeteer` - Uses [puppeteer](https://github.com/GoogleChrome/puppeteer) to render pages in headless Chrome.
- `@prerenderer/renderer-jsdom` - Uses [jsdom](https://npmjs.com/package/jsdom). Extremely fast, but unreliable and cannot handle advanced usages. May not work with all front-end frameworks and apps.

### Which renderer should I use?

**Use `@prerenderer/renderer-puppeteer` if:** You're prerendering up to a couple hundred pages and want accurate results (bye-bye RAM!).

**Use `@prerenderer/renderer-jsdom` if:** You need to prerender thousands upon thousands of pages, but quality isn't all that important, and you're willing to work around issues for more advanced cases. (Programmatic SVG support, etc.)

## Documentation

### Plugin Options

| Option | Type | Required? | Default | Description |
|-------------|-------------------------------------------|-----------|---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| indexPath | String | No | `index.html` | The index file to fall back on for SPAs. |
| postProcess | Function(Object context): [Object \| Promise] | No | None | See the [Using the postProcess Option](#using-the-postprocess-option) section. |
| server | Object | No | None | App server configuration options (See below) |
| renderer | Renderer Instance or Configuration Object | No | `new PuppeteerRenderer()` | The renderer you'd like to use to prerender the app. It's recommended that you specify this, but if not it will default to `@prerenderer/renderer-puppeteer`. |

#### Server Options

| Option | Type    | Required? | Default                    | Description                            |
|--------|---------|-----------|----------------------------|----------------------------------------|
| port   | Integer | No        | First free port after 8000 | The port for the app server to run on. |
| proxy  | Object  | No        | No proxying                | Proxy configuration. Has the same signature as [webpack-dev-server](https://github.com/webpack/docs/wiki/webpack-dev-server#proxy) |


#### Using The postProcess Option

The `postProcess(Object context): Object | Promise` function in your renderer configuration allows you to adjust the output of `prerender-spa-plugin-next` before writing it to a file. It is called once per rendered route and is passed a `context` object in the form of:

```javascript
{
  // The prerendered route, after following redirects.
  route: String,
  // The original route passed, before redirects.
  originalRoute: String,
  // The resulting HTML for the route.
  html: String,
  // The path to write the rendered HTML to.
  // This is null (automatically calculated after postProcess)
  // unless explicitly set.
  outputPath: String || null
}
```

You can modify `context.html` to change what gets written to the prerendered files and/or modify `context.route` or `context.outputPath` to change the output location.

You are expected to adjust those properties as needed, then return the context object, or a promise that resolves to it like so:

```javascript
postProcess(context) {
  // Remove /index.html from the output path if the dir name ends with a .html file extension.
  // For example: /dist/dir/special.html/index.html -> /dist/dir/special.html
  if (context.route.endsWith('.html')) {
    context.outputPath = path.join(__dirname, 'dist', context.route)
  }
}

postProcess(context) {
  return someAsyncProcessing(context.html)
    .then((html) => {
      context.html = html;
    });
}
```

#### Vue.js Notes
If you are having issues prerendering with Vue.js, try adding the [`data-server-rendered="true"`](https://ssr.vuejs.org/guide/hydration.html) attribute to your root app element. This will cause Vue to treat your current page as an already-rendered app and update it rather than completely rerendering the whole tree. You can add the attribute using `postProcess` or by manipulating the DOM with JavaScript prior prerendering with `renderAfterDocumentEvent`.

---

### `@prerenderer/renderer-puppeteer` options

| Option                                                                                                                 | Type                                                                                                                                       | Required? | Default                | Description                                                                                                                                                                                                                                                           |
|------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|-----------|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| maxConcurrentRoutes                                                                                                    | Number                                                                                                                                     | No        | 0 (No limit)           | The number of routes allowed to be rendered at the same time. Useful for breaking down massive batches of routes into smaller chunks.                                                                                                                                 |
| inject                                                                                                                 | Object                                                                                                                                     | No        | None                   | An object to inject into the global scope of the rendered page before it finishes loading. Must be `JSON.stringifiy`-able. The property injected to is `window['__PRERENDER_INJECTED']` by default.                                                                   |
| injectProperty                                                                                                         | String                                                                                                                                     | No        | `__PRERENDER_INJECTED` | The property to mount `inject` to during rendering.                                                                                                                                                                                                                   |
| renderAfterDocumentEvent                                                                                               | String                                                                                                                                     | No        | None                   | Wait to render until the specified event is fired on the document. (You can fire an event like so: `document.dispatchEvent(new Event('custom-render-trigger'))`                                                                                                       |
| renderAfterElementExists                                                                                               | String (Selector)                                                                                                                          | No        | None                   | Wait to render until the specified element is detected using `document.querySelector`                                                                                                                                                                                 |
| renderAfterTime                                                                                                        | Integer (Milliseconds)                                                                                                                     | No        | None                   | Wait to render until a certain amount of time has passed.                                                                                                                                                                                                             |
| skipThirdPartyRequests                                                                                                 | Boolean                                                                                                                                    | No        | `false`                | Automatically block any third-party requests. (This can make your pages load faster by not loading non-essential scripts, styles, or fonts.)                                                                                                                          |
| consoleHandler                                                                                                         | function(route: String, message: [ConsoleMessage](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-consolemessage)) | No        | None                   | Allows you to provide a custom console.* handler for pages. Argument one to your function is the route being rendered, argument two is the [Puppeteer ConsoleMessage](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-consolemessage) object. |
| [[Puppeteer Launch Options]](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions) | ?                                                                                                                                          | No        | None                   | Any additional options will be passed to `puppeteer.launch()`, such as `headless: false`.                                                                                                                                                                             |

---

### `@prerenderer/renderer-jsdom` options

| Option                   | Type                   | Required? | Default                  | Description                                                                                                                                                                                         |
|--------------------------|------------------------|-----------|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| maxConcurrentRoutes      | Number                 | No        | 0 (No limit)             | The number of routes allowed to be rendered at the same time. Useful for breaking down massive batches of routes into smaller chunks.                                                               |
| inject                   | Object                 | No        | None                     | An object to inject into the global scope of the rendered page before it finishes loading. Must be `JSON.stringifiy`-able. The property injected to is `window['__PRERENDER_INJECTED']` by default. |
| injectProperty           | String                 | No        | `__PRERENDER_INJECTED` | The property to mount `inject` to during rendering.                                                                                                                                                 |
| renderAfterDocumentEvent | String                 | No        | None                     | Wait to render until the specified event is fired on the document. (You can fire an event like so: `document.dispatchEvent(new Event('custom-render-trigger'))`                                     |
| renderAfterElementExists | String (Selector)      | No        | None                     | Wait to render until the specified element is detected using `document.querySelector`                                                                                                               |
| renderAfterTime          | Integer (Milliseconds) | No        | None                     | Wait to render until a certain amount of time has passed.                                                                                                                                           |

---

## Tips & Troubleshooting

### JS not firing before prerender?

If you have code that relies on the existence of `<body>` (and you almost certainly do), simply run it in a callback to the `DOMContentLoaded` event:
*(Otherwise you'll find that `prerender-spa-plugin-next` will output the contents of your page before your JS runs.)*

```js
document.addEventListener('DOMContentLoaded', function () {
  // your code
})
```

For example, if you're using Vue.js and mounting to a `<div id="app">` in `<body>`:

``` js
const root = new Vue({
  // ...
})

document.addEventListener('DOMContentLoaded', function () {
  root.$mount('#app')
})
```

### Inline Styles

If you rely on inline CSS, i.e. you do not extract CSS from your bundle and, thus, experience duplicate CSS style tags, consider using [extract-text-webpack-plugin](https://github.com/webpack-contrib/extract-text-webpack-plugin) to extract CSS into a separate file and then either inject CSS back into a `template.html` file using [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) or just call it as an external CSS file.

Either way, there will not be any unnecessary styles inside JS.

### Caveats

- For obvious reasons, `prerender-spa-plugin-next` only works for SPAs that route using the HTML5 history API. `index.html#/hash/route` URLs will unfortunately not work.
- Whatever client-side rendering library you're using should be able to at least replace any server-rendered content or diff with it.
  - For **Vue.js 1** use [`replace: false`](http://vuejs.org/api/#replace) on root components.
  - For **Vue.js 2**  Ensure your root component has the same id as the prerendered element it's replacing. Otherwise you'll end up with duplicated content.

---

## Alternatives

- [react-snap](https://github.com/stereobooster/react-snap) - Zero-configuration framework-agnostic prerendering. Does not depend on webpack. Handles a variety of edge-cases.
- [snapshotify](https://github.com/errorception/snapshotify) - An experimental prerenderer that performes a number of speed optimizations.
- [presite](https://github.com/egoist/presite) - Minimal-configuration framework-agnostic prerendering.
- [prerenderer](https://github.com/tribex/prerenderer) - Pluggable prerendering library that `prerender-spa-plugin-next` `v3+` is based on.

## License (MIT)

```
Copyright (c) 2017 Chris Fritz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Maintainers

<table>
  <tbody>
    <tr>
      <td align="center">
        <a href="https://github.com/tofandel">
          <img width="150" height="150" src="https://github.com/tofandel.png?v=3&s=150">
          </br>
          Adrien Foulon
        </a>
      </td>
    </tr>
  <tbody>
</table>
