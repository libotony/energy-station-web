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
            navigateFallback: '/'
        }
    }
}

