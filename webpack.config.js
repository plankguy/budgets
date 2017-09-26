const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const { argv } = require('yargs');
const autoprefixer = require('autoprefixer');
const proxy = require('proxy-middleware');
const url = require('url');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
// const hotMiddlewareScript = require('webpack-hot-middleware/client?noInfo=true&timeout=20000&reload=true');

// @TODO: make all these a importable object
const npmPackageConfig = require('./package.json');
const hoodieConfig = npmPackageConfig.hoodie;

/*
 * App Paths
 */
const PATHS = {
  app: path.join(__dirname, 'src'),
  build: path.join(__dirname, 'public'),
  stylesheets: [
    path.join(__dirname, 'src/scss', 'global.scss'),
    path.join(__dirname, 'src/components'),
  ],
};

/*
 * Environment variables
 */
const SERVER_RENDER = process.env.SERVER_RENDER === 'true';
const IS_PRODUCTION = !!((argv.env && argv.env.production) || argv.p);
const IS_WATCHING = !!argv.watch;
if (process.env.NODE_ENV === undefined) {
  process.env.NODE_ENV = IS_PRODUCTION ? 'production' : 'development';
}
const DEV_URL = `http://${hoodieConfig.address}:${hoodieConfig.port}`; // 'http://localhost:8080';
const PROXY_URL = 'http://localhost:3030';

/*
 * Configs
 */
const entryConfig = {
  app: PATHS.app,
  // style: PATHS.stylesheets, // ??
};
const styleLoaders = [
  {
    loader: 'css-loader',
    options: {
      modules: true, // Enable  CSS Modules
      importLoaders: 3, // Number of loaders applied before CSS loader
      sourceMap: !IS_PRODUCTION,
      minimize: IS_PRODUCTION,
      localIdentName: '[name]-[local]_[hash:base64:5]',
      autoprefixer: false,
    }
  }, {
    loader: 'postcss-loader',
    options: {
      ident: 'postcss',
      sourceMap: !IS_PRODUCTION,
      plugins: () => [
        autoprefixer({
          browsers: [
            'last 3 version',
            'ie >= 10',
          ],
        }),
      ],
    }
  }, {
      loader: 'resolve-url',
      options: {
        sourceMap: !IS_PRODUCTION,
      }
  }, {
    loader: 'sass-loader',
    options: {
      sourceMap: !IS_PRODUCTION,
    }
  }
];
if (IS_WATCHING) {
  styleLoaders.unshift('style-loader');
}

/*
 * Standard build artifacts for all envs
 */
const baseConfig = {
  context: __dirname,
  // @NOTE used below for hot realoading
  entry: entryConfig,
  output: {
    path: PATHS.build,
    filename: '[name].js',
  },
  devtool: "source-map", // any "source-map"-like devtool is possible
  module: {
    rules: [
      { // Convert React code into vanilla ES5
        test: /jsx?$/,
        // loader: 'babel-loader',
        use: [
          'react-hot-loader',
          'babel-loader',
        ],
        exclude: /node_modules/,
      },
      { // Transpile SASS and load CSS
        test: /\.scss$/,
        include: PATHS.stylesheets,
        use: IS_WATCHING ? styleLoaders : ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: styleLoaders,
       }),
      },
      { // Transfer static files to build
        test: /\.(png)$/,
        loader: 'file-loader?name=images/[name].[ext]',
      },
      { // Inline SVGs where required in components
        test: /\.svg$/,
        use: [
          'babel-loader',
          'svg-react-loader',
        ]
      }
    ]
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules',
    ],
    enforceExtension: false,
  },
  resolveLoader: {
    moduleExtensions: ['-loader'],
  },
  plugins: IS_WATCHING ? [] : [
    new ExtractTextPlugin({
      filename: 'global.css',
      ignoreOrder: true,
    })
  ],
};

/*
 * webpack-dev-server configuration
 */
const devServerConfig = {
  hot: true,
  port: 3030,
  contentBase: path.join(__dirname, 'public'), // 'public', //
  compress: true,
  proxy: {
    '/hoodie/**': DEV_URL,
  }
};
// Set proxy config object for Hoodie & BrowserSync
// const proxyOptions = url.parse(`${DEV_URL}/hoodie`);
// proxyOptions.route = '/hoodie';
// Set entry config for HMR
// const hotMiddlewareEntry = (entry) => {
//   const results = {};
//   const hotMiddlewareScript = 'webpack-hot-middleware/client?timeout=20000&reload=true';
//
//   Object.keys(entry).forEach((name) => {
//     results[name] = Array.isArray(entry[name]) ? entry[name].slice(0) : [entry[name]];
//     results[name].unshift(hotMiddlewareScript);
//   });
//
//   return results;
// };

const watchConfig = {
  entry: {
    // app: [
    //   'webpack-dev-server/client?${DEV_URL}',
    //   'webpack/hot/dev-server',
    //   // 'webpack-hot-middleware/client?timeout=20000&reload=true',
    //   // `webpack-hot-middleware/client?reload=true&noInfo=true&path=${DEV_URL}__webpack_hmr`,
    //   PATHS.app,
    // ], // hotMiddlewareEntry(entryConfig),
  },
  // output: {
  //   pathinfo: true,
  //   publicPath: 'public',// PROXY_URL + '/',
  // },
  devtool: '#cheap-module-source-map',
  // stats: false,
  devServer: devServerConfig,
  plugins: [
    // new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // new BrowserSyncPlugin({
    //   logPrefix: npmPackageConfig.name, // Name is command line log
    //   open: false,                      // Open when launched
    //   // reload: false,
    //   target: DEV_URL,
    //   proxyUrl: PROXY_URL,
    //   port: 3030,
    //   // watch: [path.join(__dirname, 'src/**/*')],
    //   delay: 500,
    //   server: {
    //     baseDir: ['public'],
    //     middleware: [proxy(proxyOptions)], // Proxy /hoodie to DEV_URL
    //   },
    // }, {
    //   reload: false,
    // })
  ],
};
/*
const addHotMiddleware = (entry) => {
  const results = {};

  Object.keys(entry).forEach((name) => {
    results[name] = Array.isArray(entry[name]) ? entry[name].slice(0) : [entry[name]];
    results[name].unshift(`${__dirname}/../helpers/hmr-client.js`);
  });

  return results;
};
webpackConfig.entry = addHotMiddleware({ app: PATHS.app });
*/

const webpackConfig = merge.smart(
  baseConfig,
  IS_WATCHING ? watchConfig : {}
);

module.exports = webpackConfig;
