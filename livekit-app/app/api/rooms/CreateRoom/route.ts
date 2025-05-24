import { NextRequest, NextResponse } from 'next/server'
import { createAdminToken } from '@/lib/livekit'

export async function POST(req: NextRequest) {
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  const host = process.env.LIVEKIT_URL || 'http://localhost:7880'

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'APIキー設定が不足しています' }, { status: 500 })
  }

  const body = await req.json()
  const roomName = body.name || 'test-room'

  const token = await createAdminToken(apiKey, apiSecret, {
    roomCreate: true
  })

  const res = await fetch(`${host}/twirp/livekit.RoomService/CreateRoom`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: roomName }),
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json({ error: 'CreateRoom failed', detail: data }, { status: res.status })
  }

  return NextResponse.json(data)
}
