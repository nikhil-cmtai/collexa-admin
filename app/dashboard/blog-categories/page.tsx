'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { 
  Search, 
  Grid3X3, 
  List, 
  Edit, 
  Trash2, 
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Folder,
  Tag,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import {
  fetchBlogCategories,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  fetchBlogCategoryById,
  type BlogCategory,
  clearSelectedCategory,
} from '@/lib/redux/features/blogcategorySlice'

const BlogCategoriesPage = () => {
  const dispatch = useAppDispatch()
  const { items: categories, status: categoriesStatus, error: categoriesError } = useAppSelector((state) => state.blogCategories)

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    if (categoriesStatus === 'idle') {
      dispatch(fetchBlogCategories(undefined))
    }
  }, [dispatch, categoriesStatus])

  // Filter categories
  const filteredCategories = useMemo(() => {
    return categories.filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category.slug.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }, [categories, searchTerm])

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handleAddCategory = async (categoryData: Omit<BlogCategory, "_id" | "createdAt" | "updatedAt" | "blogCount">) => {
    setIsActionLoading(true)
    try {
      await dispatch(createBlogCategory(categoryData)).unwrap()
      setShowAddModal(false)
      setSelectedCategory(null)
    } catch (error) {
      console.error('Failed to create category', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleUpdateCategory = async (categoryId: string, categoryData: Partial<BlogCategory>) => {
    setIsActionLoading(true)
    try {
      await dispatch(updateBlogCategory({ categoryId, data: categoryData })).unwrap()
      setShowEditModal(false)
      setSelectedCategory(null)
      dispatch(clearSelectedCategory())
    } catch (error) {
      console.error('Failed to update category', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDeleteCategory = async () => {
    if (!selectedCategory || !selectedCategory._id) return
    setIsActionLoading(true)
    try {
      await dispatch(deleteBlogCategory(selectedCategory._id)).unwrap()
      setShowDeleteModal(false)
      setSelectedCategory(null)
      dispatch(clearSelectedCategory())
    } catch (error) {
      console.error('Failed to delete category', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const openViewModal = async (category: BlogCategory) => {
    if (category._id) {
      await dispatch(fetchBlogCategoryById(category._id))
    }
    setSelectedCategory(category)
    setShowViewModal(true)
  }

  const openEditModal = (category: BlogCategory) => {
    setSelectedCategory({ ...category })
    setShowEditModal(true)
  }

  const openDeleteModal = (category: BlogCategory) => {
    setSelectedCategory(category)
    setShowDeleteModal(true)
  }

  const createEmptyCategory = (): Omit<BlogCategory, "_id" | "createdAt" | "updatedAt" | "blogCount"> => ({
    name: '',
    slug: '',
    description: '',
    color: '#3b82f6',
    icon: '',
    isActive: true,
  })

  const isLoading = categoriesStatus === 'loading' && categories.length === 0

  if (isLoading) {
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
            <h1 className="text-3xl font-bold text-foreground">Blog Categories</h1>
            <p className="text-muted-foreground">Manage blog post categories and organization</p>
          </div>
          <Button onClick={() => {
            setSelectedCategory(null)
            setShowAddModal(true)
          }} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        </div>

        {/* Error Message */}
        {categoriesError && (
          <Card>
            <CardContent className="p-4 text-sm text-destructive">
              {categoriesError}
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Categories</p>
                  <p className="text-2xl font-bold text-foreground">{categories.length}</p>
                </div>
                <Folder className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Categories</p>
                  <p className="text-2xl font-bold text-foreground">{categories.filter(c => c.isActive).length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inactive Categories</p>
                  <p className="text-2xl font-bold text-foreground">{categories.filter(c => !c.isActive).length}</p>
                </div>
                <XCircle className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Blog Posts</p>
                  <p className="text-2xl font-bold text-foreground">{categories.reduce((sum, c) => sum + (c.blogCount || 0), 0)}</p>
                </div>
                <Tag className="w-8 h-8 text-blue-600" />
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
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

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

        {/* Categories Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCategories.map(category => (
              <Card key={category._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: category.color || '#3b82f6' }}
                      >
                        <Tag className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription className="text-xs">{category.slug}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={category.isActive ? 'default' : 'secondary'}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{category.description || 'No description'}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Blog Posts:</span>
                    <span className="font-medium">{category.blogCount || 0}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => openViewModal(category)}
                          className="flex-1 gap-2"
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View category details</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => openEditModal(category)}
                          className="flex-1 gap-2"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit category</p>
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
                  <TableHead>Category</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Blog Posts</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCategories.map(category => (
                  <TableRow key={category._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: category.color || '#3b82f6' }}
                        >
                          <Tag className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{category.slug}</code>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-muted-foreground line-clamp-1">{category.description || 'No description'}</p>
                    </TableCell>
                    <TableCell className="font-medium">{category.blogCount || 0}</TableCell>
                    <TableCell>
                      <Badge variant={category.isActive ? 'default' : 'secondary'}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => openViewModal(category)}
                              variant="ghost"
                              size="icon"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View category</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => openEditModal(category)}
                              variant="ghost"
                              size="icon"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit category</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => openDeleteModal(category)}
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete category</p>
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredCategories.length)} of {filteredCategories.length} categories
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

        {/* View Category Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Category Details - {selectedCategory?.name}</DialogTitle>
              <DialogDescription>
                View complete category information.
              </DialogDescription>
            </DialogHeader>
            {selectedCategory && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: selectedCategory.color || '#3b82f6' }}
                  >
                    <Tag className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedCategory.name}</h3>
                    <code className="text-sm text-muted-foreground">{selectedCategory.slug}</code>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Description</Label>
                    <p className="text-sm">{selectedCategory.description || 'No description provided'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Status</Label>
                      <div className="mt-1">
                        <Badge variant={selectedCategory.isActive ? 'default' : 'secondary'}>
                          {selectedCategory.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Blog Posts</Label>
                      <p className="text-sm font-medium">{selectedCategory.blogCount || 0}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Color</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div 
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: selectedCategory.color || '#3b82f6' }}
                        />
                        <code className="text-xs">{selectedCategory.color || '#3b82f6'}</code>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Created</Label>
                      <p className="text-sm">
                        {selectedCategory.createdAt ? new Date(selectedCategory.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowViewModal(false)
                dispatch(clearSelectedCategory())
              }}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Category Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new blog category to organize your blog posts.
              </DialogDescription>
            </DialogHeader>
            <CategoryForm
              category={createEmptyCategory()}
              onSubmit={handleAddCategory}
              onCancel={() => {
                setShowAddModal(false)
                setSelectedCategory(null)
              }}
              isLoading={isActionLoading}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Category Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Update category information and settings.
              </DialogDescription>
            </DialogHeader>
            {selectedCategory && selectedCategory._id && (
              <CategoryForm
                category={selectedCategory}
                onSubmit={(data) => {
                  handleUpdateCategory(selectedCategory._id!, data)
                }}
                onCancel={() => {
                  setShowEditModal(false)
                  setSelectedCategory(null)
                  dispatch(clearSelectedCategory())
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
              <DialogTitle>Delete Category</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the category &quot;{selectedCategory?.name}&quot;? This action cannot be undone.
                {selectedCategory?.blogCount && selectedCategory.blogCount > 0 && (
                  <span className="block mt-2 text-amber-600">
                    Warning: This category has {selectedCategory.blogCount} blog post(s) associated with it.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isActionLoading}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteCategory} 
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Category'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

// Category Form Component
const CategoryForm = ({ 
  category, 
  onSubmit, 
  onCancel, 
  isLoading 
}: {
  category: BlogCategory | Omit<BlogCategory, "_id" | "createdAt" | "updatedAt" | "blogCount">
  onSubmit: (data: Omit<BlogCategory, "_id" | "createdAt" | "updatedAt" | "blogCount">) => void
  onCancel: () => void
  isLoading: boolean
}) => {
  const [formData, setFormData] = useState({
    name: category.name || '',
    slug: category.slug || '',
    description: category.description || '',
    color: category.color || '#3b82f6',
    icon: category.icon || '',
    isActive: category.isActive ?? true,
  })

  useEffect(() => {
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      color: category.color || '#3b82f6',
      icon: category.icon || '',
      isActive: category.isActive ?? true,
    })
  }, [category])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: formData.slug || generateSlug(name),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="category-name" className="mb-2 block">Category Name</Label>
        <Input
          id="category-name"
          type="text"
          placeholder="e.g., Technology, Health, Finance"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="category-slug" className="mb-2 block">Slug</Label>
        <Input
          id="category-slug"
          type="text"
          placeholder="category-slug"
          value={formData.slug}
          onChange={(e) => setFormData({...formData, slug: e.target.value})}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">URL-friendly identifier for the category</p>
      </div>
      <div>
        <Label htmlFor="category-description" className="mb-2 block">Description</Label>
        <Textarea
          id="category-description"
          placeholder="Brief description of this category"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category-color" className="mb-2 block">Color</Label>
          <div className="flex gap-2">
            <Input
              id="category-color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({...formData, color: e.target.value})}
              className="w-16 h-10"
            />
            <Input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({...formData, color: e.target.value})}
              placeholder="#3b82f6"
              className="flex-1"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="category-icon" className="mb-2 block">Icon (optional)</Label>
          <Input
            id="category-icon"
            type="text"
            placeholder="Icon name or URL"
            value={formData.icon}
            onChange={(e) => setFormData({...formData, icon: e.target.value})}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="category-active" className="mb-2 block">Status</Label>
          <p className="text-xs text-muted-foreground">Active categories are visible to users</p>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="category-active"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
          />
          <Label htmlFor="category-active" className="cursor-pointer">
            {formData.isActive ? 'Active' : 'Inactive'}
          </Label>
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
              {('_id' in category && category._id) ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            ('_id' in category && category._id) ? 'Update Category' : 'Create Category'
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default BlogCategoriesPage

