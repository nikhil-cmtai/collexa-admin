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
  Code,
  Users,
  BookOpen,
  DollarSign,
  Star,
  Monitor,
  Database,
  Smartphone,
  Palette,
  BarChart3,
  Globe,
  Shield,
  Zap,
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
  fetchSkillBasedCourses,
  createSkillBasedCourse,
  updateSkillBasedCourse,
  deleteSkillBasedCourse,
  fetchSkillBasedCourseById,
  fetchSkillBasedCoursesStats,
  setSkillBasedCourseQuery,
  setSkillBasedCourseCategoryFilter,
  setSkillBasedCourseLevelFilter,
  setSkillBasedCourseStatusFilter,
  clearSelectedSkillBasedCourse,
  type SkillBasedCourse,
} from '@/lib/redux/features/skill-based-courseSlice'


const courseCategories = ["All", "Web Development", "Data Science", "Mobile Development", "Design", "Cloud Computing", "Digital Marketing", "Cybersecurity", "DevOps"]
const courseLevels = ["All", "Beginner", "Intermediate", "Advanced", "Beginner to Intermediate", "Intermediate to Advanced", "Beginner to Advanced"]
const courseStatuses = ["All", "active", "inactive", "suspended"]
const platforms = ["All", "Online + Hands-on Labs", "Online + Project-based", "Online + Live Coding", "Online + Design Reviews", "Online + AWS Labs", "Online + Case Studies", "Online + Virtual Labs"]

// Type for UI display (with id instead of _id)
type DashboardSkillBasedCourse = SkillBasedCourse & {
  id: string; // UI uses 'id', backend uses '_id'
}

const mapCourseToDashboard = (course: SkillBasedCourse): DashboardSkillBasedCourse => ({
  ...course,
  id: course._id || '',
})

