import { Result } from 'libs/http'

export const onRequestGet: PagesFunction = (context) => Result.json(context.request.cf)
