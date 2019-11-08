module.exports = {
    lintOnSave: false,
    configureWebpack: {
        node: {
            Buffer: true
        }
    },
    publicPath: '/',
    pwa: {
        workboxOptions: {
            skipWaiting: true,
            clientsClaim: true
        }
    }
}

