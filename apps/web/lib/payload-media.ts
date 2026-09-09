const PAYLOAD_URL = process.env.PAYLOAD_URL || "http://localhost:3001"

export async function uploadPayloadMedia(file: File, alt: string) {
  const mediaForm = new FormData()
  mediaForm.append("file", file, file.name)
  mediaForm.append("_payload", JSON.stringify({ alt }))

  const response = await fetch(`${PAYLOAD_URL}/api/media`, {
    method: "POST",
    body: mediaForm,
  })
  const data = (await response.json()) as {
    doc?: { id?: string }
    id?: string
    errors?: { message?: string }[]
    message?: string
  }
  if (!response.ok) {
    throw new Error(data?.errors?.[0]?.message || data?.message || "Falha ao enviar o arquivo.")
  }
  const id = data.doc?.id || data.id
  if (!id) {
    throw new Error("Upload não retornou um ID.")
  }
  return String(id)
}
