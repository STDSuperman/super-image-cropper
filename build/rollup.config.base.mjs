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
        dir: cjsOutput,
        format: 'cjs',
        sourcemap: true,
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
      plugins: [
        del({ targets: `${cjsOutput}/*` }),
        commonjs(),
        typescript(),
        terser(),
      ]
    },
    // ESM
    {
      input,
      output: {
        dir: esmOutput,
        format: 'es',
        sourcemap: true,
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
      plugins: [
        del({ targets: `${esmOutput}/*` }),
        commonjs(),
        typescript(),
        terser(),
      ]
    }
  ];
}