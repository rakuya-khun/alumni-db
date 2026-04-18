/**
 * Rebuild icon.ico with multiple sizes (16, 24, 32, 48, 64, 128, 256)
 * Extracts the 256x256 PNG from the existing .ico, resizes with jimp,
 * then manually constructs a proper multi-size ICO file.
 */
const fs = require('fs')
const path = require('path')
const Jimp = require('jimp')

const ICO_PATH = path.join(__dirname, '..', 'resources', 'icon.ico')
const SIZES = [16, 24, 32, 48, 64, 128, 256]

async function extractPngFromIco(icoPath) {
  const buf = fs.readFileSync(icoPath)
  const count = buf.readUInt16LE(4)
  // Read first entry's offset and size
  const entryOffset = 6
  const dataSize = buf.readUInt32LE(entryOffset + 8)
  const dataOffset = buf.readUInt32LE(entryOffset + 12)
  return buf.slice(dataOffset, dataOffset + dataSize)
}

async function buildIco(pngBuffers) {
  // ICO header: 6 bytes
  const count = pngBuffers.length
  const headerSize = 6
  const dirSize = count * 16
  let dataOffset = headerSize + dirSize

  // Build directory entries
  const dirEntries = []
  for (let i = 0; i < count; i++) {
    const { size, buffer } = pngBuffers[i]
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0)   // width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1)   // height (0 = 256)
    entry.writeUInt8(0, 2)   // palette
    entry.writeUInt8(0, 3)   // reserved
    entry.writeUInt16LE(1, 4)   // color planes
    entry.writeUInt16LE(32, 6)  // bits per pixel
    entry.writeUInt32LE(buffer.length, 8)   // data size
    entry.writeUInt32LE(dataOffset, 12)     // data offset
    dirEntries.push(entry)
    dataOffset += buffer.length
  }

  // Build header
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)     // reserved
  header.writeUInt16LE(1, 2)     // type: ICO
  header.writeUInt16LE(count, 4) // image count

  return Buffer.concat([
    header,
    ...dirEntries,
    ...pngBuffers.map(p => p.buffer)
  ])
}

async function main() {
  console.log('Extracting 256x256 PNG from existing ICO...')
  const pngData = await extractPngFromIco(ICO_PATH)

  console.log('Loading image with Jimp...')
  const image = await Jimp.read(pngData)

  console.log('Generating sizes:', SIZES.join(', '))
  const pngBuffers = []
  for (const size of SIZES) {
    const resized = image.clone().resize(size, size, Jimp.RESIZE_LANCZOS3)
    const buffer = await resized.getBufferAsync(Jimp.MIME_PNG)
    pngBuffers.push({ size, buffer })
    console.log(`  ${size}x${size}: ${buffer.length} bytes`)
  }

  console.log('Building multi-size ICO...')
  const ico = await buildIco(pngBuffers)

  // Backup original
  const backupPath = ICO_PATH + '.bak'
  fs.copyFileSync(ICO_PATH, backupPath)
  console.log(`Backed up original to ${backupPath}`)

  fs.writeFileSync(ICO_PATH, ico)
  console.log(`Wrote new icon.ico (${ico.length} bytes) with ${SIZES.length} sizes`)

  // Verify
  const verify = fs.readFileSync(ICO_PATH)
  const verifyCount = verify.readUInt16LE(4)
  console.log(`\nVerification: ICO contains ${verifyCount} images`)
  for (let i = 0; i < verifyCount; i++) {
    const off = 6 + i * 16
    let w = verify.readUInt8(off)
    let h = verify.readUInt8(off + 1)
    if (w === 0) w = 256
    if (h === 0) h = 256
    const bpp = verify.readUInt16LE(off + 6)
    const sz = verify.readUInt32LE(off + 8)
    console.log(`  ${w}x${h} @ ${bpp}bpp (${sz} bytes)`)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
