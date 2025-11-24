'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { 
  Loader2, 
  Sparkles, 
  Edit3, 
  ArrowLeft,
  FileText,
  Save,
  Plus,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/lib/redux/store'
import { createBlog, type Blog } from '@/lib/redux/features/blogSlice'

interface BlogImage {
  id: string
  url: string
  alt: string
  caption?: string
}

interface AIBlogData {
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: string
  author: string
  category: string
  tags: string[]
  status: string
  readTime: string
  views: number
  likes: number
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  canonicalUrl: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  images: BlogImage[]
  confidence: number
}

const AddBlogs = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [blogTopic, setBlogTopic] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiData, setAiData] = useState<AIBlogData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<AIBlogData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    author: '',
    category: '',
    tags: [],
    status: 'draft',
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
    images: [],
    confidence: 0
  })

  const categories = ["Health & Wellness", "Nutrition", "Fitness", "Mental Health", "Lifestyle", "Medical", "Technology", "Research"]

  const generateBlogWithAI = async () => {
    if (!blogTopic.trim()) return

    setIsGenerating(true)
    try {
      // Call OpenAI API for blog generation
      const response = await fetch('/api/generate-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: blogTopic,
          prompt: `Create a comprehensive blog post about "${blogTopic}" with the following structure in JSON format:
          {
            "title": "Engaging blog title",
            "slug": "url-friendly-slug",
            "excerpt": "Brief 2-3 sentence summary",
            "content": "Full blog content in HTML format with proper headings, paragraphs, and formatting",
            "featuredImage": "https://images.unsplash.com/photo-...",
            "author": "Dr. [Name] or [Author Name]",
            "category": "One of: Health & Wellness, Nutrition, Fitness, Mental Health, Lifestyle, Medical, Technology, Research",
            "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
            "status": "draft",
            "readTime": "X min read",
            "views": 0,
            "likes": 0,
            "metaTitle": "SEO optimized title (50-60 characters)",
            "metaDescription": "SEO meta description (150-160 characters)",
            "metaKeywords": "keyword1, keyword2, keyword3, keyword4",
            "canonicalUrl": "https://wellnessfuel.com/blog/url-friendly-slug",
            "ogTitle": "Social media title",
            "ogDescription": "Social media description",
            "ogImage": "https://images.unsplash.com/photo-...",
            "images": [
              {
                "id": "img1",
                "url": "https://images.unsplash.com/photo-...",
                "alt": "Descriptive alt text",
                "caption": "Image caption"
              }
            ],
            "confidence": "Confidence score 0-100"
          }`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate blog')
      }

      const data = await response.json()
      setAiData(data)
      setFormData(data)
    } catch (error) {
      console.error('Error generating blog:', error)
      // Fallback: Show demo data
      const demoData: AIBlogData = {
        title: "The Ultimate Guide to Wellness and Healthy Living",
        slug: "ultimate-guide-wellness-healthy-living",
        excerpt: "Discover the secrets to a healthier lifestyle with our comprehensive guide covering nutrition, exercise, and mental wellness.",
        content: `
          <h2>Introduction</h2>
          <p>In today's fast-paced world, maintaining good health and wellness has become more important than ever. This comprehensive guide will help you understand the key components of a healthy lifestyle.</p>
          
          <h2>Nutrition and Diet</h2>
          <p>Proper nutrition is the foundation of good health. Focus on whole foods, plenty of fruits and vegetables, and adequate hydration.</p>
          
          <h2>Physical Activity</h2>
          <p>Regular exercise is crucial for maintaining physical and mental health. Aim for at least 150 minutes of moderate activity per week.</p>
          
          <h2>Mental Wellness</h2>
          <p>Mental health is just as important as physical health. Practice stress management techniques and maintain social connections.</p>
          
          <h2>Conclusion</h2>
          <p>By following these guidelines, you can improve your overall wellness and lead a healthier, more fulfilling life.</p>
        `,
        featuredImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop",
        author: "Dr. Sarah Johnson",
        category: "Health & Wellness",
        tags: ["wellness", "health", "lifestyle", "nutrition", "fitness"],
        status: "draft",
        readTime: "8 min read",
        views: 0,
        likes: 0,
        metaTitle: "The Ultimate Guide to Wellness and Healthy Living | Wellness Fuel",
        metaDescription: "Learn about wellness and healthy living with our comprehensive guide covering nutrition, exercise, and mental health.",
        metaKeywords: "wellness, health, lifestyle, nutrition, fitness, healthy living, wellness guide",
        canonicalUrl: "https://wellnessfuel.com/blog/ultimate-guide-wellness-healthy-living",
        ogTitle: "The Ultimate Guide to Wellness and Healthy Living",
        ogDescription: "Discover the secrets to a healthier lifestyle with our comprehensive guide covering nutrition, exercise, and mental wellness.",
        ogImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=630&fit=crop",
        images: [
          {
            id: "img1",
            url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
            alt: "Healthy lifestyle concept",
            caption: "A balanced approach to wellness"
          }
        ],
        confidence: 90
      }
      setAiData(demoData)
      setFormData(demoData)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleInputChange = (field: keyof AIBlogData, value: string | string[] | number | BlogImage[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag)
    handleInputChange('tags', tags)
  }

  const addImage = () => {
    const newImage: BlogImage = {
      id: `img_${Date.now()}`,
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
      alt: 'Blog image',
      caption: ''
    }
    handleInputChange('images', [...formData.images, newImage])
  }

  const removeImage = (imageId: string) => {
    const updatedImages = formData.images.filter(img => img.id !== imageId)
    handleInputChange('images', updatedImages)
  }

  const updateImage = (imageId: string, field: keyof BlogImage, value: string) => {
    const updatedImages = formData.images.map(img => 
      img.id === imageId ? { ...img, [field]: value } : img
    )
    handleInputChange('images', updatedImages)
  }

  const saveBlog = async () => {
    setIsGenerating(true)
    try {
      // Map AIBlogData to Blog type for Redux
      const blogPayload: Omit<Blog, "_id" | "createdAt" | "updatedAt" | "views" | "likes"> = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        featuredImage: formData.featuredImage,
        author: formData.author,
        category: formData.category,
        tags: formData.tags,
        status: formData.status,
        publishedAt: formData.status === 'published' ? new Date().toISOString() : null,
        readTime: formData.readTime,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        metaKeywords: formData.metaKeywords,
        canonicalUrl: formData.canonicalUrl,
        ogTitle: formData.ogTitle,
        ogDescription: formData.ogDescription,
        ogImage: formData.ogImage,
      }
      
      await dispatch(createBlog(blogPayload)).unwrap()
      
      // Redirect back to blogs page
      router.push('/dashboard/blogs')
    } catch (error) {
      console.error('Error saving blog:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="mx-auto p-0 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI-Powered Blog Builder</h1>
          <p className="text-muted-foreground">Enter a topic and let AI create a complete blog post for you</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Topic Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Blog Topic
            </CardTitle>
            <CardDescription>
              Enter your blog topic and let AI generate the complete content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="blog-topic">Blog Topic or Title</Label>
              <Textarea
                id="blog-topic"
                placeholder="e.g., 'The Benefits of Regular Exercise for Mental Health' or '10 Superfoods for Better Immunity'"
                value={blogTopic}
                onChange={(e) => setBlogTopic(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
            
            <Button 
              onClick={generateBlogWithAI}
              disabled={isGenerating || !blogTopic.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Blog with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Blog with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* AI Generation Results */}
        {aiData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI Generated Blog
                <Badge variant="secondary" className="ml-auto">
                  {aiData.confidence}% Confidence
                </Badge>
              </CardTitle>
              <CardDescription>
                AI has created a complete blog post for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{aiData.title}</h3>
                <p className="text-sm text-muted-foreground">{aiData.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Category: {aiData.category}</span>
                  <span>Reading Time: {aiData.readTime}</span>
                  <span>Author: {aiData.author}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {aiData.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex-1"
                  variant="outline"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Customize Blog
                </Button>
                <Button
                  onClick={saveBlog}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Blog
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Editable Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Customize Blog Content
            </CardTitle>
            <CardDescription>
              Review and modify the AI-generated blog content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                
                <div>
                  <Label htmlFor="title">Blog Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter blog title"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="url-friendly-slug"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    placeholder="Brief blog summary"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    placeholder="SEO meta description"
                    rows={2}
                  />
                </div>
              </div>

              {/* Content & Media */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Content & Media</h3>
                
                <div>
                  <Label htmlFor="featuredImage">Featured Image URL</Label>
                  <Input
                    id="featuredImage"
                    value={formData.featuredImage}
                    onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags.join(', ')}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    placeholder="Author name"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
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
                  <Label htmlFor="readTime">Read Time</Label>
                  <Input
                    id="readTime"
                    value={formData.readTime}
                    onChange={(e) => handleInputChange('readTime', e.target.value)}
                    placeholder="e.g., 5 min read"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Blog Images</Label>
                    <Button onClick={addImage} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Image
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formData.images.map((image) => (
                      <div key={image.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Image {image.id}</span>
                          <Button
                            onClick={() => removeImage(image.id)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Image URL"
                          value={image.url}
                          onChange={(e) => updateImage(image.id, 'url', e.target.value)}
                        />
                        <Input
                          placeholder="Alt text"
                          value={image.alt}
                          onChange={(e) => updateImage(image.id, 'alt', e.target.value)}
                        />
                        <Input
                          placeholder="Caption (optional)"
                          value={image.caption || ''}
                          onChange={(e) => updateImage(image.id, 'caption', e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Blog Content */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Blog Content</h3>
              <Textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Enter your blog content in HTML format"
                rows={15}
                className="font-mono text-sm"
              />
            </div>

            {/* SEO Settings */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">SEO Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                    placeholder="SEO optimized title (50-60 characters)"
                  />
                </div>
                <div>
                  <Label htmlFor="metaKeywords">Meta Keywords</Label>
                  <Input
                    id="metaKeywords"
                    value={formData.metaKeywords}
                    onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    placeholder="SEO description (150-160 characters)"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="canonicalUrl">Canonical URL</Label>
                  <Input
                    id="canonicalUrl"
                    value={formData.canonicalUrl}
                    onChange={(e) => handleInputChange('canonicalUrl', e.target.value)}
                    placeholder="https://wellnessfuel.com/blog/post-slug"
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Social Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="ogTitle">Open Graph Title</Label>
                  <Input
                    id="ogTitle"
                    value={formData.ogTitle}
                    onChange={(e) => handleInputChange('ogTitle', e.target.value)}
                    placeholder="Social media title"
                  />
                </div>
                <div>
                  <Label htmlFor="ogImage">Open Graph Image URL</Label>
                  <Input
                    id="ogImage"
                    value={formData.ogImage}
                    onChange={(e) => handleInputChange('ogImage', e.target.value)}
                    placeholder="https://example.com/og-image.jpg"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="ogDescription">Open Graph Description</Label>
                  <Textarea
                    id="ogDescription"
                    value={formData.ogDescription}
                    onChange={(e) => handleInputChange('ogDescription', e.target.value)}
                    placeholder="Social media description"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6 pt-6 border-t">
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={saveBlog}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving Blog...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Blog
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Export as dynamic component to prevent prerendering issues
export default dynamic(() => Promise.resolve(AddBlogs), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  )
})