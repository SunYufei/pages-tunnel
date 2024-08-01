import { HttpCode } from './code'
import { ContentType, HttpHeader } from './header'

export class Result {
   static json = (body: any, status = HttpCode.OK) =>
      new Response(JSON.stringify(body), {
         status: status,
         headers: { [HttpHeader.CONTENT_TYPE]: ContentType.JSON },
      })
}
