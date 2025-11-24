'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { 
  Search, 
  Grid3X3, 
  List, 
  Edit, 
  Trash2, 
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  GraduationCap,
  MapPin,
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
  fetchAdmissionRequests,
  updateAdmissionRequest,
  deleteAdmissionRequest,
  fetchAdmissionRequestById,
  fetchAdmissionRequestsStats,
  setAdmissionRequestQuery,
  setAdmissionRequestStatusFilter,
  setAdmissionRequestPriorityFilter,
  setAdmissionRequestCourseFilter,
  clearSelectedAdmissionRequest,
  type AdmissionRequest,
} from '@/lib/redux/features/admission-requestSlice'


const admissionStatuses = ["All", "pending", "under-review", "approved", "rejected", "waitlisted", "enrolled"]
const admissionPriorities = ["All", "low", "medium", "high"]
const courses = ["All", "MBA in Healthcare Management", "BSc in Nutrition", "MSc in Public Health", "BSc in Psychology", "PhD in Health Sciences", "MSc in Clinical Research", "BSc in Physiotherapy", "MSc in Dietetics", "BSc in Sports Science", "MSc in Ayurveda"]

// Type for UI display (with id instead of _id)
type DashboardAdmissionRequest = AdmissionRequest & {
  id: string; // UI uses 'id', backend uses '_id'
}

const mapRequestToDashboard = (request: AdmissionRequest): DashboardAdmissionRequest => ({
  ...request,
  id: request._id || '',
})

