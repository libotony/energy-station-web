module.exports = {
    lintOnSave: false,
    configureWebpack: {
        node: {
            Buffer: true
        }
    },
    baseUrl: process.env.NODE_ENV === 'production' ? '/energy-station/': '/',
}

