/**
 * API client — mobile/perspektif/src/services/api.ts'tan port edilmiştir.
 * Mobil farkları:
 *   - AsyncStorage → cookie (JWT httpOnly cookie'de tutuluyor, server'da okunuyor)
 *   - Client tarafında token erişimi yok; auth state Zustand'da
 *   - Native multipart upload → tarayıcı File API'si
 */

import axios, { type AxiosInstance } from 'axios'
import type {
  AuthUser,
  Category,
  ChangePasswordInput,
  Comment,
  Conversation,
  Country,
  CreateExperienceInput,
  DeleteAccountInput,
  Experience,
  ExperienceFilters,
  Message,
  Nationality,
  PagedResponse,
  UpdateExperienceInput,
  UpdateProfileInput,
  UserStats,
} from '@/types'

// Tarayıcıda Next.js rewrite'ı kullan: /api/backend/* → backend'e proxy
// Bu sayede CORS sorunu olmaz ve cookie aynı origin'de paylaşılır.
const BROWSER_BASE_URL = '/api/backend'

// Server tarafında doğrudan backend URL'sini kullan
const SERVER_BASE_URL = (process.env.API_URL ?? 'http://localhost:5208') + '/api'

const baseURL = typeof window === 'undefined' ? SERVER_BASE_URL : BROWSER_BASE_URL

export const api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true, // httpOnly cookie'leri göndersin
})

// Server-side: header'dan token forward etmek için optional helper
export function setAuthHeader(token: string | null): void {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

// 401 → client tarafında auth store temizlenecek (interceptor olay yayar)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }
    return Promise.reject(error)
  },
)

// === Auth ===
export const loginRequest = (email: string, password: string) =>
  api.post<AuthUser>('/auth/login', { email, password })

export const registerRequest = (
  fullName: string,
  email: string,
  password: string,
  nationalityId: number,
) => api.post<AuthUser>('/auth/register', { fullName, email, password, nationalityId })

export const meRequest = () => api.get<AuthUser>('/auth/me')

// === Profile / Account ===
export const getUserStats = (userId: number) =>
  api.get<UserStats>(`/auth/stats/${userId}`)

export const updateProfile = (data: UpdateProfileInput) =>
  api.put<AuthUser>('/auth/profile', data)

export const changePassword = (data: ChangePasswordInput) =>
  api.put<{ message: string }>('/auth/password', data)

export const deleteAccount = (data: DeleteAccountInput) =>
  api.delete<{ message: string }>('/auth/account', { data })

// === Lookups ===
// Backend LookupDto üçüncü alanı farklı versiyonlarda 'extra' veya 'flagEmoji' olarak dönebilir.
interface RawLookup { id: number; name: string; flagEmoji?: string; extra?: string; icon?: string }

const normalizeLookup = (item: RawLookup) => ({
  ...item,
  flagEmoji: item.flagEmoji ?? item.extra ?? '',
  icon: item.icon ?? item.extra ?? '',
})

export const getNationalities = () =>
  api.get<RawLookup[]>('/lookups/nationalities').then(r => ({ ...r, data: r.data.map(normalizeLookup) as Nationality[] }))

export const getCountries = () =>
  api.get<RawLookup[]>('/lookups/countries').then(r => ({ ...r, data: r.data.map(normalizeLookup) as Country[] }))

export const getCategories = () =>
  api.get<RawLookup[]>('/lookups/categories').then(r => ({ ...r, data: r.data.map(normalizeLookup) as Category[] }))

// === Experiences ===
export const getExperiences = (params?: ExperienceFilters) =>
  api.get<PagedResponse<Experience>>('/experiences', { params })

export const getExperience = (id: number) => api.get<Experience>(`/experiences/${id}`)

export const getSimilarExperiences = (id: number) =>
  api.get<Experience[]>(`/experiences/${id}/similar`)

export const getUserExperiences = (userId: number) =>
  api.get<Experience[]>(`/experiences/user/${userId}`)

export const createExperience = (data: CreateExperienceInput) =>
  api.post<Experience>('/experiences', data)

export const updateExperience = (id: number, data: UpdateExperienceInput) =>
  api.put<Experience>(`/experiences/${id}`, data)

export const deleteExperience = (id: number) => api.delete(`/experiences/${id}`)

// === Likes ===
export const toggleLike = (experienceId: number) =>
  api.post<{ liked: boolean; likeCount: number }>(`/experiences/${experienceId}/like`)

// === Comments ===
export const getComments = (experienceId: number) =>
  api.get<Comment[]>(`/experiences/${experienceId}/comments`)

export const addComment = (experienceId: number, text: string) =>
  api.post<Comment>(`/experiences/${experienceId}/comments`, { text })

export const deleteComment = (experienceId: number, commentId: number) =>
  api.delete(`/experiences/${experienceId}/comments/${commentId}`)

// === Photo Upload ===
/**
 * Multipart upload — mobil ImagePicker yerine tarayıcı File API'si kullanır.
 * Backend endpoint: POST /api/uploads/experience/{id}
 */
export const uploadExperiencePhoto = (experienceId: number, file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`/uploads/experience/${experienceId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const getExperiencePhotos = (experienceId: number) =>
  api.get<{ id: number; url: string; order: number }[]>(`/experiences/${experienceId}/photos`)

export const deleteExperiencePhoto = (photoId: number) =>
  api.delete(`/uploads/photo/${photoId}`)

// === Messaging ===
export const getConversations = () =>
  api.get<Conversation[]>('/conversations')

export const startConversation = (participantId: number) =>
  api.post<Conversation>('/conversations', { participantId })

export const getConversationMessages = (conversationId: number) =>
  api.get<{ items: Message[]; page: number; pageSize: number; totalCount: number; hasNextPage: boolean }>(`/conversations/${conversationId}/messages`)

export const sendMessage = (conversationId: number, text: string) =>
  api.post<Message>(`/conversations/${conversationId}/messages`, { content: text })

export const deleteMessage = (conversationId: number, messageId: number) =>
  api.delete(`/conversations/${conversationId}/messages/${messageId}`)

export default api
