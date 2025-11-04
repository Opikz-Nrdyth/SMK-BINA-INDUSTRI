import Blog from '#models/blog'
import { blogValidator } from '#validators/blog'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import fs from 'node:fs/promises'

export default class BlogController {
  public async index({ request, inertia, session, auth }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '')
    const kategori = request.input('kategori', '')
    const status = request.input('status', '')

    const [totalBlogs] = await Promise.all([Blog.query().count('* as total').first()])

    const query = Blog.query().preload('penulis')

    // Filter berdasarkan role user
    if (auth.user?.role === 'Staf' || auth.user?.role === 'Guru') {
      query.where('penulis_id', auth.user.id)
    }

    if (search) {
      query.where((builder) => {
        builder
          .where('judul', 'LIKE', `%${search}%`)
          .orWhere('konten', 'LIKE', `%${search}%`)
          .orWhere('ringkasan', 'LIKE', `%${search}%`)
      })
    }

    if (kategori) {
      query.where('kategori', kategori)
    }

    if (status) {
      query.where('status', status)
    }

    const blogsPaginate = await query
      .orderBy('created_at', 'desc')
      .paginate(page, search ? Number(totalBlogs?.$extras.total) || 1 : 15)

    const blogs = blogsPaginate.all().map((item) => item.toJSON())

    // Ambil semua kategori untuk filter
    const kategoriList = await Blog.query().distinct('kategori').whereNotNull('kategori')

