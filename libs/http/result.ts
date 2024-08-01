import { HttpCode } from './code'
import { ContentType, HttpHeader } from './header'

export class Result {
   static json = (body: any, status = HttpCode.OK) =>
      new Response(JSON.stringify(body), {
         status: status,
         headers: { [HttpHeader.CONTENT_TYPE]: ContentType.JSON },
      })

   static error = (e: Error | unknown) => this.json(e, HttpCode.InternalServerError)

   static FORBIDDEN = new Response(null, { status: HttpCode.Forbidden })
}
