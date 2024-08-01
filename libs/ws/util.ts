export const base64ToUint8Array = (base64: string) => {
   // URL RFC4648
   base64 = base64.replace(/-/g, '+').replace(/_/g, '/')
   const decode = atob(base64)
   return Uint8Array.from(decode, (c) => c.charCodeAt(0))
}
