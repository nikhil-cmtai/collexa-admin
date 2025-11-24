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
  GraduationCap,
  Users,
  BookOpen,
  DollarSign,
  Building,
  Star,
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
  fetchCampusCourses,
  createCampusCourse,
  updateCampusCourse,
  deleteCampusCourse,
  fetchCampusCourseById,
  fetchCampusCoursesStats,
  setCampusCourseQuery,
  setCampusCourseTypeFilter,
  setCampusCourseStatusFilter,
  clearSelectedCampusCourse,
  type CampusCourse,
} from '@/lib/redux/features/campus-courseSlice'


const courseTypes = ["All", "Undergraduate", "Post Graduate", "Doctorate", "Diploma"]
const courseStatuses = ["All", "active", "inactive", "suspended"]
const universities = ["All", "Delhi University", "Mumbai University", "Bangalore University", "Pune University", "Chennai University", "Hyderabad University", "Kolkata University", "Ahmedabad University"]

// Type for UI display (with id instead of _id)
type DashboardCampusCourse = CampusCourse & {
  id: string; // UI uses 'id', backend uses '_id'
}

const mapCourseToDashboard = (course: CampusCourse): DashboardCampusCourse => ({
  ...course,
  id: course._id || '',
})

const CampusCoursePage = () => {
  const dispatch = useAppDispatch()
  const {
    items: courseItems,
    status: coursesStatus,
    error: coursesError,
    query,
    typeFilter,
    statusFilter,
    stats,
    selectedCourse: selectedCourseFromStore,
  } = useAppSelector((state) => state.campusCourses)

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState(query)
  const [selectedType, setSelectedType] = useState(typeFilter || 'All')
  const [selectedStatus, setSelectedStatus] = useState(statusFilter || 'All')
  const [selectedUniversity, setSelectedUniversity] = useState('All')
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<DashboardCampusCourse | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Sync local state with Redux
  useEffect(() => {
    dispatch(setCampusCourseQuery(searchTerm))
  }, [dispatch, searchTerm])

  useEffect(() => {
    dispatch(setCampusCourseTypeFilter(selectedType))
  }, [dispatch, selectedType])

  useEffect(() => {
    dispatch(setCampusCourseStatusFilter(selectedStatus))
  }, [dispatch, selectedStatus])

  // Fetch courses on mount and when filters change
  useEffect(() => {
    if (coursesStatus === 'idle') {
      dispatch(fetchCampusCourses(undefined))
      dispatch(fetchCampusCoursesStats())
    }
  }, [dispatch, coursesStatus])

  useEffect(() => {
    dispatch(fetchCampusCourses({
      q: query,
      type: selectedType === 'All' ? undefined : selectedType,
      status: selectedStatus === 'All' ? undefined : selectedStatus,
    }))
  }, [dispatch, query, selectedType, selectedStatus])

  // Map courses to dashboard format
  const courses = useMemo(() => courseItems.map(mapCourseToDashboard), [courseItems])

  // Sync selectedCourse from store
  useEffect(() => {
    if (selectedCourseFromStore) {
      setSelectedCourse(mapCourseToDashboard(selectedCourseFromStore))
    }
  }, [selectedCourseFromStore])

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.university.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedType === 'All' || course.type === selectedType
      const matchesStatus = selectedStatus === 'All' || course.status === selectedStatus
      const matchesUniversity = selectedUniversity === 'All' || course.university === selectedUniversity
      
      return matchesSearch && matchesType && matchesStatus && matchesUniversity
    })
  }, [courses, searchTerm, selectedType, selectedStatus, selectedUniversity])

  // Pagination logic
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex)

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedType, selectedStatus, selectedUniversity])

  const handleAddCourse = async (courseData: Omit<CampusCourse, "_id" | "createdAt" | "updatedAt">) => {
    setIsActionLoading(true)
    try {
      await dispatch(createCampusCourse(courseData)).unwrap()
      setShowAddModal(false)
      setSelectedCourse(null)
    } catch (error) {
      console.error('Failed to create course', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleUpdateCourse = async (courseId: string, courseData: Partial<CampusCourse>) => {
    setIsActionLoading(true)
    try {
      await dispatch(updateCampusCourse({ courseId, data: courseData })).unwrap()
      setShowEditModal(false)
      setSelectedCourse(null)
      dispatch(clearSelectedCampusCourse())
    } catch (error) {
      console.error('Failed to update course', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDeleteCourse = async () => {
    if (!selectedCourse || !selectedCourse._id) return
    
    setIsActionLoading(true)
    try {
      await dispatch(deleteCampusCourse(selectedCourse._id)).unwrap()
      setShowDeleteModal(false)
      setSelectedCourse(null)
      dispatch(clearSelectedCampusCourse())
    } catch (error) {
      console.error('Failed to delete course', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const openViewModal = async (course: DashboardCampusCourse) => {
    if (course._id) {
      await dispatch(fetchCampusCourseById(course._id))
    }
    setSelectedCourse(course)
    setShowViewModal(true)
  }

  const openEditModal = (course: DashboardCampusCourse) => {
    setSelectedCourse({ ...course })
    setShowEditModal(true)
  }

  const openDeleteModal = (course: DashboardCampusCourse) => {
    setSelectedCourse(course)
    setShowDeleteModal(true)
  }

  const isLoading = coursesStatus === 'loading' && courseItems.length === 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'secondary'
      case 'suspended': return 'destructive'
      default: return 'secondary'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Undergraduate': return 'default'
      case 'Post Graduate': return 'warning'
      case 'Doctorate': return 'destructive'
      case 'Diploma': return 'secondary'
      default: return 'secondary'
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Campus Courses</h1>
            <p className="text-muted-foreground">Manage university campus courses and programs</p>
          </div>
          <Button onClick={() => {
            setSelectedCourse(null)
            setShowAddModal(true)
          }} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Course
          </Button>
        </div>

        {/* Error Message */}
        {coursesError && (
          <Card>
            <CardContent className="p-4 text-sm text-destructive">
              {coursesError}
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                  <p className="text-2xl font-bold text-foreground">{(stats?.totalCourses as number) ?? courses.length}</p>
                </div>
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Courses</p>
                  <p className="text-2xl font-bold text-foreground">{(stats?.activeCourses as number) ?? courses.filter(c => c.status === 'active').length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold text-foreground">{(stats?.totalStudents as number) ?? courses.reduce((sum, c) => sum + (c.enrolled || 0), 0)}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">₹{((stats?.totalRevenue as number) ?? courses.reduce((sum, c) => sum + ((c.fees || 0) * (c.enrolled || 0)), 0) / 100000).toFixed(1)}L</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
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
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {courseTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type === 'All' ? 'All Types' : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {courseStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === 'All' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* University Filter */}
              <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map(university => (
                    <SelectItem key={university} value={university}>
                      {university === 'All' ? 'All Universities' : university}
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

        {/* Courses Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCourses.map(course => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg line-clamp-2">{course.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getStatusColor(course.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                      </Badge>
                      <Badge variant={getTypeColor(course.type) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {course.type}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{course.code} • {course.specialization}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">University:</span>
                      <span className="text-sm font-medium">{course.university}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Duration:</span>
                      <span className="text-sm font-medium">{course.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Fees:</span>
                      <span className="text-lg font-bold text-foreground">₹{course.fees.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Students:</span>
                      <span className="text-sm font-medium">{course.enrolled}/{course.seats}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{course.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 mt-auto">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => openViewModal(course)}
                          className="flex-1 gap-2"
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View course details</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => openEditModal(course)}
                          className="flex-1 gap-2"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit course</p>
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
                  <TableHead>Course</TableHead>
                  <TableHead>University</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Fees</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCourses.map(course => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{course.name}</p>
                        <p className="text-sm text-muted-foreground">{course.code} • {course.specialization}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-muted-foreground" />
                        <span>{course.university}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeColor(course.type) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {course.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{course.duration}</TableCell>
                    <TableCell className="font-medium">₹{course.fees.toLocaleString()}</TableCell>
                    <TableCell>{course.enrolled}/{course.seats}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(course.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => openViewModal(course)}
                              variant="ghost"
                              size="icon"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View course</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => openEditModal(course)}
                              variant="ghost"
                              size="icon"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit course</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => openDeleteModal(course)}
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete course</p>
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredCourses.length)} of {filteredCourses.length} courses
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

        {/* View Course Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Course Details - {selectedCourse?.name}</DialogTitle>
              <DialogDescription>
                Complete course information and curriculum details.
              </DialogDescription>
            </DialogHeader>
            {selectedCourse && (
              <div className="space-y-6">
                {/* Course Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Course Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Course Code:</span>
                        <span className="font-medium">{selectedCourse.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{selectedCourse.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant={getTypeColor(selectedCourse.type) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                          {selectedCourse.type}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Specialization:</span>
                        <span className="font-medium">{selectedCourse.specialization}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={getStatusColor(selectedCourse.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                          {selectedCourse.status.charAt(0).toUpperCase() + selectedCourse.status.slice(1)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>University & Location</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">University:</span>
                        <span className="font-medium">{selectedCourse.university}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">{selectedCourse.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fees:</span>
                        <span className="font-bold text-lg">₹{selectedCourse.fees.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Seats:</span>
                        <span className="font-medium">{selectedCourse.seats}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Enrolled:</span>
                        <span className="font-medium">{selectedCourse.enrolled}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>Course Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{selectedCourse.description}</p>
                  </CardContent>
                </Card>

                {/* Eligibility */}
                <Card>
                  <CardHeader>
                    <CardTitle>Eligibility Criteria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{selectedCourse.eligibility}</p>
                  </CardContent>
                </Card>

                {/* Curriculum */}
                <Card>
                  <CardHeader>
                    <CardTitle>Curriculum</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedCourse.curriculum.map((subject, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <span className="text-sm">{subject}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Faculty */}
                <Card>
                  <CardHeader>
                    <CardTitle>Faculty</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedCourse.faculty.map((faculty, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="text-sm">{faculty}</span>
                        </div>
                      ))}
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

        {/* Add Course Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
              <DialogDescription>
                Create a new campus course with all required information.
              </DialogDescription>
            </DialogHeader>
            <CourseForm
              course={null}
              onSubmit={(courseData) => {
                handleAddCourse(courseData)
              }}
              onCancel={() => {
                setShowAddModal(false)
                setSelectedCourse(null)
              }}
              isLoading={isActionLoading}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Course Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>
                Update course information and details.
              </DialogDescription>
            </DialogHeader>
            {selectedCourse && selectedCourse._id && (
              <CourseForm
                course={selectedCourse}
                onSubmit={(courseData) => {
                  handleUpdateCourse(courseData._id || '', courseData)
                }}
                onCancel={() => {
                  setShowEditModal(false)
                  setSelectedCourse(null)
                  dispatch(clearSelectedCampusCourse())
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
              <DialogTitle>Delete Course</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the course &quot;{selectedCourse?.name}&quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isActionLoading}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteCourse} 
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Course'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

// Course Form Component
const CourseForm = ({ course, onSubmit, onCancel, isLoading }: {
  course: DashboardCampusCourse | null
  onSubmit: (courseData: DashboardCampusCourse) => void
  onCancel: () => void
  isLoading: boolean
}) => {
  const [formData, setFormData] = useState({
    name: course?.name || '',
    code: course?.code || '',
    duration: course?.duration || '',
    fees: course?.fees || 0,
    university: course?.university || '',
    location: course?.location || '',
    type: course?.type || 'Undergraduate',
    specialization: course?.specialization || '',
    status: course?.status || 'active',
    seats: course?.seats || 0,
    description: course?.description || '',
    eligibility: course?.eligibility || '',
    curriculum: course?.curriculum || [],
    faculty: course?.faculty || []
  })

  const [curriculumInput, setCurriculumInput] = useState('')
  const [facultyInput, setFacultyInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const completeData: DashboardCampusCourse = {
      ...formData,
      _id: course?._id,
      id: course?.id || '',
      enrolled: course?.enrolled || 0,
      rating: course?.rating || 0,
      createdAt: course?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    onSubmit(completeData)
  }

  const addCurriculumItem = () => {
    if (curriculumInput.trim()) {
      setFormData({
        ...formData,
        curriculum: [...formData.curriculum, curriculumInput.trim()]
      })
      setCurriculumInput('')
    }
  }

  const removeCurriculumItem = (index: number) => {
    setFormData({
      ...formData,
      curriculum: formData.curriculum.filter((_, i) => i !== index)
    })
  }

  const addFacultyItem = () => {
    if (facultyInput.trim()) {
      setFormData({
        ...formData,
        faculty: [...formData.faculty, facultyInput.trim()]
      })
      setFacultyInput('')
    }
  }

  const removeFacultyItem = (index: number) => {
    setFormData({
      ...formData,
      faculty: formData.faculty.filter((_, i) => i !== index)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Course Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="code">Course Code</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({...formData, code: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => setFormData({...formData, duration: e.target.value})}
            placeholder="e.g., 3 Years"
            required
          />
        </div>
        <div>
          <Label htmlFor="fees">Fees (₹)</Label>
          <Input
            id="fees"
            type="number"
            value={formData.fees}
            onChange={(e) => setFormData({...formData, fees: parseInt(e.target.value)})}
            required
          />
        </div>
        <div>
          <Label htmlFor="university">University</Label>
          <Input
            id="university"
            value={formData.university}
            onChange={(e) => setFormData({...formData, university: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Course Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Undergraduate">Undergraduate</SelectItem>
              <SelectItem value="Post Graduate">Post Graduate</SelectItem>
              <SelectItem value="Doctorate">Doctorate</SelectItem>
              <SelectItem value="Diploma">Diploma</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="specialization">Specialization</Label>
          <Input
            id="specialization"
            value={formData.specialization}
            onChange={(e) => setFormData({...formData, specialization: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as "active" | "inactive"})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="seats">Total Seats</Label>
          <Input
            id="seats"
            type="number"
            value={formData.seats}
            onChange={(e) => setFormData({...formData, seats: parseInt(e.target.value)})}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
          required
        />
      </div>

      <div>
        <Label htmlFor="eligibility">Eligibility Criteria</Label>
        <Textarea
          id="eligibility"
          value={formData.eligibility}
          onChange={(e) => setFormData({...formData, eligibility: e.target.value})}
          rows={2}
          required
        />
      </div>

      <div>
        <Label>Curriculum</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={curriculumInput}
              onChange={(e) => setCurriculumInput(e.target.value)}
              placeholder="Add curriculum item"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCurriculumItem())}
            />
            <Button type="button" onClick={addCurriculumItem} variant="outline">
              Add
            </Button>
          </div>
          <div className="space-y-1">
            {formData.curriculum.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <span className="text-sm">{item}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCurriculumItem(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <Label>Faculty</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={facultyInput}
              onChange={(e) => setFacultyInput(e.target.value)}
              placeholder="Add faculty member"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFacultyItem())}
            />
            <Button type="button" onClick={addFacultyItem} variant="outline">
              Add
            </Button>
          </div>
          <div className="space-y-1">
            {formData.faculty.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <span className="text-sm">{item}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFacultyItem(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
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
              {course ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            course ? 'Update Course' : 'Create Course'
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default CampusCoursePage