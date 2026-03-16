import { dirname, resolve as _resolve } from 'path';
import { fileURLToPath } from 'url';
import TerserPlugin from 'terser-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mode = process.argv.includes('--mode=production') ? 'production' : 'development';

export default {
  mode: mode,
  resolve: {
    alias: {
      '@assets': _resolve(__dirname, 'src/assets'),
      '@components': _resolve(__dirname, 'src/scripts/components'),
      '@mixins': _resolve(__dirname, 'src/scripts/mixins'),
      '@models': _resolve(__dirname, 'src/scripts/models'),
      '@root': _resolve(__dirname, './'),
      '@scripts': _resolve(__dirname, 'src/scripts'),
      '@services': _resolve(__dirname, 'src/scripts/services'),
      '@styles': _resolve(__dirname, 'src/styles'),
    },
  },
  optimization: {
    minimize: mode === 'production',
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: mode === 'production',
          },
        },
      }),
    ],
  },
  entry: {
    main: './src/entries/dist.js',
  },
  output: {
    filename: 'index.js',
    path: _resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { importLoaders: 1 },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: mode === 'production'
                  ? [['cssnano', { preset: 'default' }]]
                  : [],
              },
            },
          },
        ],
      },
    ],
  },
  stats: {
    colors: true, // Enable colored console output
  },
  ...(mode !== 'production' && { devtool: 'eval-cheap-module-source-map' }),
};