const AdmissionRequestPage = () => {
  const dispatch = useAppDispatch()
  const {
    items: requestItems,
    status: requestsStatus,
    error: requestsError,
    query,
    statusFilter,
    priorityFilter,
    courseFilter,
    stats,
    selectedRequest: selectedRequestFromStore,
  } = useAppSelector((state) => state.admissionRequests)

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState(query)
  const [selectedStatus, setSelectedStatus] = useState(statusFilter || 'All')
  const [selectedPriority, setSelectedPriority] = useState(priorityFilter || 'All')
  const [selectedCourse, setSelectedCourse] = useState(courseFilter || 'All')
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<DashboardAdmissionRequest | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Sync local state with Redux
  useEffect(() => {
    dispatch(setAdmissionRequestQuery(searchTerm))
  }, [dispatch, searchTerm])

  useEffect(() => {
    dispatch(setAdmissionRequestStatusFilter(selectedStatus))
  }, [dispatch, selectedStatus])

  useEffect(() => {
    dispatch(setAdmissionRequestPriorityFilter(selectedPriority))
  }, [dispatch, selectedPriority])

  useEffect(() => {
    dispatch(setAdmissionRequestCourseFilter(selectedCourse))
  }, [dispatch, selectedCourse])

  // Fetch requests on mount and when filters change
  useEffect(() => {
    if (requestsStatus === 'idle') {
      dispatch(fetchAdmissionRequests(undefined))
      dispatch(fetchAdmissionRequestsStats())
    }
  }, [dispatch, requestsStatus])

  useEffect(() => {
    dispatch(fetchAdmissionRequests({
      q: query,
      status: selectedStatus === 'All' ? undefined : selectedStatus,
      priority: selectedPriority === 'All' ? undefined : selectedPriority,
      course: selectedCourse === 'All' ? undefined : selectedCourse,
    }))
  }, [dispatch, query, selectedStatus, selectedPriority, selectedCourse])

  // Map requests to dashboard format
  const admissionRequests = useMemo(() => requestItems.map(mapRequestToDashboard), [requestItems])

  // Sync selectedRequest from store
  useEffect(() => {
    if (selectedRequestFromStore) {
      setSelectedRequest(mapRequestToDashboard(selectedRequestFromStore))
    }
  }, [selectedRequestFromStore])

  // Filter admission requests
  const filteredRequests = useMemo(() => {
    return admissionRequests.filter(request => {
      const matchesSearch = request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.university.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === 'All' || request.status === selectedStatus
      const matchesPriority = selectedPriority === 'All' || request.priority === selectedPriority
      const matchesCourse = selectedCourse === 'All' || request.course === selectedCourse
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCourse
    })
  }, [admissionRequests, searchTerm, selectedStatus, selectedPriority, selectedCourse])

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex)

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedStatus, selectedPriority, selectedCourse])

  const handleUpdateRequestStatus = async (requestId: string, updateData: Partial<AdmissionRequest>) => {
    setIsActionLoading(true)
    try {
      await dispatch(updateAdmissionRequest({ requestId, data: updateData })).unwrap()
      setShowEditModal(false)
      setSelectedRequest(null)
      dispatch(clearSelectedAdmissionRequest())
    } catch (error) {
      console.error('Failed to update admission request', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDeleteRequest = async () => {
    if (!selectedRequest || !selectedRequest._id) return
    
    setIsActionLoading(true)
    try {
      await dispatch(deleteAdmissionRequest(selectedRequest._id)).unwrap()
      setShowDeleteModal(false)
      setSelectedRequest(null)
      dispatch(clearSelectedAdmissionRequest())
    } catch (error) {
      console.error('Failed to delete admission request', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const openViewModal = async (request: DashboardAdmissionRequest) => {
    if (request._id) {
      await dispatch(fetchAdmissionRequestById(request._id))
    }
    setSelectedRequest(request)
    setShowViewModal(true)
  }

  const openEditModal = (request: DashboardAdmissionRequest) => {
    setSelectedRequest({ ...request })
    setShowEditModal(true)
  }

  const openDeleteModal = (request: DashboardAdmissionRequest) => {
    setSelectedRequest(request)
    setShowDeleteModal(true)
  }

  const isLoading = requestsStatus === 'loading' && requestItems.length === 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'under-review': return <FileText className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'waitlisted': return <TrendingUp className="w-4 h-4" />
      case 'enrolled': return <GraduationCap className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary'
      case 'under-review': return 'default'
      case 'approved': return 'success'
      case 'rejected': return 'destructive'
      case 'waitlisted': return 'warning'
      case 'enrolled': return 'success'
      default: return 'secondary'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'default'
      case 'medium': return 'warning'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admission Requests</h1>
            <p className="text-muted-foreground">Manage student admission applications and requests</p>
          </div>
        </div>

        {/* Error Message */}
        {requestsError && (
          <Card>
            <CardContent className="p-4 text-sm text-destructive">
              {requestsError}
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold text-foreground">{(stats?.totalApplications as number) ?? admissionRequests.length}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold text-foreground">{(stats?.pendingApplications as number) ?? admissionRequests.filter(r => r.status === 'pending').length}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-foreground">{(stats?.approvedApplications as number) ?? admissionRequests.filter(r => r.status === 'approved').length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Enrolled</p>
                  <p className="text-2xl font-bold text-foreground">{(stats?.enrolledApplications as number) ?? admissionRequests.filter(r => r.status === 'enrolled').length}</p>
                </div>
                <GraduationCap className="w-8 h-8 text-green-600" />
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
                  placeholder="Search applications..."
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
                  {admissionStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === 'All' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Course Filter */}
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course} value={course}>
                      {course === 'All' ? 'All Courses' : course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {admissionPriorities.map(priority => (
                    <SelectItem key={priority} value={priority}>
                      {priority === 'All' ? 'All Priorities' : priority.charAt(0).toUpperCase() + priority.slice(1)}
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

        {/* Applications Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedRequests.map(request => (
              <Card key={request.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{request.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getStatusColor(request.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('-', ' ')}</span>
                      </Badge>
                      <Badge variant={getPriorityColor(request.priority) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{request.course}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">University:</span>
                      <span className="text-sm font-medium">{request.university}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Location:</span>
                      <span className="text-sm font-medium">{request.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Application Date:</span>
                      <span className="text-sm font-medium">{new Date(request.applicationDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Expected Start:</span>
                      <span className="text-sm font-medium">{new Date(request.expectedStartDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Assigned To:</span>
                      <span className="text-sm font-medium">{request.assignedTo}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 mt-auto">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => openViewModal(request)}
                          className="flex-1 gap-2"
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View application details</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => openEditModal(request)}
                          className="flex-1 gap-2"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit application status</p>
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
                  <TableHead>Applicant</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>University</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Application Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRequests.map(request => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{request.name}</p>
                        <p className="text-sm text-muted-foreground">{request.email}</p>
                        <p className="text-sm text-muted-foreground">{request.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{request.course}</p>
                        <p className="text-sm text-muted-foreground">{request.university}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span>{request.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(request.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('-', ' ')}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(request.priority) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(request.applicationDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => openViewModal(request)}
                              variant="ghost"
                              size="icon"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View application</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => openEditModal(request)}
                              variant="ghost"
                              size="icon"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit application</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => openDeleteModal(request)}
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete application</p>
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} applications
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

        {/* View Application Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details - {selectedRequest?.name}</DialogTitle>
              <DialogDescription>
                Complete application information and documents.
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6">
                {/* Application Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{selectedRequest.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{selectedRequest.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">{selectedRequest.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">{selectedRequest.location}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Application Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={getStatusColor(selectedRequest.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                          {getStatusIcon(selectedRequest.status)}
                          <span className="ml-1">{selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1).replace('-', ' ')}</span>
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Priority:</span>
                        <Badge variant={getPriorityColor(selectedRequest.priority) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                          {selectedRequest.priority.charAt(0).toUpperCase() + selectedRequest.priority.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Course:</span>
                        <span className="font-medium">{selectedRequest.course}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">University:</span>
                        <span className="font-medium">{selectedRequest.university}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Assigned To:</span>
                        <span className="font-medium">{selectedRequest.assignedTo}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Application Date:</span>
                        <span className="font-medium">{new Date(selectedRequest.applicationDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expected Start Date:</span>
                        <span className="font-medium">{new Date(selectedRequest.expectedStartDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Contact:</span>
                        <span className="font-medium">{new Date(selectedRequest.lastContact).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                  <CardHeader>
                    <CardTitle>Submitted Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest.documents.map((doc, index) => (
                        <Badge key={index} variant="outline">
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                {selectedRequest.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{selectedRequest.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewModal(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Application Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Application Status</DialogTitle>
              <DialogDescription>
                Change the status of application for {selectedRequest?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && selectedRequest._id && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="application-status" className="mb-2 block">Application Status</Label>
                  <Select 
                    value={selectedRequest.status} 
                    onValueChange={(value) => setSelectedRequest({...selectedRequest, status: value as AdmissionRequest['status']})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {admissionStatuses.slice(1).map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="application-priority" className="mb-2 block">Priority</Label>
                  <Select 
                    value={selectedRequest.priority} 
                    onValueChange={(value) => setSelectedRequest({...selectedRequest, priority: value as AdmissionRequest['priority']})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {admissionPriorities.slice(1).map(priority => (
                        <SelectItem key={priority} value={priority}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="application-notes" className="mb-2 block">Notes</Label>
                  <Textarea
                    id="application-notes"
                    placeholder="Add application notes"
                    value={selectedRequest.notes || ''}
                    onChange={(e) => setSelectedRequest({...selectedRequest, notes: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowEditModal(false)
                setSelectedRequest(null)
                dispatch(clearSelectedAdmissionRequest())
              }} disabled={isActionLoading}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (selectedRequest && selectedRequest._id) {
                    handleUpdateRequestStatus(selectedRequest._id, {
                      status: selectedRequest.status,
                      priority: selectedRequest.priority,
                      notes: selectedRequest.notes,
                      lastContact: new Date().toISOString(),
                    })
                  }
                }} 
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Application'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Application</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the application for {selectedRequest?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isActionLoading}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteRequest} 
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Application'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

export default AdmissionRequestPage