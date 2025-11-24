'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  Edit, 
  Trash2, 
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  TrendingUp,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Label } from '@/components/ui/label'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import {
  fetchBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  fetchBlogsStats,
  type Blog,
  clearSelectedBlog,
} from '@/lib/redux/features/blogSlice'

// Types
type BlogWithEditableTags = Blog & {
  id?: number | string
}

const blogStatuses = ["All", "published", "draft", "archived"]
const blogCategories = ["All", "Nutrition", "Fitness", "Wellness", "Supplements", "Lifestyle"]

// Helper function to map Blog to BlogWithEditableTags
const mapBlogToUI = (blog: Blog): BlogWithEditableTags => ({
  ...blog,
  id: blog._id || '',
  tags: Array.isArray(blog.tags) ? blog.tags : typeof blog.tags === 'string' ? blog.tags.split(',').map(t => t.trim()) : [],
})

// Helper function to map form data to Blog payload
const mapFormToBlogPayload = (formData: BlogWithEditableTags): Omit<Blog, "_id" | "createdAt" | "updatedAt" | "views" | "likes"> => {
  const {...rest } = formData
  return {
    ...rest,
    tags: Array.isArray(rest.tags) ? rest.tags : typeof rest.tags === 'string' ? rest.tags.split(',').map(t => t.trim()) : [],
  }
}

