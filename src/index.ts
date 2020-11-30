import { transformSync, TransformOptions } from 'esbuild'
import { extname, resolve } from 'path'
import { readFileSync, existsSync } from 'fs'

function getOptions(): TransformOptions {
  const tsconfigPath = resolve('tsconfig.json')
  const tsconfig = existsSync(tsconfigPath)
    ? JSON.parse(readFileSync(resolve('tsconfig.json'), 'utf-8'))
    : { compilerOptions: { target: 'es2018' } }

  return {
    format: 'cjs',
    target: tsconfig.compilerOptions?.target || 'es2018',
    sourcemap: true
  }
}

function loader(filename: string): string {
  const ext = extname(filename).slice(1)
  const overrides = {
    'template': 'text',
    'yml': 'text',
    'json': 'text'
  }
  return overrides[ext] || ext
}

export function process(content: string, filename: string) {
  const options = getOptions()

  const result = transformSync(content, {
    loader: loader(filename) as any,
    sourcefile: filename,
    ...options
  })

  return {
    code: result.js,
    map: {
      ...JSON.parse(result.jsSourceMap),
      sourcesContent: null,
    }
  }
}
