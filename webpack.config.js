module.export = {
    entry: './src/jsx/main.js',
    output: {
        path: './src/js',
        filename: 'index.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['es2015', 'react']
                }
            }
        ]
    }
}