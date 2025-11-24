'use client'

import React, { useEffect, useMemo, useState } from 'react'
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
  Building,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Briefcase,
  Star,
  ExternalLink,
  Mail,
  Phone,
  Globe,
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
import { RootState, useAppDispatch, useAppSelector } from '@/lib/redux/store'
import {
  fetchJobs,
  createJob,
  fetchJobsStats,
  fetchJobById,
  setQuery,
  setLocation,
  setType,
  clearSelectedJob,
  updateJob,
  deleteJob
} from '@/lib/redux/features/jobsSlice'
import type { Job } from '@/lib/redux/features/jobsSlice'

type ExtendedJob = Job & {
  status?: string;
  category?: string;
  experience?: string;
  salary?: number;
  applicants?: number;
  maxApplicants?: number;
  applicationDeadline?: string;
  postedDate?: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  skills?: string[];
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  companySize?: string;
  industry?: string;
};

const parseSalaryFromStipend = (stipend?: string | null) => {
  if (!stipend) return 0
  const numeric = stipend.replace(/[^\d.]/g, '')
  return Number(numeric) || 0
}

const mapFormToJobPayload = (data: Partial<ExtendedJob>): Omit<Job, 'id' | 'postedAt'> => ({
  title: data.title || '',
  company: data.company || '',
  location: data.location || '',
  stipend: data.stipend ?? null,
  type: data.type || 'Full-time',
  duration: data.duration ?? null,
  tags: (Array.isArray(data.tags) && data.tags.length
    ? data.tags
    : Array.isArray(data.skills) && data.skills.length
      ? data.skills
      : []),
})

// Helper constants
const jobCategories = ["All", "Technology", "Marketing", "Data Science", "Design", "Business", "Content", "Cybersecurity", "Finance"]
const jobTypes = ["All", "Full-time", "Part-time", "Remote", "Hybrid"]
const jobStatuses = ["All", "active", "closed", "paused"]
const locations = ["All", "Bangalore, India", "Mumbai, India", "Pune, India", "Delhi, India", "Hyderabad, India", "Chennai, India"]

