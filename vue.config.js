module.exports = {
    lintOnSave: false,
    configureWebpack: {
        node: {
            Buffer: true
        }
    },
    baseUrl: '/',
    pwa: {
        workboxOptions: {
            skipWaiting: true,
            clientsClaim: true
        }
    }
}