const BlogsPage = () => {
  const dispatch = useAppDispatch()
  const { items: blogItems, status: blogsStatus, error: blogsError } = useAppSelector((state) => state.blogs)
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState<BlogWithEditableTags | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    if (blogsStatus === 'idle') {
      dispatch(fetchBlogs(undefined))
      dispatch(fetchBlogsStats())
    }
  }, [dispatch, blogsStatus])

  // Map blogs from Redux to UI format
  const blogs = useMemo(() => blogItems.map(mapBlogToUI), [blogItems])


  // Filter blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => {
      const blogTags = Array.isArray(blog.tags) ? blog.tags : []
      const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           blogTags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = selectedStatus === 'All' || blog.status === selectedStatus
      const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory
      
      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [blogs, searchTerm, selectedStatus, selectedCategory])

  // Pagination logic
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex)

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedStatus, selectedCategory])

  const handleAddBlog = async () => {
    if (!selectedBlog) return
    setIsActionLoading(true)
    try {
      const payload = mapFormToBlogPayload(selectedBlog)
      await dispatch(createBlog(payload)).unwrap()
      setShowAddModal(false)
      setSelectedBlog(null)
    } catch (error) {
      console.error('Failed to create blog', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleEditBlog = async () => {
    if (!selectedBlog || !selectedBlog._id) return
    setIsActionLoading(true)
    try {
      const payload = mapFormToBlogPayload(selectedBlog)
      await dispatch(updateBlog({ blogId: selectedBlog._id, data: payload })).unwrap()
      setShowEditModal(false)
      setSelectedBlog(null)
      dispatch(clearSelectedBlog())
    } catch (error) {
      console.error('Failed to update blog', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDeleteBlog = async () => {
    if (!selectedBlog || !selectedBlog._id) return
    setIsActionLoading(true)
    try {
      await dispatch(deleteBlog(selectedBlog._id)).unwrap()
      setShowDeleteModal(false)
      setSelectedBlog(null)
      dispatch(clearSelectedBlog())
    } catch (error) {
      console.error('Failed to delete blog', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const openEditModal = (blog: BlogWithEditableTags) => {
    setSelectedBlog({
      ...blog,
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : (blog.tags as string)
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (blog: BlogWithEditableTags) => {
    setSelectedBlog(blog)
    setShowDeleteModal(true)
  }

  const createEmptyBlog = (): BlogWithEditableTags => ({
    _id: undefined,
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    author: '',
    category: '',
    tags: '',
    status: 'draft',
    publishedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    readTime: '',
    views: 0,
    likes: 0,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success'
      case 'draft': return 'warning'
      case 'archived': return 'destructive'
      default: return 'secondary'
    }
  }

  if (blogsStatus === 'loading' && blogItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Blog Management</h1>
            <p className="text-muted-foreground">Manage blog posts, SEO, and content strategy</p>
          </div>
          <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => {
                setSelectedBlog(createEmptyBlog())
                setShowAddModal(true)
              }} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Blog Post
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add a new blog post</p>
            </TooltipContent>
          </Tooltip>
        </div>
        </div>

        {/* Error Message */}
        {blogsError && (
          <Card>
            <CardContent className="p-4 text-sm text-destructive">
              {blogsError}
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                  <p className="text-2xl font-bold text-foreground">{blogs.length}</p>
                </div>
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold text-foreground">{blogs.filter(b => b.status === 'published').length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                  <p className="text-2xl font-bold text-foreground">{blogs.filter(b => b.status === 'draft').length}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold text-foreground">{blogs.reduce((sum, b) => sum + b.views, 0).toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search blog posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {blogStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === 'All' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {blogCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'All' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex border border-input rounded-lg overflow-hidden">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('grid')}
                      className="rounded-none"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Grid view</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('list')}
                      className="rounded-none"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>List view</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blogs Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedBlogs.map(blog => (
              <Card key={blog._id || blog.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={blog.featuredImage}
                    alt={blog.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant={getStatusColor(blog.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                      {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-2">{blog.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{blog.excerpt}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{blog.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{blog.category}</Badge>
                    <span className="text-sm text-muted-foreground">{blog.readTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">{blog.views} views</span>
                      <span className="text-muted-foreground">{blog.likes} likes</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => openEditModal(blog)}
                          className="flex-1 gap-2"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit blog post</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => openDeleteModal(blog)}
                          className="flex-1 gap-2 text-destructive border border-destructive hover:bg-destructive/10 hover:text-destructive-foreground"
                          size="sm"
                          variant="ghost"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete blog post</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Blog Post</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBlogs.map(blog => (
                  <TableRow key={blog._id || blog.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden">
                          <Image
                            src={blog.featuredImage}
                            alt={blog.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">{blog.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{blog.excerpt}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {Array.isArray(blog.tags) && blog.tags.slice(0, 2).map((tag: string, idx: number) => (
                              <Badge key={`${tag}-${idx}`} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {Array.isArray(blog.tags) && blog.tags.length > 2 && (
                              <span className="text-xs text-muted-foreground">+{blog.tags.length - 2}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{blog.author}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{blog.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(blog.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{blog.views.toLocaleString()}</TableCell>
                    <TableCell>
                      {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => openEditModal(blog)}
                              variant="ghost"
                              size="icon"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit blog post</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => openDeleteModal(blog)}
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete blog post</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredBlogs.length)} of {filteredBlogs.length} blog posts
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Blog Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Blog Post</DialogTitle>
              <DialogDescription>
                Create a new blog post with comprehensive SEO optimization.
              </DialogDescription>
            </DialogHeader>
            {selectedBlog && (
              <BlogForm
                blog={selectedBlog}
                onBlogChange={setSelectedBlog}
                onSubmit={handleAddBlog}
                onCancel={() => {
                  setShowAddModal(false)
                  setSelectedBlog(null)
                }}
                isLoading={isActionLoading}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Blog Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Blog Post</DialogTitle>
              <DialogDescription>
                Update blog post information and SEO settings.
              </DialogDescription>
            </DialogHeader>
            {selectedBlog && (
              <BlogForm
                blog={selectedBlog}
                onBlogChange={setSelectedBlog}
                onSubmit={handleEditBlog}
                onCancel={() => {
                  setShowEditModal(false)
                  setSelectedBlog(null)
                  dispatch(clearSelectedBlog())
                }}
                isLoading={isActionLoading}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Blog Post</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete blog post &quot;{selectedBlog?.title}&quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isActionLoading}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteBlog} 
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Blog Post'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

// Blog Form Component
const BlogForm = ({ 
  blog, 
  onBlogChange, 
  onSubmit, 
  onCancel, 
  isLoading 
}: {
  blog: BlogWithEditableTags
  onBlogChange: (blog: BlogWithEditableTags) => void
  onSubmit: () => void
  onCancel: () => void
  isLoading: boolean
}) => {
  const handleChange = (field: keyof BlogWithEditableTags, value: string | string[] | null) => {
    onBlogChange({
      ...blog,
      [field]: value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Basic Information</h3>
          <div>
            <Label htmlFor="blog-title" className="mb-2 block">Blog Title</Label>
            <Input
              id="blog-title"
              type="text"
              placeholder="Enter blog title"
              value={blog.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="blog-slug" className="mb-2 block">Slug</Label>
            <Input
              id="blog-slug"
              type="text"
              placeholder="blog-post-slug"
              value={blog.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="blog-excerpt" className="mb-2 block">Excerpt</Label>
            <Textarea
              id="blog-excerpt"
              placeholder="Brief description of the blog post"
              value={blog.excerpt}
              onChange={(e) => handleChange('excerpt', e.target.value)}
              rows={3}
              required
            />
          </div>
          <div>
            <Label htmlFor="blog-content" className="mb-2 block">Content</Label>
            <Textarea
              id="blog-content"
              placeholder="Write your blog post content here..."
              value={blog.content}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={8}
              required
            />
          </div>
          <div>
            <Label htmlFor="blog-image" className="mb-2 block">Featured Image URL</Label>
            <Input
              id="blog-image"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={blog.featuredImage}
              onChange={(e) => handleChange('featuredImage', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Author & Category */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Author & Category</h3>
          <div>
            <Label htmlFor="blog-author" className="mb-2 block">Author</Label>
            <Input
              id="blog-author"
              type="text"
              placeholder="Author name"
              value={blog.author}
              onChange={(e) => handleChange('author', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="blog-category" className="mb-2 block">Category</Label>
            <Select value={blog.category} onValueChange={(value) => handleChange('category', value)}>
              <SelectTrigger id="blog-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {blogCategories.slice(1).map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="blog-tags" className="mb-2 block">Tags (comma separated)</Label>
            <Input
              id="blog-tags"
              type="text"
              placeholder="tag1, tag2, tag3"
              value={Array.isArray(blog.tags) ? blog.tags.join(', ') : (blog.tags as string)}
              onChange={(e) => handleChange('tags', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="blog-status" className="mb-2 block">Status</Label>
            <Select value={blog.status} onValueChange={(value) => handleChange('status', value)}>
              <SelectTrigger id="blog-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="blog-read-time" className="mb-2 block">Read Time</Label>
            <Input
              id="blog-read-time"
              type="text"
              placeholder="e.g., 5 min read"
              value={blog.readTime}
              onChange={(e) => handleChange('readTime', e.target.value)}
            />
          </div>
        </div>

        {/* SEO Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">SEO Settings</h3>
          <div>
            <Label htmlFor="blog-meta-title" className="mb-2 block">Meta Title</Label>
            <Input
              id="blog-meta-title"
              type="text"
              placeholder="SEO optimized title (50-60 characters)"
              value={blog.metaTitle}
              onChange={(e) => handleChange('metaTitle', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="blog-meta-description" className="mb-2 block">Meta Description</Label>
            <Textarea
              id="blog-meta-description"
              placeholder="SEO description (150-160 characters)"
              value={blog.metaDescription}
              onChange={(e) => handleChange('metaDescription', e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="blog-meta-keywords" className="mb-2 block">Meta Keywords</Label>
            <Input
              id="blog-meta-keywords"
              type="text"
              placeholder="keyword1, keyword2, keyword3"
              value={blog.metaKeywords}
              onChange={(e) => handleChange('metaKeywords', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="blog-canonical" className="mb-2 block">Canonical URL</Label>
            <Input
              id="blog-canonical"
              type="url"
              placeholder="https://wellnessfuel.com/blog/post-slug"
              value={blog.canonicalUrl}
              onChange={(e) => handleChange('canonicalUrl', e.target.value)}
            />
          </div>
        </div>

        {/* Social Media */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Social Media</h3>
          <div>
            <Label htmlFor="blog-og-title" className="mb-2 block">Open Graph Title</Label>
            <Input
              id="blog-og-title"
              type="text"
              placeholder="Social media title"
              value={blog.ogTitle}
              onChange={(e) => handleChange('ogTitle', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="blog-og-description" className="mb-2 block">Open Graph Description</Label>
            <Textarea
              id="blog-og-description"
              placeholder="Social media description"
              value={blog.ogDescription}
              onChange={(e) => handleChange('ogDescription', e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="blog-og-image" className="mb-2 block">Open Graph Image URL</Label>
            <Input
              id="blog-og-image"
              type="url"
              placeholder="https://example.com/og-image.jpg"
              value={blog.ogImage}
              onChange={(e) => handleChange('ogImage', e.target.value)}
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {blog._id ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            blog._id ? 'Update Blog Post' : 'Add Blog Post'
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default BlogsPage