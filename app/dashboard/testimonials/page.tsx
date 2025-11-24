'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { 
  Search, 
  Grid3X3, 
  List, 
  Edit, 
  Trash2, 
  Star,
  MessageSquare,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { fetchTestimonials, updateTestimonial, deleteTestimonial, Testimonial as TestimonialModel } from '@/lib/redux/features/testimonialsSlice'

type DashboardTestimonial = {
  id: number | string
  customerName: string
  customerEmail: string
  courseName: string
  courseId: number | string
  rating: number
  title: string
  testimonial: string
  status: 'pending' | 'approved' | 'rejected'
  verified: boolean
  helpful: number
  notHelpful: number
  images: string[]
  createdAt: string
  updatedAt: string
  graduationYear: string
  currentJob: string
  salary: string
}

const mapTestimonialToDashboard = (testimonial: TestimonialModel): DashboardTestimonial => {
  const raw = testimonial as Record<string, unknown>
  const normalizedStatus = ['pending', 'approved', 'rejected'].includes((raw.status as string) ?? '')
    ? (raw.status as DashboardTestimonial['status'])
    : 'approved'

  const fallbackHandle = raw.handle ? String(raw.handle).replace('@', '') : 'learner'

  return {
    id: (testimonial.id as string | number) || (raw._id as string | number) || Math.random().toString(36).slice(2),
    customerName: (raw.customerName as string) ?? (raw.name as string) ?? 'Anonymous Learner',
    customerEmail: (raw.customerEmail as string) ?? `${fallbackHandle}@example.com`,
    courseName: (raw.courseName as string) ?? 'Featured Program',
    courseId: Number(raw.courseId ?? 0),
    rating: Number(raw.rating ?? 5),
    title: (raw.title as string) ?? (raw.text ? String(raw.text).slice(0, 80) : 'Student Feedback'),
    testimonial: (raw.text as string) ?? '',
    status: normalizedStatus,
    verified: (raw.verified as boolean) ?? true,
    helpful: (raw.helpful as number) ?? 0,
    notHelpful: (raw.notHelpful as number) ?? 0,
    images: Array.isArray(raw.images) ? (raw.images as string[]) : [],
    createdAt: (raw.createdAt as string) ?? (raw.publishedAt as string) ?? new Date().toISOString(),
    updatedAt: (raw.updatedAt as string) ?? (raw.publishedAt as string) ?? new Date().toISOString(),
    graduationYear: (raw.graduationYear as string) ?? '',
    currentJob: (raw.currentJob as string) ?? '',
    salary: (raw.salary as string) ?? '',
  }
}

const testimonialStatuses = ["All", "pending", "approved", "rejected"]
const ratingFilters = ["All", "5", "4", "3", "2", "1"]

