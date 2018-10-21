module.exports = {
    lintOnSave: false,

    configureWebpack: {
        node: {
            Buffer: true
        }
    },

    baseUrl: './',
    outputDir: undefined,
    assetsDir: undefined,
    runtimeCompiler: undefined,
    productionSourceMap: undefined,
    parallel: undefined,
    css: undefined
}

