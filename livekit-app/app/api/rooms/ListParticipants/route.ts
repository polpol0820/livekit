import { NextRequest, NextResponse } from 'next/server'
import { createAdminToken } from '@/lib/livekit'

export async function GET(req: NextRequest) {
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  const host = process.env.LIVEKIT_URL || 'http://localhost:7880'

  const room = req.nextUrl.searchParams.get('room')
  if (!room) {
    console.error('[❌] Missing room parameter')
    return NextResponse.json({ error: 'Missing room parameter' }, { status: 400 })
  }

  if (!apiKey || !apiSecret || !host) {
    console.error('[❌] Server misconfigured')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  try {
    console.log('[🔐] Generating admin token for room:', room)
    const token = await createAdminToken(apiKey, apiSecret, {
      roomAdmin: true,
      room: room
    })

    console.log('[🔐] Token (first 30 chars):', token)

    const res = await fetch(`${host}/twirp/livekit.RoomService/ListParticipants`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ room }),
    })

    const text = await res.text()
    console.log('[📨] Raw response text:', text)

    let data
    try {
      data = JSON.parse(text)
    } catch {
      console.error('[❌] Failed to parse JSON from LiveKit')
      return NextResponse.json({ error: 'Invalid JSON from LiveKit' }, { status: 500 })
    }

    if (!res.ok) {
      console.error('[❌] ListParticipants failed:', res.status, data)
      return NextResponse.json({ error: 'Failed to list participants', detail: data }, { status: res.status })
    }

    console.log('[✅] Participants received:', data.participants.length)
    return NextResponse.json({ participants: data.participants })
  } catch (err: any) {
    console.error('💥 Unexpected error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
