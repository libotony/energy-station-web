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
            navigateFallback: '/404.html',
            skipWaiting: true,
            clientsClaim: true
        }
    }
}

