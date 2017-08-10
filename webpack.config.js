const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

// Init common paths used by config
const path = require('path');
const PATHS = {
  app: path.join(__dirname, 'src'),
  build: path.join(__dirname, 'public'),
  stylesheets: [
    path.join(__dirname, 'src/scss', 'global.scss'),
    path.join(__dirname, 'src/components'),
  ],
};

// Standard build artifacts for all envs
module.exports = {
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
              importLoaders: 2, // Number of loaders applied before CSS loader
              sourceMap: true,
              localIdentName: '[name]-[local]--[hash:base64:5]',
            }
          }, {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
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
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            }
          }
        ],
        // use: ExtractTextPlugin.extract({
        //   fallback: 'style-loader',
        //   loader: [
        //     {
        //       loader: 'css-loader',
        //       options: {
        //         modules: true,
        //         importLoaders: 3,
        //         sourceMap: true,
        //       },
        //     }, {
        //       loader: 'postcss-loader',
        //       options: {
        //         browsers: 'last 2 version',
        //         sourceMap: true,
        //       },
        //     }, {
        //       loader: 'sass-loader',
        //       options: {
        //         // outputStyle: 'expanded',
        //         sourceMap: true,
        //         // sourceMapContents: true,
        //       },
        //     },
        //   ],
        // }),
        // }'style-loader', 'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader'),
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
  // plugins: {
  //   'autoprefixer': {},
  // },
  // postcss: [
  //     autoprefixer({
  //         browsers: ['last 2 versions'],
  //     }),
  // ],
}
