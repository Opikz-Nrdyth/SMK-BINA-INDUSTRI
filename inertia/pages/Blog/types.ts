// resources/js/Pages/Blog/types.ts
export interface Blog {
  id?: string
  judul: string
  slug: string
  konten: string
  ringkasan?: string
  thumbnail?: any
  status: 'draft' | 'published' | 'archived'
  kategori?: string
  tags?: string[]
  dilihat: number
  penulisId: string
  publishedAt?: string
  createdAt?: string
  updatedAt?: string
  penulis?: {
    id: string
    nama: string
    email: string
  }
}
