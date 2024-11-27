// import { ref } from 'vue'
// import { useStomp } from './useStomp'
// import { useAuth } from '../auth/useAuth'

// export const useChatRooms = () => {
//   const chatRooms = ref([])
//   const currentRoom = ref(null)
//   const loading = ref(false)
//   const error = ref(null)

//   // Auth composable에서 토큰 가져오기
//   const { getToken } = useAuth()
//   const { subscribeToChatRoom } = useStomp()

//   // 채팅방 목록 조회
//   const fetchChatRooms = async (userId, page = 0, size = 30) => {
//     loading.value = true
//     try {
//       // Authorization 헤더 추가
//       const token = getToken()
//       if (!token) {
//         throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.')
//       }

//       const response = await fetch(
//         `/api/chat/list?userId=${userId}&page=${page}&size=${size}`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         }
//       )

//       if (!response.ok) {
//         throw new Error(`HTTP 에러! 상태 코드: ${response.status}`)
//       }
//       const data = await response.json()
//       chatRooms.value = data.content || []
//     } catch (err) {
//       console.error('[useChatRooms] 채팅방 목록 조회 실패:', err)
//       error.value = err
//     } finally {
//       loading.value = false
//     }
//   }

//   // 특정 채팅방 메시지 조회
//   const fetchChatRoom = async (roomId, userId, page = 0, size = 50) => {
//     try {
//       const token = getToken()
//       if (!token) {
//         throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.')
//       }

//       const response = await fetch(
//         `/api/chat/list?chatRoomId=${roomId}&userId=${userId}&page=${page}&size=${size}`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         }
//       )
      
//       if (!response.ok) {
//         throw new Error(`HTTP 에러! 상태 코드: ${response.status}`)
//       }
//       const data = await response.json()
//       currentRoom.value = data
//       return data
//     } catch (err) {
//       console.error('[useChatRooms] 채팅방 조회 실패:', err)
//       error.value = err
//       throw err
//     }
//   }

//   // 채팅방 생성 또는 입장
//   const createOrEnterChatRoom = async (productId, userId, page = 0, size = 50) => {
//     try {
//       const token = getToken()
//       if (!token) {
//         throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.')
//       }

//       const response = await fetch(`/api/chat/getChat`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//           'Authorization': `Bearer ${token}`
//         },
//         body: new URLSearchParams({
//           productId: productId,
//           userId: userId,
//           page: page.toString(),
//           size: size.toString()
//         })
//       })
      
//       if (!response.ok) {
//         throw new Error(`HTTP 에러! 상태 코드: ${response.status}`)
//       }

//       const data = await response.json()
//       currentRoom.value = data
//       return data
//     } catch (err) {
//       console.error('[useChatRooms] 채팅방 생성/입장 실패:', err)
//       error.value = err
//       throw err
//     }
//   }

//   // WebSocket을 통한 채팅방 입장
//   const enterChatRoom = async (roomId, userId, page = 0, size = 50) => {
//     try {
//       await subscribeToChatRoom(`/chat/enter/${roomId}`, {
//         userId,
//         page,
//         size
//       })
//     } catch (err) {
//       console.error('[useChatRooms] 채팅방 입장 실패:', err)
//       error.value = err
//       throw err
//     }
//   }

//   // 채팅방 나가기
//   const leaveChatRoom = async (roomId, userId, page = 0, size = 30) => {
//     try {
//       const token = getToken()
//       if (!token) {
//         throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.')
//       }

//       const response = await fetch(
//         `/api/chat/leave?chatRoomId=${roomId}&userId=${userId}&page=${page}&size=${size}`,
//         {
//           method: 'POST',
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         }
//       )
      
//       if (!response.ok) {
//         throw new Error(`HTTP 에러! 상태 코드: ${response.status}`)
//       }

//       const data = await response.json()
//       return data
//     } catch (err) {
//       console.error('[useChatRooms] 채팅방 나가기 실패:', err)
//       error.value = err
//       throw err
//     }
//   }

//   return {
//     chatRooms,
//     currentRoom,
//     loading,
//     error,
//     fetchChatRooms,
//     fetchChatRoom,
//     createOrEnterChatRoom,
//     enterChatRoom,
//     leaveChatRoom
//   }
// }

import { ref, watch } from 'vue'
import { useStomp } from './useStomp'
import { useAuth } from '../auth/useAuth'
import { useApi } from '../useApi'

export const useChatRooms = () => {
  const chatRooms = ref([])
  const currentRoom = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const currentSubscription = ref(null)

  const { getToken } = useAuth()
  const stomp = useStomp()
  const api = useApi()

  const fetchChatRooms = async () => {
    loading.value = true
    try {
      const response = await api.get('/chat/list')
      console.log('채팅방 목록 응답:', response)
      chatRooms.value = response.content || []
    } catch (err) {
      console.error('[useChatRooms] 채팅방 목록 조회 실패:', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // 채팅방 생성 또는 입장
  const createOrEnterChatRoom = async (productId) => {
    loading.value = true
    try {
      // URL 파라미터로 productId 전달
      const response = await api.post(`/chat/getChat?productId=${productId}`, null)
      
      console.log('채팅방 생성/입장 응답:', response)
      
      if (!response) {
        throw new Error('채팅방 생성/입장에 실패했습니다.')
      }

      currentRoom.value = response

      // WebSocket 연결 및 구독 설정
      if (stomp.connected.value && response.chatRoomId) {
        currentSubscription.value = await stomp.subscribeToChatRoom(
          response.chatRoomId,
          {
            onMessage: (message) => {
              if (currentRoom.value?.chatRoomId === response.chatRoomId) {
                if (!currentRoom.value.messages) {
                  currentRoom.value.messages = []
                }
                currentRoom.value.messages.push(message)
              }
            }
          }
        )
      }

      return response
    } catch (err) {
      console.error('[useChatRooms] 채팅방 생성/입장 실패:', err)
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  // cleanup 함수
  const cleanup = async () => {
    if (currentSubscription.value) {
      await stomp.unsubscribe(currentSubscription.value)
      currentSubscription.value = null
    }
    currentRoom.value = null
    chatRooms.value = []
  }

  return {
    chatRooms,
    currentRoom,
    loading,
    error,
    fetchChatRooms,
    createOrEnterChatRoom,
    cleanup
  }
}