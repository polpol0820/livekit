import { AccessToken } from 'livekit-server-sdk'

export function createAdminToken(
  apiKey: string,
  apiSecret: string,
  grants: Record<string, any> // ← or RoomServiceGrant if認識されていれば
): Promise<string> {
  const token = new AccessToken(apiKey, apiSecret, {
    identity: 'admin',
  })

  console.log('[🔧] Grant passed to addGrant:', grants)
  token.addGrant(grants)

  return token.toJwt()
}
