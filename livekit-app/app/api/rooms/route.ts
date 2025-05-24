import { NextResponse } from 'next/server'
import { AccessToken } from 'livekit-server-sdk'

export const revalidate = 0

export async function GET() {
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  const host = process.env.LIVEKIT_URL || 'http://localhost:7880'

  if (!apiKey || !apiSecret || !host) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  try {
    // 管理権限付きトークン発行
    const at = new AccessToken(apiKey, apiSecret, {
      identity: 'admin',
    })

    at.addGrant({
      roomList: true,
      roomAdmin: true,
    })

    const token = await at.toJwt()

    // POST to Twirp RPC endpoint
    const res = await fetch(`${host}/twirp/livekit.RoomService/ListRooms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}) // ← 空の JSON ボディで全ルーム一覧
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('❌ Fetch failed:', res.status, errorText)
      return NextResponse.json({ error: 'Failed to fetch room list', detail: errorText }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({ rooms: data.rooms })

  } catch (err: any) {
    console.error('💥 Unexpected error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