const JobsPage = () => {
  const dispatch = useAppDispatch()
  const { items, query, location, type, stats, selectedJob } = useAppSelector((s: RootState) => s.jobs)
  const jobs = useMemo(() => (items || []) as ExtendedJob[], [items])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState(query)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedType, setSelectedType] = useState(type || 'All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedLocation, setSelectedLocation] = useState(location || 'All')
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [jobToEdit, setJobToEdit] = useState<ExtendedJob | null>(null)
  const [jobToDelete, setJobToDelete] = useState<ExtendedJob | null>(null)
  const [jobToView, setJobToView] = useState<ExtendedJob | null>(null)
  const itemsPerPage = 12

  useEffect(() => {
    dispatch(
      fetchJobs({
        q: query || undefined,
        location: location || undefined,
        type: type || undefined,
      })
    )
  }, [dispatch, query, location, type])

  useEffect(() => {
    dispatch(fetchJobsStats())
  }, [dispatch])

  useEffect(() => {
    setSearchTerm(query)
  }, [query])

  useEffect(() => {
    setSelectedLocation(location || 'All')
  }, [location])

  useEffect(() => {
    setSelectedType(type || 'All')
  }, [type])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, selectedType, selectedStatus, selectedLocation])

  useEffect(() => {
    if (!selectedJob) return
    if (jobToView && jobToView.id === selectedJob.id) {
      setJobToView((prev) => (prev ? { ...prev, ...selectedJob } : (selectedJob as ExtendedJob)))
    }
    if (jobToEdit && jobToEdit.id === selectedJob.id) {
      setJobToEdit((prev) => (prev ? { ...prev, ...selectedJob } : (selectedJob as ExtendedJob)))
    }
  }, [selectedJob, jobToView, jobToEdit])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    dispatch(setQuery(value))
  }

  const handleTypeChange = (value: string) => {
    setSelectedType(value)
    dispatch(setType(value === 'All' ? '' : value))
  }

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value)
    dispatch(setLocation(value === 'All' ? '' : value))
  }

  const handleAddJob = async (formData: ExtendedJob) => {
    setIsActionLoading(true)
    try {
      await dispatch(createJob(mapFormToJobPayload(formData))).unwrap()
      setShowAddModal(false)
    } catch (err) {
      console.error('Failed to create job', err)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleUpdateJob = async (jobId: string, formData: ExtendedJob) => {
    setIsActionLoading(true)
    try {
      await dispatch(updateJob({ jobId, data: mapFormToJobPayload(formData) })).unwrap()
      setShowEditModal(false)
      setJobToEdit(null)
    } catch (err) {
      console.error('Failed to update job', err)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDeleteJob = async () => {
    if (!jobToDelete) return
    setIsActionLoading(true)
    try {
      await dispatch(deleteJob(jobToDelete.id)).unwrap()
      setShowDeleteModal(false)
      setJobToDelete(null)
    } catch (err) {
      console.error('Failed to delete job', err)
    } finally {
      setIsActionLoading(false)
    }
  }

  const openViewModal = (job: ExtendedJob) => {
    setJobToView(job)
    setShowViewModal(true)
    dispatch(fetchJobById(job.id))
  }

  const openEditModal = (job: ExtendedJob) => {
    setJobToEdit(job)
    setShowEditModal(true)
    dispatch(fetchJobById(job.id))
  }

  const openDeleteModal = (job: ExtendedJob) => {
    setJobToDelete(job)
    setShowDeleteModal(true)
  }

  const closeViewModal = () => {
    setShowViewModal(false)
    setJobToView(null)
    dispatch(clearSelectedJob())
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setJobToEdit(null)
    dispatch(clearSelectedJob())
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setJobToDelete(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'closed': return 'destructive'
      case 'paused': return 'warning'
      default: return 'secondary'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Technology': return 'default'
      case 'Marketing': return 'warning'
      case 'Data Science': return 'secondary'
      case 'Design': return 'destructive'
      case 'Business': return 'outline'
      case 'Content': return 'default'
      case 'Cybersecurity': return 'destructive'
      case 'Finance': return 'warning'
      default: return 'secondary'
    }
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const tags = Array.isArray(job.tags) ? job.tags : []
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesType = selectedType === 'All' || job.type === selectedType
      const matchesLocation =
        selectedLocation === 'All' ||
        (job.location || '').toLowerCase().includes(selectedLocation.toLowerCase())
      const jobStatus = job.status || 'active'
      const matchesStatus = selectedStatus === 'All' || jobStatus === selectedStatus
      const matchesCategory =
        selectedCategory === 'All' ||
        job.category === selectedCategory ||
        tags.some((tag) => tag.toLowerCase().includes(selectedCategory.toLowerCase()))

      return matchesSearch && matchesType && matchesLocation && matchesStatus && matchesCategory
    })
  }, [jobs, searchTerm, selectedCategory, selectedType, selectedStatus, selectedLocation])

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex)

  const totalJobsStat = stats?.totalJobs ?? jobs.length
  const activeJobsStat =
    stats?.activeJobs ?? jobs.filter((job) => (job.status || 'active') === 'active').length
  const totalApplicantsStat =
    stats?.totalApplicants ?? jobs.reduce((sum, job) => sum + (job.applicants || 0), 0)
  const averageSalaryValue =
    stats?.averageSalary ??
    (jobs.length
      ? jobs.reduce((sum, job) => sum + parseSalaryFromStipend(job.stipend), 0) / jobs.length
      : 0)
  const averageSalaryStat = `₹${((averageSalaryValue as number) / 100000).toFixed(1)}L`

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Jobs</h1>
            <p className="text-muted-foreground">Manage all job opportunities posted by companies</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Job
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl font-bold text-foreground">{totalJobsStat as number}</p>
                </div>
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Posts</p>
                  <p className="text-2xl font-bold text-foreground">{activeJobsStat as number}</p>
                </div>
                <Star className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Applicants</p>
                  <p className="text-2xl font-bold text-foreground">{totalApplicantsStat as number}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Salary</p>
                  <p className="text-2xl font-bold text-foreground">{averageSalaryStat as string}</p>
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
                  placeholder="Search jobs, companies, or skills..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {jobCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'All' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={selectedType} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map(type => (
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
                  {jobStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === 'All' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Location Filter */}
              <Select value={selectedLocation} onValueChange={handleLocationChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>
                      {location === 'All' ? 'All Locations' : location}
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

        {/* Jobs Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedJobs.map((job) => {
              const jobStatus = job.status || 'active'
              const jobCategory =
                job.category || (Array.isArray(job.tags) && job.tags.length ? job.tags[0] : 'General')
              const applicantsCount = job.applicants ?? (Array.isArray(job.tags) ? job.tags.length : 0)
              const stipendValue = parseSalaryFromStipend(job.stipend)
              const deadlineLabel = job.applicationDeadline || job.postedAt || ''
              const durationLabel = job.duration || job.experience || 'N/A'

              return (
                <Card key={job.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant={getStatusColor(jobStatus) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                          {jobStatus.charAt(0).toUpperCase() + jobStatus.slice(1)}
                        </Badge>
                        <Badge variant={getCategoryColor(jobCategory) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                          {jobCategory}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      {job.company}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1 flex flex-col">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Location:</span>
                        <span className="text-sm font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Experience:</span>
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {durationLabel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Salary:</span>
                        <span className="text-lg font-bold text-foreground">
                          {stipendValue ? `₹${(stipendValue / 100000).toFixed(1)}L` : 'Not specified'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Type:</span>
                        <span className="text-sm font-medium">{job.type}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Applicants:</span>
                        <span className="text-sm font-medium">{applicantsCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Deadline:</span>
                        <span className="text-sm font-medium">
                          {deadlineLabel ? new Date(deadlineLabel).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 mt-auto">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => openViewModal(job)}
                            className="flex-1 gap-2"
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View job details</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => openEditModal(job)}
                            className="flex-1 gap-2"
                            size="sm"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit job</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Applicants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedJobs.map((job) => {
                  const jobStatus = job.status || 'active'
                  const applicantsCount = job.applicants ?? (Array.isArray(job.tags) ? job.tags.length : 0)
                  const stipendValue = parseSalaryFromStipend(job.stipend)
                  const durationLabel = job.duration || job.experience || 'N/A'

                  return (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{job.title}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-muted-foreground" />
                          <span>{job.company}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span>{job.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>{job.type}</TableCell>
                      <TableCell>{durationLabel}</TableCell>
                      <TableCell className="font-medium">
                        {stipendValue ? `₹${(stipendValue / 100000).toFixed(1)}L` : 'Not specified'}
                      </TableCell>
                      <TableCell>{applicantsCount}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(jobStatus) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                          {jobStatus.charAt(0).toUpperCase() + jobStatus.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => openViewModal(job)}
                                variant="ghost"
                                size="icon"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View job</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => openEditModal(job)}
                                variant="ghost"
                                size="icon"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit job</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => openDeleteModal(job)}
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete job</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredJobs.length)} of {filteredJobs.length} jobs
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

        {/* View Job Modal */}
        <Dialog open={showViewModal} onOpenChange={(open) => (open ? setShowViewModal(true) : closeViewModal())}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Job Details - {jobToView?.title}</DialogTitle>
              <DialogDescription>
                Complete job information and application details.
              </DialogDescription>
            </DialogHeader>
            {jobToView && (
              <div className="space-y-6">
                {/* Job Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Company:</span>
                        <span className="font-medium">{jobToView.company}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <Badge variant={getCategoryColor(jobToView.category || 'General') as 'default' | 'secondary' | 'destructive' | 'outline'}>
                          {jobToView.category || 'General'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium">{jobToView.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Experience:</span>
                        <span className="font-medium">{jobToView.experience || jobToView.duration || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={getStatusColor(jobToView.status || 'active') as 'default' | 'secondary' | 'destructive' | 'outline'}>
                          {(jobToView.status || 'active').charAt(0).toUpperCase() + (jobToView.status || 'active').slice(1)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Details & Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">{jobToView.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Salary:</span>
                        <span className="font-bold text-lg">
                          {parseSalaryFromStipend(jobToView.stipend)
                            ? `₹${(parseSalaryFromStipend(jobToView.stipend) / 100000).toFixed(1)}L`
                            : 'Not specified'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Applicants:</span>
                        <span className="font-medium">
                          {(jobToView.applicants ?? 0)}/{jobToView.maxApplicants ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Deadline:</span>
                        <span className="font-medium">
                          {jobToView.applicationDeadline
                            ? new Date(jobToView.applicationDeadline).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Posted:</span>
                        <span className="font-medium">
                          {jobToView.postedAt
                            ? new Date(jobToView.postedAt).toLocaleDateString()
                            : jobToView.postedDate
                              ? new Date(jobToView.postedDate).toLocaleDateString()
                              : 'N/A'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{jobToView.description || 'No description provided'}</p>
                  </CardContent>
                </Card>

                {/* Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {Array.isArray(jobToView.requirements) && jobToView.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-muted-foreground">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Responsibilities */}
                <Card>
                  <CardHeader>
                    <CardTitle>Responsibilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {Array.isArray(jobToView.responsibilities) && jobToView.responsibilities.map((resp, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-muted-foreground">{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Benefits */}
                <Card>
                  <CardHeader>
                    <CardTitle>Benefits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {Array.isArray(jobToView.benefits) && jobToView.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle>Required Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(jobToView.skills ?? jobToView.tags) &&
                        (jobToView.skills ?? jobToView.tags)?.map((skill, index) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{jobToView.contactEmail || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{jobToView.contactPhone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      {jobToView.website ? (
                        <a
                          href={jobToView.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          {jobToView.website}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-sm">Not provided</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={closeViewModal}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Job Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Job</DialogTitle>
              <DialogDescription>
                Create a new job posting with all required information.
              </DialogDescription>
            </DialogHeader>
            <JobForm
              job={null}
              onSubmit={handleAddJob}
              onCancel={() => setShowAddModal(false)}
              isLoading={isActionLoading}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Job Modal */}
        <Dialog open={showEditModal} onOpenChange={(open) => (open ? setShowEditModal(true) : closeEditModal())}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Job</DialogTitle>
              <DialogDescription>
                Update job information and details.
              </DialogDescription>
            </DialogHeader>
            {jobToEdit && (
              <JobForm
                job={jobToEdit}
                onSubmit={(updatedJob) => {
                  handleUpdateJob(jobToEdit.id, updatedJob)
                }}
                onCancel={closeEditModal}
                isLoading={isActionLoading}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={(open) => (open ? setShowDeleteModal(true) : closeDeleteModal())}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Job</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the job &quot;{jobToDelete?.title}&quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={closeDeleteModal} disabled={isActionLoading}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteJob} 
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Job'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

// Job Form Component
const JobForm = ({ job, onSubmit, onCancel, isLoading }: {
  job: ExtendedJob | null
  onSubmit: (jobData: ExtendedJob) => void
  onCancel: () => void
  isLoading: boolean
}) => {
  const [formData, setFormData] = useState({
    title: job?.title || '',
    company: job?.company || '',
    location: job?.location || '',
    type: job?.type || 'Full-time',
    duration: job?.duration || job?.experience || '',
    experience: job?.experience || '',
    stipend: job?.stipend || '',
    category: job?.category || 'Technology',
    status: job?.status || 'active',
    postedDate: job?.postedAt || job?.postedDate || new Date().toISOString().split('T')[0],
    applicationDeadline: job?.applicationDeadline || '',
    description: job?.description || '',
    requirements: job?.requirements || [],
    responsibilities: job?.responsibilities || [],
    benefits: job?.benefits || [],
    skills: job?.skills || job?.tags || [],
    tags: job?.tags || [],
    contactEmail: job?.contactEmail || '',
    contactPhone: job?.contactPhone || '',
    website: job?.website || '',
    maxApplicants: job?.maxApplicants || 50,
    companySize: job?.companySize || '',
    industry: job?.industry || ''
  })

  useEffect(() => {
    setFormData({
      title: job?.title || '',
      company: job?.company || '',
      location: job?.location || '',
      type: job?.type || 'Full-time',
      duration: job?.duration || job?.experience || '',
      experience: job?.experience || '',
      stipend: job?.stipend || '',
      category: job?.category || 'Technology',
      status: job?.status || 'active',
      postedDate: job?.postedAt || job?.postedDate || new Date().toISOString().split('T')[0],
      applicationDeadline: job?.applicationDeadline || '',
      description: job?.description || '',
      requirements: job?.requirements || [],
      responsibilities: job?.responsibilities || [],
      benefits: job?.benefits || [],
      skills: job?.skills || job?.tags || [],
      tags: job?.tags || [],
      contactEmail: job?.contactEmail || '',
      contactPhone: job?.contactPhone || '',
      website: job?.website || '',
      maxApplicants: job?.maxApplicants || 50,
      companySize: job?.companySize || '',
      industry: job?.industry || ''
    })
  }, [job])

  const [requirementsInput, setRequirementsInput] = useState('')
  const [responsibilitiesInput, setResponsibilitiesInput] = useState('')
  const [benefitsInput, setBenefitsInput] = useState('')
  const [skillsInput, setSkillsInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const completeData = {
      ...formData,
      id: job?.id || Date.now().toString(),
      applicants: job?.applicants || 0,
      postedAt: job?.postedAt || job?.postedDate || new Date().toISOString(),
      tags: Array.isArray(formData.skills) && formData.skills.length ? formData.skills : formData.tags || []
    } as ExtendedJob
    onSubmit(completeData)
  }

  const addRequirement = () => {
    if (requirementsInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, requirementsInput.trim()]
      }))
      setRequirementsInput('')
    }
  }

  const removeRequirement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i: number) => i !== index)
    }))
  }

  const addResponsibility = () => {
    if (responsibilitiesInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        responsibilities: [...prev.responsibilities, responsibilitiesInput.trim()]
      }))
      setResponsibilitiesInput('')
    }
  }

  const removeResponsibility = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i: number) => i !== index)
    }))
  }

  const addBenefit = () => {
    if (benefitsInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        benefits: [...prev.benefits, benefitsInput.trim()]
      }))
      setBenefitsInput('')
    }
  }

  const removeBenefit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i: number) => i !== index)
    }))
  }

  const addSkill = () => {
    if (skillsInput.trim()) {
      setFormData((prev) => {
        const updatedSkills = [...prev.skills, skillsInput.trim()]
        return {
          ...prev,
          skills: updatedSkills,
          tags: updatedSkills
        }
      })
      setSkillsInput('')
    }
  }

  const removeSkill = (index: number) => {
    setFormData((prev) => {
      const updatedSkills = prev.skills.filter((_, i: number) => i !== index)
      return {
        ...prev,
        skills: updatedSkills,
        tags: updatedSkills
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="company">Company Name</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({...formData, company: e.target.value})}
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
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="experience">Experience Required</Label>
          <Input
            id="experience"
            value={formData.experience}
            onChange={(e) => setFormData({...formData, experience: e.target.value})}
            placeholder="e.g., 3-5 years"
            required
          />
        </div>
        <div>
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => setFormData({...formData, duration: e.target.value})}
            placeholder="e.g., 6 months"
          />
        </div>
        <div>
          <Label htmlFor="stipend">Stipend / Salary</Label>
          <Input
            id="stipend"
            value={formData.stipend}
            onChange={(e) => setFormData({...formData, stipend: e.target.value})}
            placeholder="e.g., ₹50,000 / month"
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Data Science">Data Science</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="Content">Content</SelectItem>
              <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="applicationDeadline">Application Deadline</Label>
          <Input
            id="applicationDeadline"
            type="date"
            value={formData.applicationDeadline}
            onChange={(e) => setFormData({...formData, applicationDeadline: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="maxApplicants">Max Applicants</Label>
          <Input
            id="maxApplicants"
            type="number"
            value={formData.maxApplicants}
            onChange={(e) => setFormData({...formData, maxApplicants: parseInt(e.target.value) || 0})}
            required
          />
        </div>
        <div>
          <Label htmlFor="companySize">Company Size</Label>
          <Input
            id="companySize"
            value={formData.companySize}
            onChange={(e) => setFormData({...formData, companySize: e.target.value})}
            placeholder="e.g., 100-500 employees"
          />
        </div>
        <div>
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            value={formData.industry}
            onChange={(e) => setFormData({...formData, industry: e.target.value})}
            placeholder="e.g., Information Technology"
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
        <Label>Requirements</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={requirementsInput}
              onChange={(e) => setRequirementsInput(e.target.value)}
              placeholder="Add requirement"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRequirement(); } }}
            />
            <Button type="button" onClick={addRequirement} variant="outline">
              Add
            </Button>
          </div>
          <div className="space-y-1">
            {Array.isArray(formData.requirements) && formData.requirements.map((req, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <span className="text-sm">{req}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRequirement(index)}
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
        <Label>Responsibilities</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={responsibilitiesInput}
              onChange={(e) => setResponsibilitiesInput(e.target.value)}
              placeholder="Add responsibility"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addResponsibility(); } }}
            />
            <Button type="button" onClick={addResponsibility} variant="outline">
              Add
            </Button>
          </div>
          <div className="space-y-1">
            {Array.isArray(formData.responsibilities) && formData.responsibilities.map((resp, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <span className="text-sm">{resp}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeResponsibility(index)}
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
        <Label>Benefits</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={benefitsInput}
              onChange={(e) => setBenefitsInput(e.target.value)}
              placeholder="Add benefit"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addBenefit(); } }}
            />
            <Button type="button" onClick={addBenefit} variant="outline">
              Add
            </Button>
          </div>
          <div className="space-y-1">
            {Array.isArray(formData.benefits) && formData.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <span className="text-sm">{benefit}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBenefit(index)}
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
        <Label>Required Skills</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="Add skill"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            />
            <Button type="button" onClick={addSkill} variant="outline">
              Add
            </Button>
          </div>
          <div className="space-y-1">
            {Array.isArray(formData.skills) && formData.skills.map((skill, index) => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input
            id="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="contactPhone">Contact Phone</Label>
          <Input
            id="contactPhone"
            value={formData.contactPhone}
            onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
            required
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="website">Company Website</Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({...formData, website: e.target.value})}
            placeholder="https://company.com"
          />
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
              {job ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            job ? 'Update Job' : 'Create Job'
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default JobsPage