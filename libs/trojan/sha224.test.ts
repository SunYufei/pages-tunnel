import { expect, it } from 'vitest'
import { SHA224 } from './sha224'

it('sha224', () => {
   expect(SHA224.encode('ca110us')).equals(
      '08f32643dbdacf81d0d511f1ee24b06de759e90f8edf742bbdc57d88',
   )
   expect(SHA224.encode('trojan')).equals(
      '07f3019e36783ac5253649a9aa621ba3287b0b7b4e8db6c5c5519444',
   )
})
