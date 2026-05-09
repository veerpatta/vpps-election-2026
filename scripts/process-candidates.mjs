import { spawn } from 'node:child_process'
import process from 'node:process'

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`))
    })
  })
}

async function main() {
  await run('node', ['scripts/extract-candidate-photos.mjs'])
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY required for portrait generation. Please set it, then tell me to continue.')
    process.exit(2)
  }
  await run('node', ['scripts/generate-candidate-portraits.mjs'])
  await run('node', ['scripts/import-real-candidates.mjs'])
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
