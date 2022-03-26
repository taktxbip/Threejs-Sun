const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const fs = require('fs');
const path = require('path');


module.exports = (env = {}, argv) => {

    const isProd = argv.mode === 'production';
    const isDev = argv.mode === 'development';

    const getStyleLoaders = () => {
        return [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader'
        ];
    };

    const runShell = () => {
        switch (process.platform) {
            case 'darwin': return [
            ];
            default: return [
            ];
        }
    };

    const generateHtmlPlugins = (templateDir) => {
        const templateFiles = fs.readdirSync(templateDir);
        const path = templateDir.split('/')[1];
        return templateFiles.map(item => {
            return new HtmlWebpackPlugin({
                filename: item,
                template: `${path}/views/${item}`,
                minify: false
            });
        });
    };

    const getPlugins = () => {
        const plugins = [
            // Remove dist folder
            new CleanWebpackPlugin(),
            ...generateHtmlPlugins('./public/views')
        ];
        if (isProd) {
            plugins.push(new MiniCssExtractPlugin({
                filename: 'main.css'
            }));
            plugins.push(
                new WebpackShellPluginNext({
                    onBuildEnd: {
                        scripts: runShell(),
                        blocking: false
                    }
                })
            );
        }
        return plugins;
    };

    return {
        mode: isProd ? 'production' : isDev && 'development',
        output: {
            filename: isProd ? 'main.js' : undefined,
            path: path.resolve(__dirname, 'dist')
        },
        module: {
            rules: [

                // Loading JS
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader'
                },

                // Loading Images
                {
                    test: /\.(png|jpeg|jpg|gif|svg|ico)$/,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            outputPath: 'images',
                            name: '[name].[ext]'
                        }
                    }]
                },

                // Loading Fonts
                {
                    test: /\.(ttf|otf|eot|woff|woff2)$/,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            outputPath: 'fonts',
                            name: '[name].[ext]'
                        }
                    }]
                },
                
                 // Shaders
                 {
                    test: /\.(glsl)$/,
                    exclude: /node_modules/,
                    use: ['raw-loader']
                },

                // Loading CSS
                {
                    test: /\.(css)$/,
                    use: [...getStyleLoaders(),
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                    ]
                },

                // Loading SCSS
                {
                    test: /\.(scss)$/,
                    use: [
                        ...getStyleLoaders(),
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: true
                            }
                        },
                        'sass-loader'
                    ]
                },
                {
                    test: /\.html$/,
                    include: path.resolve(__dirname, "public/includes"),
                    use: ["raw-loader"],
                },
            ]
        },

        plugins: getPlugins(),

        devServer: {
            open: true,
            historyApiFallback: true
        }
    };
};