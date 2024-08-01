import { assert, it } from 'vitest'
import { base64ToUint8Array } from './util'

it('base64ToUint8Array', () => assert.equal(base64ToUint8Array('Y2hhdA==').length, 4))
