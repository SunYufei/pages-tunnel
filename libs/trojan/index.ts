import { HttpCode } from 'libs/http'
import { makeReadableWebSocketStream, makeWritableWebSocketStream } from 'libs/ws'
import { parseTrojanHeader, TrojanHeader } from './header'

let header: TrojanHeader

export function trojanOverWebSocketHandler(protocol: string | null, password: string) {
   const [client, server] = Object.values(new WebSocketPair())
   server.accept()
   //
   makeReadableWebSocketStream(server, protocol)
      .pipeThrough(makeHandleHeaderStream(password))
      .pipeTo(makeWritableWebSocketStream(server))
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
