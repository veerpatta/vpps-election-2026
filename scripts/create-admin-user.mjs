import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { existsSync } from 'node:fs'
import { stdin, stdout } from 'node:process'

const adminEmail = process.env.ADMIN_EMAIL?.trim()

if (!adminEmail) {
  console.error('ADMIN_EMAIL is required. Example: ADMIN_EMAIL=raj@vpps.co.in npm run admin:create-user')
  process.exit(1)
}

function resolveCredential() {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS

  if (serviceAccountPath) {
    if (!existsSync(serviceAccountPath)) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS points to a missing file.')
    }
    return cert(serviceAccountPath)
  }

  return applicationDefault()
}

async function readHiddenPassword(promptText) {
  if (!stdin.isTTY || !stdout.isTTY) {
    throw new Error('Interactive password entry requires a local terminal. Set ADMIN_PASSWORD locally if needed.')
  }

  stdout.write(promptText)
  stdin.setRawMode(true)
  stdin.resume()
  stdin.setEncoding('utf8')

  return new Promise((resolve, reject) => {
    let password = ''

    function cleanup() {
      stdin.setRawMode(false)
      stdin.pause()
      stdin.off('data', onData)
    }

    function onData(char) {
      if (char === '\u0003') {
        cleanup()
        reject(new Error('Cancelled.'))
        return
      }

      if (char === '\r' || char === '\n') {
        cleanup()
        stdout.write('\n')
        resolve(password)
        return
      }

      if (char === '\u007f' || char === '\b') {
        password = password.slice(0, -1)
        return
      }

      password += char
    }

    stdin.on('data', onData)
  })
}

try {
  const app =
    getApps()[0] ??
    initializeApp({
      credential: resolveCredential(),
      projectId: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || 'vpps-election-2026',
    })

  const auth = getAuth(app)

  try {
    const existingUser = await auth.getUserByEmail(adminEmail)
    console.log(`Admin user already exists: ${existingUser.email}`)
    process.exit(0)
  } catch (error) {
    if (error?.code !== 'auth/user-not-found') {
      throw error
    }
  }

  const password = process.env.ADMIN_PASSWORD ?? (await readHiddenPassword('Enter admin password: '))

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters.')
  }

  const user = await auth.createUser({
    email: adminEmail,
    password,
    emailVerified: true,
    disabled: false,
  })

  console.log(`Admin user created: ${user.email}`)
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Unable to create admin user.')
  console.error('')
  console.error('Manual Firebase Auth user creation required:')
  console.error('1. Firebase Console > Authentication > Users.')
  console.error('2. Add user.')
  console.error(`3. Email: ${adminEmail}`)
  console.error('4. Enter the password manually.')
  console.error('5. Save.')
  process.exit(1)
}
