import { NextRequest, NextResponse } from 'next/server'
import { createAdminToken } from '@/lib/livekit'

export async function POST(req: NextRequest) {
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  const host = process.env.LIVEKIT_URL || 'http://localhost:7880'

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const body = await req.json()
  const room = body.name
  if (!room) {
    return NextResponse.json({ error: 'Missing room name' }, { status: 400 })
  }

  const token = await createAdminToken(apiKey, apiSecret, {
    roomCreate: true, // DeleteRoom も roomCreate 権限が必要
  })

  const res = await fetch(`${host}/twirp/livekit.RoomService/DeleteRoom`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ room }),
  })

  if (!res.ok) {
    const error = await res.text()
    return NextResponse.json({ error: 'Delete failed', detail: error }, { status: res.status })
  }

  return NextResponse.json({ ok: true })
}
