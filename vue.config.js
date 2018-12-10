module.exports = {
    lintOnSave: false,

    configureWebpack: {
        node: {
            Buffer: true
        }
    },

    baseUrl: process.env.NODE_ENV === 'production' ? '/energy-station/': '/',
    outputDir: undefined,
    assetsDir: undefined,
    runtimeCompiler: undefined,
    productionSourceMap: undefined,
    parallel: undefined,
    css: undefined
}

