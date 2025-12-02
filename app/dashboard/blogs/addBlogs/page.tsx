'use client'

import React, { useState, useEffect, FC } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, Edit3, ArrowLeft, FileText, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { createBlog, type BlogCreatePayload } from '@/lib/redux/features/blogSlice';
import { fetchBlogCategories } from '@/lib/redux/features/blogcategorySlice';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface AIBlogData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  category: string;
  tags: string[];
  status: 'published' | 'draft' | 'archived';
  readTime: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  confidence?: number;
}

const createInitialFormData = (): AIBlogData => ({
  title: '', slug: '', excerpt: '', content: '', featuredImage: '',
  author: '', category: '', tags: [], status: 'draft', readTime: '',
  metaTitle: '', metaDescription: '', metaKeywords: [], canonicalUrl: '',
  ogTitle: '', ogDescription: '', ogImage: '',
});

const AddBlogs: FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items: blogCategories, status: categoriesStatus } = useAppSelector((state) => state.blogCategories);

  const [blogTopic, setBlogTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiData, setAiData] = useState<AIBlogData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AIBlogData>(createInitialFormData());

  useEffect(() => {
    if (categoriesStatus === 'idle') {
      dispatch(fetchBlogCategories());
    }
  }, [dispatch, categoriesStatus]);

  const generateBlogWithAI = async () => {
    if (!blogTopic.trim()) return;

    setIsGenerating(true);
    setAiData(null);
    setIsEditing(false);

    try {
      const response = await fetch('/api/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: blogTopic }),
      });

      if (!response.ok) throw new Error('Failed to generate blog');

      const data = await response.json();

      const matchedCategory = blogCategories.find(c => c.name.toLowerCase() === data.category.toLowerCase());
      const categoryId = matchedCategory?._id ?? (blogCategories[0]?._id || '');

      const processedData: AIBlogData = {
        ...createInitialFormData(),
        ...data,
        category: categoryId,
        tags: Array.isArray(data.tags) ? data.tags : [],
        metaKeywords: typeof data.metaKeywords === 'string'
          ? data.metaKeywords.split(',').map((k: string) => k.trim())
          : [],
      };

      setAiData(processedData);
      setFormData(processedData);
      setIsEditing(true);
    } catch (error) {
      console.error('Error generating blog:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (field: keyof AIBlogData, value: AIBlogData[keyof AIBlogData]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const saveBlog = async () => {
    setIsSaving(true);
    try {
      const blogPayload: BlogCreatePayload = {
        ...formData,
        publishedAt: formData.status === 'published' ? new Date().toISOString() : null,
      };

      await dispatch(createBlog(blogPayload)).unwrap();
      router.push('/dashboard/blogs');
    } catch (error) {
      console.error('Error saving blog:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto p-0 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI-Powered Blog Builder</h1>
          <p className="text-muted-foreground">Generate a complete, SEO-optimized blog post from a single topic.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText size={20} /> Blog Topic</CardTitle>
            <CardDescription>Enter your blog topic to generate content.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              id="blog-topic"
              placeholder="e.g., 'Benefits of a Mediterranean Diet for Heart Health'"
              value={blogTopic}
              onChange={(e) => setBlogTopic(e.target.value)}
              rows={3}
            />
            <Button onClick={generateBlogWithAI} disabled={isGenerating || !blogTopic.trim()} className="w-full" size="lg">
              {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate with AI</>}
            </Button>
          </CardContent>
        </Card>

        {aiData && !isEditing && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles size={20} /> AI Generated Result
                {aiData.confidence && <Badge variant="secondary" className="ml-auto">{aiData.confidence}% Confidence</Badge>}
              </CardTitle>
              <CardDescription>A complete blog post has been created for you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{aiData.title}</h3>
                <p className="text-sm text-muted-foreground">{aiData.excerpt}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>Category: {blogCategories.find(c => c._id === aiData.category)?.name}</span>
                  <span>Read Time: {aiData.readTime}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setIsEditing(true)} className="flex-1" variant="outline"><Edit3 className="w-4 h-4 mr-2" /> Customize</Button>
                <Button onClick={saveBlog} disabled={isSaving} className="flex-1">
                  {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Blog</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Edit3 size={20} /> Customize Blog Content</CardTitle>
            <CardDescription>Review and modify the AI-generated content before saving.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                <div><Label htmlFor="title">Blog Title</Label><Input id="title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} /></div>
                <div><Label htmlFor="slug">URL Slug</Label><Input id="slug" value={formData.slug} onChange={(e) => handleInputChange('slug', e.target.value)} /></div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{blogCategories.map(cat => <SelectItem key={cat._id} value={cat._id!}>{cat.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label htmlFor="excerpt">Excerpt</Label><Textarea id="excerpt" value={formData.excerpt} onChange={(e) => handleInputChange('excerpt', e.target.value)} rows={3} /></div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Content & Media</h3>
                <div><Label htmlFor="author">Author</Label><Input id="author" value={formData.author} onChange={(e) => handleInputChange('author', e.target.value)} /></div>
                <div><Label htmlFor="tags">Tags (comma separated)</Label><Input id="tags" value={formData.tags.join(', ')} onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(t => t.trim()))} /></div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: AIBlogData['status']) => handleInputChange('status', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Featured Image</Label><ImageUpload value={formData.featuredImage} onUploadComplete={(url) => handleInputChange('featuredImage', url)} /></div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Blog Content</h3>
              <Textarea value={formData.content} onChange={(e) => handleInputChange('content', e.target.value)} rows={15} />
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
              <Button onClick={() => setIsEditing(false)} variant="outline">Cancel</Button>
              <Button onClick={saveBlog} disabled={isSaving}>
                {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(AddBlogs), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin" /></div>
});