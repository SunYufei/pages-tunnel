import { SHA224 } from './sha224'

// command
const CONNECT = 1
// const UDP = 3
// address type
const IPv4 = 1
const DOMAIN_NAME = 3
const IPv6 = 4

export interface TrojanHeader {
   address: string
   port: number
   payloadIndex: number
}

export function parseTrojanHeader(buffer: ArrayBuffer, password: string): TrojanHeader {
   if (buffer.byteLength < 56) {
      throw new Error('Invalid header length')
   }
   // 0, +56 sha224 password
   const shaPwd = new TextDecoder().decode(buffer.slice(0, 56))
   if (shaPwd != SHA224.encode(password)) {
      throw new Error('Password not matched')
   }
   // 56, +2 CRLF
   const crlf = new Uint8Array(buffer.slice(56, 58))
   if (crlf[0] != 0x0d || crlf[1] != 0x0a) {
      throw new Error('Invalid header format, missing CRLF')
   }
   // 58, +1 command
   const command = new DataView(buffer, 58, 1).getUint8(0)
   if (command != CONNECT) {
      throw new Error('Unsupported command, only TCP (CONNECT) is allowed')
   }
   // 59, +1 address type
   const addressType = new DataView(buffer, 59, 1).getUint8(0)
   // 60, +M address
   let addressLength = 0
   let addressIndex = 60
   let address: string | null = null
   if (addressType == IPv4) {
      addressLength = 4
      address = new Uint8Array(buffer.slice(addressIndex, addressIndex + addressLength)).join('.')
   } else if (addressType == DOMAIN_NAME) {
      addressLength = new DataView(buffer, addressIndex, 1).getUint8(0)
      addressIndex += 1
      address = new TextDecoder().decode(buffer.slice(addressIndex, addressIndex + addressLength))
   } else if (addressType == IPv6) {
      addressLength = 16
      const view = new DataView(buffer, addressIndex, addressLength)
      address = Array.from({ length: 8 }, (_, i) => view.getUint16(i * 2).toString(16)).join(':')
   }
   if (address == null) {
      throw new Error(`Invalid address type ${addressType}`)
   }
   // 60+M, +2 port
   const portIndex = addressIndex + addressLength
   const port = new DataView(buffer, portIndex, 2).getUint16(0)
   // 60+M+2, +2 CRLF
   // 60+M+4, +Y payload
   const payloadIndex = portIndex + 4
   //
   return { address, port, payloadIndex }
}
