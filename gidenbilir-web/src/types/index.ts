/**
 * API tipi tanımları — backend Perspektif.API DTO'larıyla eşleşir.
 * Kaynak: backend/Perspektif.API/Models/ ve mobile/perspektif/src/services/api.ts
 */

export interface AuthUser {
  userId: number
  fullName: string
  email: string
  nationalityCode: string
  nationalityFlag: string
  token: string
}

export interface Nationality {
  id: number
  name: string
  code?: string
  flagEmoji: string
}

export interface Country {
  id: number
  name: string
  code?: string
  flagEmoji: string
}

export interface Category {
  id: number
  name: string
  icon: string
}

export type BudgetLevel = 'Ucuz' | 'Orta' | 'Pahalı'

export interface ExperiencePhoto {
  id: number
  cloudinaryUrl: string
  publicId: string
  order: number
}

export interface Experience {
  id: number
  title: string
  description: string
  rating: number
  visitDate: string | null
  createdAt: string

  // Author
  authorId: number
  authorName: string
  authorNationality: string
  authorNationalityFlag: string

  // Location
  countryName: string
  countryFlag: string
  city: string | null

  // Category
  categoryName: string
  categoryIcon: string

  // Meta
  budgetLevel: BudgetLevel | null
  photoUrls: string[]
  likeCount: number
  isLikedByMe: boolean
}

export interface Comment {
  id: number
  text: string
  createdAt: string
  userId: number
  authorFullName: string
  authorNationalityFlag: string | null
}

export interface PagedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  hasNextPage: boolean
}

// Filtre parametreleri
export interface ExperienceFilters {
  countryId?: number
  nationalityId?: number
  categoryId?: number
  search?: string
  minRating?: number
  city?: string
  budgetLevel?: BudgetLevel
  sortBy?: 'newest' | 'oldest' | 'popular'
  page?: number
  pageSize?: number
}

export interface CreateExperienceInput {
  title: string
  description: string
  rating: number
  countryId?: number
  categoryId?: number
  visitDate?: string
  city?: string
  budgetLevel?: BudgetLevel
}

export interface UpdateExperienceInput {
  title: string
  description: string
  rating: number
  categoryId: number
}

// Messaging
export interface Message {
  id: number
  content: string
  senderId: number
  senderName: string
  createdAt: string
}

export interface Conversation {
  id: number
  otherUserId: number
  otherUserName: string
  otherUserNationalityFlag: string
  lastMessage: string
  lastMessageAt: string
  lastSenderId: number | null
}

// === Profile ===
export interface UserStats {
  userId: number
  fullName: string
  email: string
  nationalityCode: string
  nationalityFlag: string
  createdAt: string
  experienceCount: number
  totalLikes: number
  averageRating: number
}

export interface UpdateProfileInput {
  fullName: string
  nationalityId: number
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export interface DeleteAccountInput {
  password: string
}
