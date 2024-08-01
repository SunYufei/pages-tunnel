import { connect } from 'cloudflare:sockets'
import { HttpCode } from 'libs/http'
import {
   makeReadableWebSocketStream,
   makeWritableWebSocketStream,
   safeCloseWebSocket,
} from 'libs/ws'
import { parseTrojanHeader, TrojanHeader } from './header'

let header: TrojanHeader
let writer: WritableStreamDefaultWriter<ArrayBuffer>

export function trojanOverWebSocketHandler(protocol: string | null, password: string) {
   const [client, server] = Object.values(new WebSocketPair())
   server.accept()
   //
   makeReadableWebSocketStream(server, protocol)
      .pipeThrough(makeHandleHeaderStream(password))
      .pipeTo(makeHandlePayloadStream(server))
      .catch((e) => console.error('Readable WebSocket pipe error', e))
   //
   return new Response(null, {
      status: HttpCode.SwitchingProtocols,
      webSocket: client,
   })
}

const makeHandleHeaderStream = (password: string) =>
   new TransformStream<ArrayBuffer, ArrayBuffer>({
      transform(chunk, controller) {
         if (header) {
            controller.enqueue(chunk)
         } else {
            header = parseTrojanHeader(chunk, password)
            console.log('Trojan header', header)
            controller.enqueue(chunk.slice(header.payloadIndex))
         }
      },
   })

const makeHandlePayloadStream = (server: WebSocket) =>
   new WritableStream<ArrayBuffer>({
      write(chunk, controller) {
         if (writer) {
            writeToSocket(chunk)
         } else if (header) {
            const socket = connect({ hostname: header.address, port: header.port })
            writer = socket.writable.getWriter()
            console.log(`Create socket ${header.address}:${header.port}`)
            //
            writeToSocket(chunk)
            //
            socket.readable.pipeTo(makeWritableWebSocketStream(server)).catch((e) => {
               console.error('Socket to WebSocket error', e)
               safeCloseWebSocket(server)
            })
            //
            socket.closed
               .catch((e) => console.error('Socket close error', e))
               .finally(() => safeCloseWebSocket(server))
         } else {
            controller.error('Handle payload error, socket and header all null')
         }
      },
   })

function writeToSocket(chunk: ArrayBuffer) {
   if (writer) {
      writer.ready
         .then(() => writer.write(chunk))
         .then(() => console.log(`Write to socket ${chunk.byteLength} bytes`))
         .catch((e) => console.error('Write chunk to socket error', e))
   }
}
