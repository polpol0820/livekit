// app/rooms/page.tsx
'use client'

import { useEffect, useState } from 'react'

type Room = {
  name: string
  numParticipants: number
  creationTime?: string
}

export default function RoomListPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('/api/rooms')
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || '読み込みに失敗しました')
        } else {
          setRooms(data.rooms)
        }
      } catch (err) {
        setError('通信エラー')
      }
    }

    fetchRooms()
  }, [])

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">現在のルーム一覧</h1>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : rooms.length === 0 ? (
        <p>現在アクティブなルームはありません。</p>
      ) : (
        <ul className="space-y-3">
          {rooms.map((room) => (
            <li
              key={room.name}
              className="border rounded-md p-4 shadow-sm hover:shadow transition"
            >
              <div className="text-lg font-semibold">{room.name}</div>
              <div className="text-sm text-gray-600">
                参加者数: {room.numParticipants}
              </div>
              <div className="text-sm text-gray-400">
                作成時刻: {room.creationTime}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
