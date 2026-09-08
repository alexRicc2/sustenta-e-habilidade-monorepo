function emv(id: string, value: string) {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`
}

function crc16(payload: string) {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0")
}

function compact(value: string, max: number) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .slice(0, max)
    .trim()
    .toUpperCase()
}

export function buildPixPayload(options: {
  key: string
  merchantName: string
  merchantCity: string
  amountCents: number
}) {
  const merchantAccount = emv(
    "26",
    `${emv("00", "br.gov.bcb.pix")}${emv("01", options.key)}`,
  )
  const payload =
    emv("00", "01") +
    emv("01", "11") +
    merchantAccount +
    emv("52", "0000") +
    emv("53", "986") +
    emv("54", (options.amountCents / 100).toFixed(2)) +
    emv("58", "BR") +
    emv("59", compact(options.merchantName, 25)) +
    emv("60", compact(options.merchantCity, 15)) +
    emv("62", emv("05", "***")) +
    "6304"

  return payload + crc16(payload)
}
