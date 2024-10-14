import { generateRollupConfig } from '../../build/rollup.config.base.mjs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default generateRollupConfig({
  input: path.resolve(__dirname, './src/index.ts'),
  rootDir: path.resolve(__dirname),
})