    return inertia.render('Blog/Index', {
      blogsPaginate: {
        currentPage: blogsPaginate.currentPage,
        lastPage: blogsPaginate.lastPage,
        total: blogsPaginate.total,
        perPage: blogsPaginate.perPage,
        firstPage: 1,
        nextPage:
          blogsPaginate.currentPage < blogsPaginate.lastPage ? blogsPaginate.currentPage + 1 : null,
        previousPage: blogsPaginate.currentPage > 1 ? blogsPaginate.currentPage - 1 : null,
      },
      blogs: blogs,
      kategoriList: kategoriList.map((k) => k.kategori),
      session: session.flashMessages.all(),
      searchQuery: search,
      filterKategori: kategori,
      filterStatus: status,
    })
  }

  public async create({ inertia, auth, session }: HttpContext) {
    const defaultValues = {
      status: 'draft',
      penulisId: auth.user?.id,
      session: session.flashMessages.all(),
    }
    return inertia.render('Blog/Create', { defaultValues })
  }

  public async store({ request, response, session, auth }: HttpContext) {
    const trx = await db.transaction()

    try {
      const payload = await request.validateUsing(blogValidator)

      let thumbnailFileName = null

      // Handle file upload
      const thumbnailFile = request.file('thumbnail')
      if (thumbnailFile) {
        if (!thumbnailFile.isValid) {
          throw new Error(thumbnailFile.errors[0]?.message || 'File thumbnail tidak valid')
        }

        // Validasi tipe file
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image']
        if (!allowedTypes.includes(thumbnailFile.type!)) {
          logger.info(thumbnailFile.type!)
          throw new Error('Hanya file JPEG, JPG, PNG, dan WebP yang diizinkan')
        }

        // Validasi ukuran file (max 5MB)
        if (thumbnailFile.size > 5 * 1024 * 1024) {
          throw new Error('Ukuran file maksimal 5MB')
        }

        // Generate nama file unik
        const fileExt = thumbnailFile.extname || '.jpg'
        thumbnailFileName = `${cuid()}.${fileExt}`
        app.makePath('storage/blogs', thumbnailFileName)

        // Pindahkan file ke storage
        await thumbnailFile.move(app.makePath('storage/blogs'), {
          name: thumbnailFileName,
        })

        if (!thumbnailFile.fileName) {
          throw new Error('Gagal menyimpan file thumbnail')
        }
      }

      const tags = payload.tags?.split(', ').map((tag) => tag.trim()) ?? []

      logger.info(auth.user?.id)
      const blogData = {
        ...payload,
        thumbnail: thumbnailFileName,
        tags: JSON.stringify(tags),
        penulisId: auth.user?.id,
        publishedAt: payload.status === 'published' ? DateTime.now() : null,
      }

      await Blog.create(blogData, { client: trx })

      await trx.commit()

      session.flash({
        status: 'success',
        message: 'Blog berhasil ditambahkan.',
      })
      return response.redirect().withQs().back()
    } catch (error) {
      await trx.rollback()
      logger.error({ err: error }, 'Gagal menyimpan blog baru')
      session.flash({
        status: 'error',
        message: 'Gagal menyimpan blog',
        error: error,
      })
      return response.redirect().withQs().back()
    }
  }

  public async show({ params, inertia }: HttpContext) {
    const blog = await Blog.query().where('id', params.id).preload('penulis').firstOrFail()

    // Increment view count
    blog.dilihat += 1
    await blog.save()

    return inertia.render('Blog/Show', { blog: blog.toJSON() })
  }

  public async edit({ inertia, params, auth, session }: HttpContext) {
    const blog = await Blog.query().where('id', params.id).firstOrFail()

    // Authorization check
    if (auth.user?.role !== 'SuperAdmin' && blog.penulisId !== auth.user?.id) {
      throw new Error('Unauthorized')
    }

    return inertia.render('Blog/Edit', {
      blog: blog.toJSON(),
      session: session.flashMessages.all(),
    })
  }

  public async update({ request, response, session, params, auth }: HttpContext) {
    const trx = await db.transaction()
    const id = params.id

    try {
      const blog = await Blog.query().where('id', id).firstOrFail()

      // Authorization check
      if (blog.penulisId !== auth.user?.id) {
        throw new Error('Unauthorized')
      }

      const payload = await request.validateUsing(blogValidator)

      let thumbnailFileName = blog.thumbnail

      // Handle file upload baru
      const thumbnailFile = request.file('thumbnail')
      if (thumbnailFile) {
        if (!thumbnailFile.isValid) {
          throw new Error(thumbnailFile.errors[0]?.message || 'File thumbnail tidak valid')
        }

        // Validasi tipe file
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image']
        if (!allowedTypes.includes(thumbnailFile.type!)) {
          throw new Error('Hanya file JPEG, JPG, PNG, dan WebP yang diizinkan')
        }

        // Validasi ukuran file (max 5MB)
        if (thumbnailFile.size > 5 * 1024 * 1024) {
          throw new Error('Ukuran file maksimal 5MB')
        }

        // Hapus file lama jika ada
        if (blog.thumbnail) {
          try {
            const oldFilePath = app.makePath('storage/blogs', blog.thumbnail)
            await fs.unlink(oldFilePath)
          } catch (error) {
            console.warn('Gagal menghapus file lama:', error.message)
          }
        }

        // Generate nama file unik
        const fileExt = thumbnailFile.extname || '.jpg'
        thumbnailFileName = `${cuid()}.${fileExt}`

        // Pindahkan file ke storage
        await thumbnailFile.move(app.makePath('storage/blogs'), {
          name: thumbnailFileName,
        })

        if (!thumbnailFile.fileName) {
          throw new Error('Gagal menyimpan file thumbnail')
        }
      }

      blog.useTransaction(trx)
      blog.merge({
        ...payload,
        thumbnail: thumbnailFileName,
        publishedAt:
          payload.status === 'published' && !blog.publishedAt ? DateTime.now() : blog.publishedAt,
      })
      await blog.save()

      await trx.commit()

      session.flash({
        status: 'success',
        message: 'Blog berhasil diperbarui.',
      })
      return response.redirect().withQs().back()
    } catch (error) {
      await trx.rollback()
      logger.error({ err: error }, `Gagal update blog ID: ${id}`)
      session.flash({
        status: 'error',
        message: 'Gagal memperbarui blog',
        error: error,
      })
      return response.redirect().withQs().back()
    }
  }

  public async destroy({ response, session, params, auth }: HttpContext) {
    try {
      const { id } = params
      const blog = await Blog.findOrFail(id)

      // Authorization check
      if (blog.penulisId !== auth.user?.id) {
        throw new Error('Unauthorized')
      }

      if (blog.thumbnail) {
        try {
          const filePath = app.makePath('storage/blogs', blog.thumbnail)
          await fs.unlink(filePath)
        } catch (error) {
          console.warn('Gagal menghapus file thumbnail:', error.message)
        }
      }

      await blog.delete()

      session.flash({
        status: 'success',
        message: 'Blog berhasil dihapus.',
      })
    } catch (error) {
      logger.error({ err: error }, `Gagal hapus blog`)
      session.flash({
        status: 'error',
        message: 'Gagal menghapus blog',
        error: error,
      })
    }
    return response.redirect().withQs().back()
  }

  // API untuk public blog
  public async publicIndex({ request, inertia }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '')
    const kategori = request.input('kategori', '')

    const query = Blog.query().where('status', 'published').preload('penulis')

    if (search) {
      query.where((builder) => {
        builder
          .where('judul', 'LIKE', `%${search}%`)
          .orWhere('konten', 'LIKE', `%${search}%`)
          .orWhere('ringkasan', 'LIKE', `%${search}%`)
      })
    }

    if (kategori) {
      query.where('kategori', kategori)
    }

    const blogsPaginate = await query.orderBy('published_at', 'desc').paginate(page, 12)

    const blogs = blogsPaginate.all().map((item) => item.toJSON())

    // Ambil semua kategori untuk filter
    const kategoriList = await Blog.query()
      .distinct('kategori')
      .whereNotNull('kategori')
      .where('status', 'published')

    return inertia.render('Blog/Public/Index', {
      blogsPaginate: {
        currentPage: blogsPaginate.currentPage,
        lastPage: blogsPaginate.lastPage,
        total: blogsPaginate.total,
        perPage: blogsPaginate.perPage,
      },
      blogs: blogs,
      kategoriList: kategoriList.map((k) => k.kategori),
      searchQuery: search,
      filterKategori: kategori,
    })
  }

  public async publicShow({ params, inertia }: HttpContext) {
    const blog = await Blog.query()
      .where('id', params.id)
      .where('status', 'published')
      .where('published_at', '<=', DateTime.now().toSQL())
      .preload('penulis')
      .firstOrFail()

    // Increment view count
    blog.dilihat += 1
    await blog.save()

    // Get related posts
    const relatedBlogs = await Blog.query()
      .where('status', 'published')
      .where('published_at', '<=', DateTime.now().toSQL())
      .where('kategori', blog?.kategori || '')
      .whereNot('id', blog.id)
      .limit(3)
      .preload('penulis')

    return inertia.render('Blog/Public/Show', {
      blog: blog.toJSON(),
      relatedBlogs: relatedBlogs.map((b) => b.toJSON()),
    })
  }
}
