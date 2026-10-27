const path = require('path')

const babelRule = {
    test: /\.js$/,
    exclude: /node_modules/,
    use: 'babel-loader'
}

module.exports = [
    // Server build: Express routes and middleware, imported from the app's ssr.js
    {
        name: 'ssr',
        target: 'node18',
        entry: './lib/api/index.js',
        output: {
            path: path.resolve(__dirname, 'dist/ssr'),
            filename: 'index.js',
            library: {type: 'commonjs2'},
            clean: true
        },
        module: {rules: [babelRule]}
    },
    // Web build: utils and hooks, imported from the storefront's components
    {
        name: 'app',
        target: 'web',
        entry: './lib/index.js',
        output: {
            path: path.resolve(__dirname, 'dist/app'),
            filename: 'index.js',
            library: {type: 'commonjs2'},
            clean: true
        },
        devtool: 'source-map',
        externals: {react: 'react'},
        module: {rules: [babelRule]}
    }
]
