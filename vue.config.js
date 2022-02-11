module.exports = {
    lintOnSave: false,
    transpileDependencies: ["vue-meta"],
    configureWebpack: {
        module: {
            rules: [
                {
                    test: /\.mjs$/,
                    include: /node_modules/,
                    type: "javascript/auto",
                },
            ],
        },
    },
}
