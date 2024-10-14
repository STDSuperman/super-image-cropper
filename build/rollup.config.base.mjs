import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import del from 'rollup-plugin-delete';

export const generateRollupConfig = (props) => {
  const { input, rootDir } = props;

  const cjsOutput = `${rootDir}/dist`;
  const esmOutput = `${rootDir}/esm`
  
  return [
    // CJS
    {
      input,
      output: {
        file: `${cjsOutput}/index.js`,
        format: 'cjs',
        sourcemap: true,
      },
      plugins: [
        del({ targets: `${cjsOutput}/*` }),
        resolve(),
        commonjs(),
        typescript(),
        terser(),
      ]
    },
    // ESM
    {
      input,
      output: {
        file: `${esmOutput}/index.js`,
        format: 'esm',
        sourcemap: true,
      },
      plugins: [
        del({ targets: `${esmOutput}/*` }),
        resolve(),
        commonjs(),
        typescript(),
        terser(),
      ]
    }
  ];
}