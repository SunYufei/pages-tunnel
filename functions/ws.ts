import { HttpCode, Result } from 'libs/http'
import { makeReadableWebSocketStream, makeWritableWebSocketStream } from 'libs/ws'

export const onRequestGet: PagesFunction = (context) => {
   const { request } = context
   if (request.headers.get('Upgrade') == 'websocket') {
      // WebSocket
      const [client, server] = Object.values(new WebSocketPair())
      server.accept()
      //
      makeReadableWebSocketStream(server, request.headers.get('Sec-WebSocket-Protocol'))
         .pipeTo(makeWritableWebSocketStream(server))
         .catch((e) => console.error('Readable WebSocket pipe error', e))
      //
      return new Response(null, {
         status: HttpCode.SwitchingProtocols,
         webSocket: client,
      })
   } else {
      // default
      return Result.FORBIDDEN
   }
}
