import { NextRequest, NextResponse } from 'next/server'
import { createAdminToken } from '@/lib/livekit'

export async function POST(req: NextRequest) {
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  const host = process.env.LIVEKIT_URL || 'http://localhost:7880'

  const body = await req.json()
  const { room, data, kind = 'RELIABLE', destination_identities = [], topic = '' } = body

  if (!room || !data) {
    return NextResponse.json({ error: 'Missing room or data' }, { status: 400 })
  }

  if (!apiKey || !apiSecret || !host) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  try {
    const token = await createAdminToken(apiKey, apiSecret, {
      room: room,
      roomAdmin: true,
    })

    const res = await fetch(`${host}/twirp/livekit.RoomService/SendData`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ room, data, kind, destination_identities, topic }),
    })

    const text = await res.text()
    console.log('[📩] SendData response:', text)

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to send data', detail: text }, { status: res.status })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('💥 Unexpected error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
