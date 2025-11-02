const typescript = require('@rollup/plugin-typescript');
const pluginTerser = require('@rollup/plugin-terser');
const terser = pluginTerser.default; // <- this is the fix

module.exports = {
  input: 'src/main.ts',
  output: {
    file: 'dist/main.js',
    format: 'cjs',
  },
  plugins: [
    typescript(),
    terser()
  ]
};
