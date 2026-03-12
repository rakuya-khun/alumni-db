import * as crypto from 'crypto'
import * as fs from 'fs'
import { logger } from './logger'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 32
const KEY_LENGTH = 32
const ITERATIONS = 100000

/**
 * Derive a 256-bit key from a passphrase using PBKDF2.
 */
function deriveKey(passphrase: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(passphrase, salt, ITERATIONS, KEY_LENGTH, 'sha512')
}

/**
 * Get a machine-specific passphrase for encrypting the auth cache.
 * Uses a combination of hostname + username as a seed, hashed.
 */
function getMachinePassphrase(): string {
  const os = require('os')
  const seed = `alumni-db:${os.hostname()}:${os.userInfo().username}`
  return crypto.createHash('sha256').update(seed).digest('hex')
}

/**
 * Encrypt plaintext using AES-256-GCM.
 * Output format: salt(32) + iv(16) + authTag(16) + ciphertext
 */
export function encrypt(plaintext: string, passphrase?: string): Buffer {
  const pass = passphrase ?? getMachinePassphrase()
  const salt = crypto.randomBytes(SALT_LENGTH)
  const key = deriveKey(pass, salt)
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return Buffer.concat([salt, iv, authTag, encrypted])
}

/**
 * Decrypt buffer encrypted by encrypt().
 * Expects format: salt(32) + iv(16) + authTag(16) + ciphertext
 */
export function decrypt(data: Buffer, passphrase?: string): string {
  const pass = passphrase ?? getMachinePassphrase()
  const salt = data.subarray(0, SALT_LENGTH)
  const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const authTag = data.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH)
  const ciphertext = data.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH)

  const key = deriveKey(pass, salt)
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return decrypted.toString('utf8')
}

/**
 * Encrypt and write to file atomically.
 */
export function encryptToFile(filePath: string, plaintext: string): void {
  const encrypted = encrypt(plaintext)
  const tmpPath = filePath + '.tmp'
  fs.writeFileSync(tmpPath, encrypted)
  fs.renameSync(tmpPath, filePath)
  logger.info('crypto', `Wrote encrypted file: ${filePath}`)
}

/**
 * Read and decrypt from file.
 */
export function decryptFromFile(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) return null
    const data = fs.readFileSync(filePath)
    return decrypt(data)
  } catch (error) {
    logger.warn('crypto', `Failed to decrypt file: ${filePath}`, {
      error: (error as Error).message
    })
    return null
  }
}

/**
 * Encrypt a single value (e.g., SMTP password) for database storage.
 * Returns base64-encoded string.
 */
export function encryptValue(value: string): string {
  return encrypt(value).toString('base64')
}

/**
 * Decrypt a base64-encoded encrypted value.
 */
export function decryptValue(encoded: string): string {
  return decrypt(Buffer.from(encoded, 'base64'))
}