const SkillsBasedPage = () => {
  const dispatch = useAppDispatch()
  const {
    items: courseItems,
    status: coursesStatus,
    error: coursesError,
    query,
    categoryFilter,
    levelFilter,
    statusFilter,
    stats,
    selectedCourse: selectedCourseFromStore,
  } = useAppSelector((state) => state.skillBasedCourses)

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState(query)
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter || 'All')
  const [selectedLevel, setSelectedLevel] = useState(levelFilter || 'All')
  const [selectedStatus, setSelectedStatus] = useState(statusFilter || 'All')
  const [selectedPlatform, setSelectedPlatform] = useState('All')
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<DashboardSkillBasedCourse | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Sync local state with Redux
  useEffect(() => {
    dispatch(setSkillBasedCourseQuery(searchTerm))
  }, [dispatch, searchTerm])

  useEffect(() => {
    dispatch(setSkillBasedCourseCategoryFilter(selectedCategory))
  }, [dispatch, selectedCategory])

  useEffect(() => {
    dispatch(setSkillBasedCourseLevelFilter(selectedLevel))
  }, [dispatch, selectedLevel])

  useEffect(() => {
    dispatch(setSkillBasedCourseStatusFilter(selectedStatus))
  }, [dispatch, selectedStatus])

  // Fetch courses on mount and when filters change
  useEffect(() => {
    if (coursesStatus === 'idle') {
      dispatch(fetchSkillBasedCourses(undefined))
      dispatch(fetchSkillBasedCoursesStats())
    }
  }, [dispatch, coursesStatus])

  useEffect(() => {
    dispatch(fetchSkillBasedCourses({
      q: query,
      category: selectedCategory === 'All' ? undefined : selectedCategory,
      level: selectedLevel === 'All' ? undefined : selectedLevel,
      status: selectedStatus === 'All' ? undefined : selectedStatus,
    }))
  }, [dispatch, query, selectedCategory, selectedLevel, selectedStatus])

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
                           course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory
      const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel
      const matchesStatus = selectedStatus === 'All' || course.status === selectedStatus
      const matchesPlatform = selectedPlatform === 'All' || course.platform === selectedPlatform
      
      return matchesSearch && matchesCategory && matchesLevel && matchesStatus && matchesPlatform
    })
  }, [courses, searchTerm, selectedCategory, selectedLevel, selectedStatus, selectedPlatform])

  // Pagination logic
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex)

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, selectedLevel, selectedStatus, selectedPlatform])

  const handleAddCourse = async (courseData: Omit<SkillBasedCourse, "_id" | "createdAt" | "updatedAt">) => {
    setIsActionLoading(true)
    try {
      await dispatch(createSkillBasedCourse(courseData)).unwrap()
      setShowAddModal(false)
      setSelectedCourse(null)
    } catch (error) {
      console.error('Failed to create course', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleUpdateCourse = async (courseId: string, courseData: Partial<SkillBasedCourse>) => {
    setIsActionLoading(true)
    try {
      await dispatch(updateSkillBasedCourse({ courseId, data: courseData })).unwrap()
      setShowEditModal(false)
      setSelectedCourse(null)
      dispatch(clearSelectedSkillBasedCourse())
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
      await dispatch(deleteSkillBasedCourse(selectedCourse._id)).unwrap()
      setShowDeleteModal(false)
      setSelectedCourse(null)
      dispatch(clearSelectedSkillBasedCourse())
    } catch (error) {
      console.error('Failed to delete course', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const openViewModal = async (course: DashboardSkillBasedCourse) => {
    if (course._id) {
      await dispatch(fetchSkillBasedCourseById(course._id))
    }
    setSelectedCourse(course)
    setShowViewModal(true)
  }

  const openEditModal = (course: DashboardSkillBasedCourse) => {
    setSelectedCourse({ ...course })
    setShowEditModal(true)
  }

  const openDeleteModal = (course: DashboardSkillBasedCourse) => {
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Web Development': return <Globe className="w-4 h-4" />
      case 'Data Science': return <BarChart3 className="w-4 h-4" />
      case 'Mobile Development': return <Smartphone className="w-4 h-4" />
      case 'Design': return <Palette className="w-4 h-4" />
      case 'Cloud Computing': return <Database className="w-4 h-4" />
      case 'Digital Marketing': return <Monitor className="w-4 h-4" />
      case 'Cybersecurity': return <Shield className="w-4 h-4" />
      case 'DevOps': return <Zap className="w-4 h-4" />
      default: return <Code className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Web Development': return 'default'
      case 'Data Science': return 'warning'
      case 'Mobile Development': return 'secondary'
      case 'Design': return 'destructive'
      case 'Cloud Computing': return 'outline'
      case 'Digital Marketing': return 'default'
      case 'Cybersecurity': return 'destructive'
      case 'DevOps': return 'warning'
      default: return 'secondary'
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Skills-Based Courses</h1>
            <p className="text-muted-foreground">Manage practical skills courses like web development, data analytics, and more</p>
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
                <Code className="w-8 h-8 text-primary" />
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
                  placeholder="Search courses, skills, or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {courseCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'All' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Level Filter */}
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {courseLevels.map(level => (
                    <SelectItem key={level} value={level}>
                      {level === 'All' ? 'All Levels' : level}
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

              {/* Platform Filter */}
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map(platform => (
                    <SelectItem key={platform} value={platform}>
                      {platform === 'All' ? 'All Platforms' : platform}
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
                      <Badge variant={getCategoryColor(course.category) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {getCategoryIcon(course.category)}
                        <span className="ml-1">{course.category}</span>
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{course.code} • {course.level}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Platform:</span>
                      <span className="text-sm font-medium">{course.platform}</span>
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
                  <TableHead>Category</TableHead>
                  <TableHead>Level</TableHead>
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
                        <p className="text-sm text-muted-foreground">{course.code} • {course.instructor}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getCategoryColor(course.category) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {getCategoryIcon(course.category)}
                        <span className="ml-1">{course.category}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>{course.level}</TableCell>
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
                Complete course information and skills details.
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
                        <span className="text-muted-foreground">Category:</span>
                        <Badge variant={getCategoryColor(selectedCourse.category) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                          {getCategoryIcon(selectedCourse.category)}
                          <span className="ml-1">{selectedCourse.category}</span>
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Level:</span>
                        <span className="font-medium">{selectedCourse.level}</span>
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
                      <CardTitle>Course Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
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
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rating:</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{selectedCourse.rating}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Platform:</span>
                        <span className="font-medium">{selectedCourse.platform}</span>
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

                {/* Prerequisites */}
                <Card>
                  <CardHeader>
                    <CardTitle>Prerequisites</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{selectedCourse.prerequisites}</p>
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle>Skills You&apos;ll Learn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedCourse.skills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                          <Code className="w-4 h-4 text-primary" />
                          <span className="text-sm">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Projects */}
                <Card>
                  <CardHeader>
                    <CardTitle>Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedCourse.projects.map((project, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <span className="text-sm">{project}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Instructor */}
                <Card>
                  <CardHeader>
                    <CardTitle>Instructor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{selectedCourse.instructor}</span>
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
              <DialogTitle>Add New Skills-Based Course</DialogTitle>
              <DialogDescription>
                Create a new skills-based course with all required information.
              </DialogDescription>
            </DialogHeader>
            <SkillsCourseForm
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
              <DialogTitle>Edit Skills-Based Course</DialogTitle>
              <DialogDescription>
                Update course information and details.
              </DialogDescription>
            </DialogHeader>
            {selectedCourse && selectedCourse._id && (
              <SkillsCourseForm
                course={selectedCourse}
                onSubmit={(courseData) => {
                  handleUpdateCourse(courseData._id || '', courseData)
                }}
                onCancel={() => {
                  setShowEditModal(false)
                  setSelectedCourse(null)
                  dispatch(clearSelectedSkillBasedCourse())
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

// Skills Course Form Component
const SkillsCourseForm = ({ course, onSubmit, onCancel, isLoading }: {
  course: DashboardSkillBasedCourse | null
  onSubmit: (courseData: DashboardSkillBasedCourse) => void
  onCancel: () => void
  isLoading: boolean
}) => {
  const [formData, setFormData] = useState({
    name: course?.name || '',
    code: course?.code || '',
    duration: course?.duration || '',
    fees: course?.fees || 0,
    category: course?.category || 'Web Development',
    level: course?.level || 'Beginner',
    status: course?.status || 'active',
    seats: course?.seats || 0,
    description: course?.description || '',
    prerequisites: course?.prerequisites || '',
    skills: course?.skills || [],
    projects: course?.projects || [],
    instructor: course?.instructor || '',
    platform: course?.platform || 'Online + Hands-on Labs'
  })

  const [skillsInput, setSkillsInput] = useState('')
  const [projectsInput, setProjectsInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const completeData: DashboardSkillBasedCourse = {
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

  const addSkill = () => {
    if (skillsInput.trim()) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillsInput.trim()]
      })
      setSkillsInput('')
    }
  }

  const removeSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index)
    })
  }

  const addProject = () => {
    if (projectsInput.trim()) {
      setFormData({
        ...formData,
        projects: [...formData.projects, projectsInput.trim()]
      })
      setProjectsInput('')
    }
  }

  const removeProject = (index: number) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((_, i) => i !== index)
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
            placeholder="e.g., 6 Months"
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
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Web Development">Web Development</SelectItem>
              <SelectItem value="Data Science">Data Science</SelectItem>
              <SelectItem value="Mobile Development">Mobile Development</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Cloud Computing">Cloud Computing</SelectItem>
              <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
              <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
              <SelectItem value="DevOps">DevOps</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="level">Level</Label>
          <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
              <SelectItem value="Beginner to Intermediate">Beginner to Intermediate</SelectItem>
              <SelectItem value="Intermediate to Advanced">Intermediate to Advanced</SelectItem>
              <SelectItem value="Beginner to Advanced">Beginner to Advanced</SelectItem>
            </SelectContent>
          </Select>
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
        <div>
          <Label htmlFor="instructor">Instructor</Label>
          <Input
            id="instructor"
            value={formData.instructor}
            onChange={(e) => setFormData({...formData, instructor: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="platform">Platform</Label>
          <Select value={formData.platform} onValueChange={(value) => setFormData({...formData, platform: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Online + Hands-on Labs">Online + Hands-on Labs</SelectItem>
              <SelectItem value="Online + Project-based">Online + Project-based</SelectItem>
              <SelectItem value="Online + Live Coding">Online + Live Coding</SelectItem>
              <SelectItem value="Online + Design Reviews">Online + Design Reviews</SelectItem>
              <SelectItem value="Online + AWS Labs">Online + AWS Labs</SelectItem>
              <SelectItem value="Online + Case Studies">Online + Case Studies</SelectItem>
              <SelectItem value="Online + Virtual Labs">Online + Virtual Labs</SelectItem>
            </SelectContent>
          </Select>
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
        <Label htmlFor="prerequisites">Prerequisites</Label>
        <Textarea
          id="prerequisites"
          value={formData.prerequisites}
          onChange={(e) => setFormData({...formData, prerequisites: e.target.value})}
          rows={2}
          required
        />
      </div>

      <div>
        <Label>Skills You&apos;ll Learn</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="Add skill"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <Button type="button" onClick={addSkill} variant="outline">
              Add
            </Button>
          </div>
          <div className="space-y-1">
            {formData.skills.map((skill, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <span className="text-sm">{skill}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSkill(index)}
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
        <Label>Projects</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={projectsInput}
              onChange={(e) => setProjectsInput(e.target.value)}
              placeholder="Add project"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProject())}
            />
            <Button type="button" onClick={addProject} variant="outline">
              Add
            </Button>
          </div>
          <div className="space-y-1">
            {formData.projects.map((project, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <span className="text-sm">{project}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProject(index)}
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

export default SkillsBasedPage