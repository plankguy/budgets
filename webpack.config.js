const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const { argv } = require('yargs');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const proxy = require('proxy-middleware');
const url = require('url');
// const hotMiddlewareScript = require('webpack-hot-middleware/client?noInfo=true&timeout=20000&reload=true');

// @TODO: make all these a importable object
const npmPackageConfig = require('./package.json');
const hoodieConfig = npmPackageConfig.hoodie;
// App Paths
const PATHS = {
  app: path.join(__dirname, 'src'),
  build: path.join(__dirname, 'public'),
  stylesheets: [
    path.join(__dirname, 'src/scss', 'global.scss'),
    path.join(__dirname, 'src/components'),
  ],
};
// Env
const SERVER_RENDER = process.env.SERVER_RENDER === 'true';
const IS_PRODUCTION = !!((argv.env && argv.env.production) || argv.p);
const IS_WATCHING = !!argv.watch;
if (process.env.NODE_ENV === undefined) {
  process.env.NODE_ENV = IS_PRODUCTION ? 'production' : 'development';
}
const DEV_URL = `http://${hoodieConfig.address}:${hoodieConfig.port}`; // 'http://localhost:8080';
const PROXY_URL = 'http://localhost:3030';

// Standard build artifacts for all envs
let webpackConfig = {
  context: __dirname,
  // @NOTE used below for hot realoading
  entry: {
    app: PATHS.app,
    // style: PATHS.stylesheets, // ??
  },
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
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true, // Enable  CSS Modules
              importLoaders: 3, // Number of loaders applied before CSS loader
              sourceMap: !IS_PRODUCTION,
              minimize: IS_PRODUCTION,
              localIdentName: '[name]-[local]_[hash:base64:5]',
            }
          }, {
            loader: 'postcss-loader',
            options: {
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
        ],
        // use: ExtractTextPlugin.extract({
        //   fallback: 'style-loader',
        //   loaders: [
        //     {
        //       loader: 'css-loader',
        //       options: {
        //         modules: true, // Enable  CSS Modules
        //         importLoaders: 3, // Number of loaders applied before CSS loader
        //         sourceMap: !IS_PRODUCTION,
        //         minimize: IS_PRODUCTION,
        //         localIdentName: '[name]-[local]_[hash:base64:5]',
        //       }
        //     }, {
        //       loader: 'postcss-loader',
        //       options: {
        //         sourceMap: !IS_PRODUCTION,
        //         plugins: () => [
        //           autoprefixer({
        //             browsers: [
        //               'last 3 version',
        //               'ie >= 10',
        //             ],
        //           }),
        //         ],
        //       }
        //     }, {
        //         loader: 'resolve-url',
        //         options: {
        //           sourceMap: !IS_PRODUCTION,
        //         }
        //     }, {
        //       loader: 'sass-loader',
        //       options: {
        //         sourceMap: !IS_PRODUCTION,
        //       }
        //     }
        //   ]
        // }),
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
      './src',
      'node_modules',
    ],
    enforceExtension: false,
  },
  resolveLoader: {
    moduleExtensions: ['-loader'],
  },
  plugins: [],
}

if (IS_WATCHING) {

  const proxyOptions = url.parse(`${DEV_URL}/hoodie`);
  proxyOptions.route = '/hoodie';

  const watchConfig = {
    // entry: {
    //   app: [
    //     `webpack-hot-middleware/client?reload=true`,
    //     // `webpack-hot-middleware/client?reload=true&noInfo=true&path=${DEV_URL}__webpack_hmr`,
    //     PATHS.app,
    //   ],
    // },
    // output: {
    //   pathinfo: true,
    //   publicPath: 'public',// PROXY_URL + '/',
    // },
    // devtool: '#cheap-module-source-map',
    // stats: false,
    plugins: [
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new BrowserSyncPlugin({
        logPrefix: npmPackageConfig.name, // Name is command line log
        open: false,                      // Open when launched
        target: DEV_URL,
        proxyUrl: PROXY_URL,
        port: 3030,
        watch: [path.join(__dirname, 'src/**/*')],
        delay: 500,
        server: {
          baseDir: ['public'],
          middleware: [proxy(proxyOptions)], // Proxy /hoodie to DEV_URL
        },
      })
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
  webpackConfig = merge(webpackConfig, watchConfig);
}

module.exports = webpackConfig;