const TestimonialsPage = () => {
  const dispatch = useAppDispatch()
  const { items: testimonialItems, status: testimonialsStatus, error: testimonialsError } = useAppSelector((state) => state.testimonials)

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedRating, setSelectedRating] = useState('All')
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTestimonial, setSelectedTestimonial] = useState<DashboardTestimonial | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const usingLiveData = Array.isArray(testimonialItems) && testimonialItems.length > 0

  useEffect(() => {
    if (testimonialsStatus === 'idle') {
      dispatch(fetchTestimonials())
    }
  }, [dispatch, testimonialsStatus])

  const testimonials = useMemo<DashboardTestimonial[]>(() => {
    return testimonialItems.map(mapTestimonialToDashboard)
  }, [testimonialItems])

  const filteredTestimonials = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase()
    return testimonials.filter(testimonial => {
      const matchesSearch =
        testimonial.customerName.toLowerCase().includes(lowerSearch) ||
        testimonial.courseName.toLowerCase().includes(lowerSearch) ||
        testimonial.title.toLowerCase().includes(lowerSearch) ||
        testimonial.testimonial.toLowerCase().includes(lowerSearch)
      const matchesStatus = selectedStatus === 'All' || testimonial.status === selectedStatus
      const matchesRating = selectedRating === 'All' || testimonial.rating.toString() === selectedRating
      return matchesSearch && matchesStatus && matchesRating
    })
  }, [testimonials, searchTerm, selectedStatus, selectedRating])

  const totalPages = Math.max(1, Math.ceil(filteredTestimonials.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTestimonials = filteredTestimonials.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedStatus, selectedRating])

  const handleUpdateTestimonialStatus = async () => {
    if (!selectedTestimonial) return
    if (!usingLiveData) {
      setShowEditModal(false)
      return
    }
    setIsLoading(true)
    try {
      await dispatch(
        updateTestimonial({
          testimonialId: String(selectedTestimonial.id),
          data: { status: selectedTestimonial.status, verified: selectedTestimonial.verified },
        })
      ).unwrap()
      setShowEditModal(false)
    } catch (err) {
      console.error('Failed to update testimonial', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTestimonial = async () => {
    if (!selectedTestimonial) return
    if (!usingLiveData) {
      setShowDeleteModal(false)
      setSelectedTestimonial(null)
      return
    }
    setIsLoading(true)
    try {
      await dispatch(deleteTestimonial(String(selectedTestimonial.id))).unwrap()
      setShowDeleteModal(false)
      setSelectedTestimonial(null)
    } catch (err) {
      console.error('Failed to delete testimonial', err)
    } finally {
      setIsLoading(false)
    }
  }

  const openViewModal = (testimonial: DashboardTestimonial) => {
    setSelectedTestimonial(testimonial)
    setShowViewModal(true)
  }
  const openEditModal = (testimonial: DashboardTestimonial) => {
    setSelectedTestimonial({ ...testimonial })
    setShowEditModal(true)
  }
  const openDeleteModal = (testimonial: DashboardTestimonial) => {
    setSelectedTestimonial(testimonial)
    setShowDeleteModal(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'approved': return 'success'
      case 'rejected': return 'default'
      default: return 'secondary'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-amber-500 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const totalCount = testimonials.length
  const pendingCount = testimonials.filter(t => t.status === 'pending').length
  const approvedCount = testimonials.filter(t => t.status === 'approved').length
  const avgRating = totalCount > 0
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / totalCount).toFixed(1)
    : '0.0'

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Testimonials</h1>
            <p className="text-muted-foreground">Manage student testimonials and success stories</p>
          </div>
        </div>

        {testimonialsError && (
          <Card>
            <CardContent className="p-4 text-sm text-destructive">
              {testimonialsError}
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Testimonials</p>
                  <p className="text-2xl font-bold text-foreground">{totalCount}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Testimonials</p>
                  <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved Testimonials</p>
                  <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <p className="text-2xl font-bold text-foreground">{avgRating}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
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
                  placeholder="Search testimonials..."
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
                  {testimonialStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === 'All' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Rating Filter */}
              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {ratingFilters.map(rating => (
                    <SelectItem key={rating} value={rating}>
                      {rating === 'All' ? 'All Ratings' : `${rating} Star${rating !== '1' ? 's' : ''}`}
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

        {/* Testimonials Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTestimonials.map(testimonial => (
              <Card key={testimonial.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg line-clamp-1">{testimonial.title}</CardTitle>
                    <Badge variant={getStatusColor(testimonial.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                      {getStatusIcon(testimonial.status)}
                      <span className="ml-1">{testimonial.status.charAt(0).toUpperCase() + testimonial.status.slice(1)}</span>
                    </Badge>
                  </div>
                  <CardDescription>{testimonial.courseName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Student:</span>
                      <span className="text-sm font-medium">{testimonial.customerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Rating:</span>
                      <div className="flex items-center gap-1">
                        {renderStars(testimonial.rating)}
                        <span className="text-sm font-medium ml-1">({testimonial.rating})</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Verified:</span>
                      <Badge variant={testimonial.verified ? 'success' : 'secondary'}>
                        {testimonial.verified ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Job:</span>
                      <span className="text-sm font-medium">{testimonial.currentJob}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Salary:</span>
                      <span className="text-sm font-medium">{testimonial.salary}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Date:</span>
                      <span className="text-sm font-medium">{new Date(testimonial.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{testimonial.testimonial}</p>
                  </div>
                  <div className="flex gap-2 pt-2 mt-auto">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => openViewModal(testimonial)}
                          className="flex-1 gap-2"
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View testimonial details</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => openEditModal(testimonial)}
                          className="flex-1 gap-2"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit testimonial status</p>
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
                  <TableHead>Testimonial</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTestimonials.map(testimonial => (
                  <TableRow key={testimonial.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground line-clamp-1">{testimonial.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{testimonial.testimonial}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{testimonial.courseName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{testimonial.customerName}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {renderStars(testimonial.rating)}
                        <span className="text-sm font-medium ml-1">({testimonial.rating})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(testimonial.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {getStatusIcon(testimonial.status)}
                        <span className="ml-1">{testimonial.status.charAt(0).toUpperCase() + testimonial.status.slice(1)}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(testimonial.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => openViewModal(testimonial)}
                              variant="ghost"
                              size="icon"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View testimonial</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => openEditModal(testimonial)}
                              variant="ghost"
                              size="icon"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit testimonial</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => openDeleteModal(testimonial)}
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete testimonial</p>
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredTestimonials.length)} of {filteredTestimonials.length} testimonials
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

        {/* View Testimonial Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Testimonial Details - {selectedTestimonial?.title}</DialogTitle>
              <DialogDescription>
                Complete testimonial information and student details.
              </DialogDescription>
            </DialogHeader>
            {selectedTestimonial && (
              <div className="space-y-6">
                {/* Testimonial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Testimonial Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Title:</span>
                        <span className="font-medium">{selectedTestimonial.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rating:</span>
                        <div className="flex items-center gap-1">
                          {renderStars(selectedTestimonial.rating)}
                          <span className="font-medium ml-1">({selectedTestimonial.rating}/5)</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={getStatusColor(selectedTestimonial.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                          {getStatusIcon(selectedTestimonial.status)}
                          <span className="ml-1">{selectedTestimonial.status.charAt(0).toUpperCase() + selectedTestimonial.status.slice(1)}</span>
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Verified:</span>
                        <Badge variant={selectedTestimonial.verified ? 'success' : 'secondary'}>
                          {selectedTestimonial.verified ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Graduation Year:</span>
                        <span className="font-medium">{selectedTestimonial.graduationYear}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Student Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{selectedTestimonial.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{selectedTestimonial.customerEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Course:</span>
                        <span className="font-medium">{selectedTestimonial.courseName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Job:</span>
                        <span className="font-medium">{selectedTestimonial.currentJob}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Salary:</span>
                        <span className="font-medium">{selectedTestimonial.salary}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Testimonial Content */}
                <Card>
                  <CardHeader>
                    <CardTitle>Testimonial Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{selectedTestimonial.testimonial}</p>
                  </CardContent>
                </Card>

                {/* Testimonial Images */}
                {selectedTestimonial.images && selectedTestimonial.images.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Testimonial Images</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedTestimonial.images.map((image: string, index: number) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                            <Image
                              src={image}
                              alt={`Testimonial image ${index + 1}`}
                              className="w-full h-full object-cover"
                              fill
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span className="font-medium">{new Date(selectedTestimonial.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span className="font-medium">{new Date(selectedTestimonial.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewModal(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Testimonial Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Testimonial Status</DialogTitle>
              <DialogDescription>
                Change the status of testimonial by {selectedTestimonial?.customerName}
              </DialogDescription>
            </DialogHeader>
            {selectedTestimonial && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="testimonial-status" className="mb-2 block">Testimonial Status</Label>
                  <Select 
                    value={selectedTestimonial.status} 
                    onValueChange={(value) => setSelectedTestimonial({...selectedTestimonial, status: value as DashboardTestimonial['status']})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {testimonialStatuses.slice(1).map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="testimonial-verified" className="mb-2 block">Verified Graduate</Label>
                  <Select 
                    value={selectedTestimonial.verified ? 'true' : 'false'} 
                    onValueChange={(value) => setSelectedTestimonial({...selectedTestimonial, verified: value === 'true'})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select verification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Verified</SelectItem>
                      <SelectItem value="false">Not Verified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateTestimonialStatus}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Testimonial'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Testimonial</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the testimonial by {selectedTestimonial?.customerName}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteTestimonial} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Testimonial'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

export default TestimonialsPage