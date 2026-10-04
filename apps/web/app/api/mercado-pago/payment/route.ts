import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json({ error: "As inscrições estão encerradas." }, { status: 403 })
}
