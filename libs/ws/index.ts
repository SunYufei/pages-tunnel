import { base64ToUint8Array } from './util'

// WebSocket ready state
const WS_READY_STATE_OPEN = 1
const WS_READY_STATE_CLOSING = 2

/**
 * WebSocket -> Stream
 */
export function makeReadableWebSocketStream(server: WebSocket, protocol: string | null) {
   let streamCanceled = false
   return new ReadableStream<ArrayBuffer>({
      start(controller) {
         if (protocol) {
            controller.enqueue(base64ToUint8Array(protocol))
         }

         server.addEventListener('message', (event) => {
            if (streamCanceled) {
               return
            }
            const data = event.data as ArrayBuffer
            controller.enqueue(data)
            console.log('WebSocket server read', data.byteLength, 'bytes')
         })

         server.addEventListener('close', () => {
            safeCloseWebSocket(server)
            if (streamCanceled) {
               return
            }
            controller.close()
         })

         server.addEventListener('error', (e) => {
            console.error('WebSocket server error:', e.message)
            controller.error(e)
         })
      },
      cancel(reason) {
         if (streamCanceled) {
            return
         }
         console.log('Readable WebSocket stream canceled,', reason)
         streamCanceled = true
         safeCloseWebSocket(server)
      },
   })
}

/**
 * Stream -> WebSocket
 */
export const makeWritableWebSocketStream = (server: WebSocket) =>
   new WritableStream<ArrayBuffer>({
      write(chunk: ArrayBuffer, controller) {
         if (server.readyState != WS_READY_STATE_OPEN) {
            controller.error('WebSocket server connection not open')
         }
         server.send(chunk)
         console.log('WebSocket server send', chunk.byteLength, 'bytes')
      },
      abort: (reason) => console.error('Writable WebSocket stream abort,', reason),
      close: () => console.log('Writable WebSocket stream closed'),
   })

/**
 * Safe close WebSocket without exceptions
 */
export function safeCloseWebSocket(socket: WebSocket) {
   try {
      if ([WS_READY_STATE_OPEN, WS_READY_STATE_CLOSING].includes(socket.readyState)) {
         socket.close()
      }
   } catch (e) {
      console.error('Safe close WebSocket error', e)
   }
}
