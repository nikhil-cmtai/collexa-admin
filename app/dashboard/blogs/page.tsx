'use client'

import React, { useState, useMemo, useEffect, FC, FormEvent } from 'react';
import Image from 'next/image';
import { Plus, Search, Grid3X3, List, Edit, Trash2, Loader2, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { fetchBlogs, createBlog, updateBlog, deleteBlog, type Blog, type BlogCreatePayload } from '@/lib/redux/features/blogSlice';
import { fetchBlogCategories, type BlogCategory } from '@/lib/redux/features/blogcategorySlice';
import { ImageUpload } from '@/components/ui/ImageUpload';

const blogStatuses = ["All", "published", "draft", "archived"] as const;
type BlogStatus = typeof blogStatuses[number];

interface BlogWithCategoryName extends Blog {
  categoryName: string;
}

type BlogFormData = Omit<Blog, 'tags' | 'metaKeywords'> & {
  tags: string;
  metaKeywords: string;
};

const BlogsPage: FC = () => {
  const dispatch = useAppDispatch();
  const { items: blogItems, status: blogsStatus } = useAppSelector((state) => state.blogs);
  const { items: blogCategories, status: categoriesStatus } = useAppSelector((state) => state.blogCategories);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BlogStatus>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogFormData | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    if (blogsStatus === 'idle') dispatch(fetchBlogs());
    if (categoriesStatus === 'idle') dispatch(fetchBlogCategories());
  }, [dispatch, blogsStatus, categoriesStatus]);

  const blogs: BlogWithCategoryName[] = useMemo(() =>
    blogItems.map(blog => ({
      ...blog,
      categoryName: blogCategories.find(cat => cat._id === blog.category)?.name || 'Uncategorized'
    })), [blogItems, blogCategories]
  );

  const filteredBlogs = useMemo(() =>
    blogs.filter(blog => {
      const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) || blog.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'All' || blog.status === selectedStatus;
      const matchesCategory = selectedCategoryFilter === 'All' || blog.category === selectedCategoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    }), [blogs, searchTerm, selectedStatus, selectedCategoryFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / itemsPerPage));
  const paginatedBlogs = filteredBlogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedCategoryFilter]);

  const prepareBlogForForm = (blog: BlogWithCategoryName): BlogFormData => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { categoryName, ...rest } = blog;
    return {
      ...rest,
      tags: blog.tags.join(', '),
      metaKeywords: blog.metaKeywords.join(', '),
    };
  };

  const handleFormSubmit = async (formData: BlogFormData) => {
    setIsActionLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, createdAt, updatedAt, views, likes, ...blogData } = formData;
    
    const payload: BlogCreatePayload = {
      ...blogData,
      tags: typeof blogData.tags === 'string' ? blogData.tags.split(',').map(t => t.trim()) : [],
      metaKeywords: typeof blogData.metaKeywords === 'string' ? blogData.metaKeywords.split(',').map(t => t.trim()) : [],
    };

    try {
      if (_id) {
        await dispatch(updateBlog({ blogId: _id, data: payload })).unwrap();
      } else {
        await dispatch(createBlog(payload)).unwrap();
      }
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedBlog(null);
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBlog?._id) return;
    setIsActionLoading(true);
    try {
      await dispatch(deleteBlog(selectedBlog._id)).unwrap();
      setShowDeleteModal(false);
      setSelectedBlog(null);
    } catch (err) {
      console.error("Delete failed", err)
    } finally {
      setIsActionLoading(false)
    }
  }

  const openEditModal = (blog: BlogWithCategoryName) => {
    setSelectedBlog(prepareBlogForForm(blog));
    setShowEditModal(true);
  };

  const openDeleteModal = (blog: BlogWithCategoryName) => {
    setSelectedBlog(prepareBlogForForm(blog));
    setShowDeleteModal(true);
  };

  const createEmptyBlog = (): BlogFormData => ({
    _id: '', title: '', slug: '', excerpt: '', content: '', featuredImage: '', author: '',
    category: '', tags: '', status: 'draft', publishedAt: null, readTime: '', views: 0, likes: 0,
    metaTitle: '', metaDescription: '', metaKeywords: '', canonicalUrl: '',
    ogTitle: '', ogDescription: '', ogImage: '', createdAt: '', updatedAt: ''
  });

  const getStatusBadgeVariant = (status: Blog['status']) => {
    if (status === 'published') return 'default';
    if (status === 'draft') return 'secondary';
    return 'destructive';
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Blog Management</h1>
            <p className="text-muted-foreground">Manage all blog posts from here.</p>
          </div>
          <Button onClick={() => { setSelectedBlog(createEmptyBlog()); setShowAddModal(true); }} className="gap-2">
            <Plus size={16} /> Add Blog
          </Button>
        </div>

        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by title or author..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={selectedStatus} onValueChange={(value: BlogStatus) => setSelectedStatus(value)}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>{blogStatuses.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {blogCategories.map(cat => <SelectItem key={cat._id} value={cat._id!}>{cat.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex border rounded-lg overflow-hidden">
              <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} className="rounded-none"><Grid3X3 className="w-4 h-4" /></Button>
              <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('list')} className="rounded-none"><List className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>

        {blogsStatus === 'loading' && paginatedBlogs.length === 0 ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedBlogs.map(blog => (
              <Card key={blog._id} className="flex flex-col">
                <div className="relative h-40"><Image src={blog.featuredImage || '/placeholder.png'} alt={blog.title} fill className="object-cover" /><div className="absolute top-2 right-2"><Badge variant={getStatusBadgeVariant(blog.status)}>{blog.status}</Badge></div></div>
                <CardHeader><CardTitle className="line-clamp-2 text-base">{blog.title}</CardTitle></CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1"><User size={12} /><span>{blog.author}</span></div>
                    <div className="flex items-center gap-1"><Calendar size={12} /><span>{new Date(blog.createdAt).toLocaleDateString()}</span></div>
                    <Badge variant="outline" className="mt-1">{blog.categoryName}</Badge>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => openEditModal(blog)} size="sm" className="flex-1 gap-1"><Edit size={14} />Edit</Button>
                    <Button onClick={() => openDeleteModal(blog)} size="sm" variant="destructive" className="flex-1 gap-1"><Trash2 size={14} />Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Post</TableHead><TableHead>Author</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Published</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>{paginatedBlogs.map(blog => (
                <TableRow key={blog._id}>
                  <TableCell><div className="flex items-center gap-3 max-w-sm"><Image src={blog.featuredImage || '/placeholder.png'} alt={blog.title} width={64} height={48} className="rounded object-cover" /><div className="truncate"><p className="font-medium truncate">{blog.title}</p></div></div></TableCell>
                  <TableCell>{blog.author}</TableCell>
                  <TableCell><Badge variant="outline">{blog.categoryName}</Badge></TableCell>
                  <TableCell><Badge variant={getStatusBadgeVariant(blog.status)}>{blog.status}</Badge></TableCell>
                  <TableCell>{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : '—'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button onClick={() => openEditModal(blog)} variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                      <Button onClick={() => openDeleteModal(blog)} variant="ghost" size="icon" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </Card>
        )}

        {totalPages > 1 && (
          <Card><CardContent className="p-4 flex items-center justify-between"><span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Previous</Button><Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Next</Button></div></CardContent></Card>
        )}

        <Dialog open={showAddModal || showEditModal} onOpenChange={showAddModal ? setShowAddModal : setShowEditModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{showEditModal ? 'Edit' : 'Add'} Blog Post</DialogTitle></DialogHeader>
            {selectedBlog && <BlogForm blog={selectedBlog} onBlogChange={setSelectedBlog} onSubmit={handleFormSubmit} onCancel={() => { setShowAddModal(false); setShowEditModal(false); setSelectedBlog(null) }} isLoading={isActionLoading} categories={blogCategories} />}
          </DialogContent>
        </Dialog>

        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Delete Blog Post</DialogTitle><DialogDescription>Are you sure you want to delete &quot;{selectedBlog?.title}&quot;?</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete} disabled={isActionLoading}>{isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}</Button></DialogFooter></DialogContent>
        </Dialog>

      </div>
    </TooltipProvider>
  );
};

interface BlogFormProps {
  blog: BlogFormData;
  onBlogChange: (blog: BlogFormData) => void;
  onSubmit: (formData: BlogFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
  categories: BlogCategory[];
}

const BlogForm: FC<BlogFormProps> = ({ blog, onBlogChange, onSubmit, onCancel, isLoading, categories }) => {
  const handleChange = (field: keyof BlogFormData, value: string) => {
    onBlogChange({ ...blog, [field]: value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(blog);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle>Content & Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label htmlFor="title">Title</Label><Input id="title" value={blog.title} onChange={(e) => handleChange('title', e.target.value)} required /></div>
              <div><Label htmlFor="slug">Slug</Label><Input id="slug" value={blog.slug} onChange={(e) => handleChange('slug', e.target.value)} required /></div>
              <div><Label htmlFor="excerpt">Excerpt</Label><Textarea id="excerpt" value={blog.excerpt} onChange={(e) => handleChange('excerpt', e.target.value)} rows={3} /></div>
              <div><Label htmlFor="content">Content</Label><Textarea id="content" value={blog.content} onChange={(e) => handleChange('content', e.target.value)} rows={10} /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>SEO & Social Sharing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label htmlFor="metaTitle">Meta Title</Label><Input id="metaTitle" value={blog.metaTitle} onChange={(e) => handleChange('metaTitle', e.target.value)} /></div>
              <div><Label htmlFor="metaDescription">Meta Description</Label><Textarea id="metaDescription" value={blog.metaDescription} onChange={(e) => handleChange('metaDescription', e.target.value)} rows={2} /></div>
              <div><Label htmlFor="metaKeywords">Meta Keywords (comma-separated)</Label><Input id="metaKeywords" value={blog.metaKeywords} onChange={(e) => handleChange('metaKeywords', e.target.value)} /></div>
              <div><Label>Open Graph Image</Label><ImageUpload value={blog.ogImage} onUploadComplete={(url) => handleChange('ogImage', url)} /></div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={blog.category} onValueChange={(value) => handleChange('category', value)} required>
                  <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                  <SelectContent>{categories.map(cat => <SelectItem key={cat._id} value={cat._id!}>{cat.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="author">Author</Label><Input id="author" value={blog.author} onChange={(e) => handleChange('author', e.target.value)} required /></div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={blog.status} onValueChange={(value: Blog['status']) => handleChange('status', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="tags">Tags (comma-separated)</Label><Input id="tags" value={blog.tags} onChange={(e) => handleChange('tags', e.target.value)} /></div>
              <div><Label>Featured Image</Label><ImageUpload value={blog.featuredImage} onUploadComplete={(url) => handleChange('featuredImage', url)} /></div>
            </CardContent>
          </Card>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Changes'}</Button>
      </DialogFooter>
    </form>
  );
};

export default BlogsPage;