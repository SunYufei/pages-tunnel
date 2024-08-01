import { Result } from 'libs/http'
import { trojanOverWebSocketHandler } from 'libs/trojan'
import { Env } from './env'

export const onRequestGet: PagesFunction<Env> = (context) => {
   const { env, request } = context
   if (request.headers.get('Upgrade') == 'websocket') {
      // WebSocket
      try {
         return trojanOverWebSocketHandler(
            request.headers.get('Sec-WebSocket-Protocol'),
            env.PASSWORD,
         )
      } catch (e) {
         return Result.error(e)
      }
   } else {
      // default
      return Result.FORBIDDEN
   }
}
