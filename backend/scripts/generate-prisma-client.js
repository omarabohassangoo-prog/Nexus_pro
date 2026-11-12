const { existsSync } = require('node:fs')
const { spawnSync } = require('node:child_process')
const path = require('node:path')

const prismaCli = path.resolve('node_modules/prisma/build/index.js')

if (!existsSync(prismaCli)) {
  process.exit(0)
}

const schema = process.env.VERCEL === '1'
  ? 'prisma/schema.vercel.prisma'
  : 'prisma/schema.prisma'

const result = spawnSync(process.execPath, [prismaCli, 'generate', '--schema', schema], {
  stdio: 'inherit',
})

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}
