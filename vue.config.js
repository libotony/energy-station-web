const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = {
    lintOnSave: false,
    configureWebpack: {
        plugins: [new NodePolyfillPlugin({ additionalAliases: ['process'] })],
        resolve: {
            fallback: { fs: false, net: false, tls: false }
        }
    },
    publicPath: process.env.DEPLOY_BASE_PATH || '/',
    pwa: {
        iconPaths: {
            faviconSVG: null,
            appleTouchIcon: 'img/icons/apple-icon-152x152.png',
            maskIcon: null,
            msTileImage: 'img/icons/ms-icon-144x144.png'
        },
        workboxOptions: {
            skipWaiting: true,
            clientsClaim: true
        }
    }
}
