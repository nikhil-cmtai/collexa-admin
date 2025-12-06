'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  Search, 
  Building2,
  Users,
  Briefcase,
  Eye,
  Calendar,
  Star,
  FileText,
  UserCheck,
  Clock,
  UserX,
  ArrowLeft,
  Download,
  MessageSquare,
  Loader2,
  Phone,
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { fetchJobApplications } from '@/lib/redux/features/job-applicationSlice'
import { fetchJobs } from '@/lib/redux/features/jobsSlice'
import type { JobApplication } from '@/lib/redux/features/job-applicationSlice'
import type { Job } from '@/lib/redux/features/jobsSlice'

const CompanyApplicationsPage = () => {
  const router = useRouter()
  const params = useParams()
  const dispatch = useAppDispatch()
  
  // Get ID from URL (e.g., '1' for the first company in the list)
  const companyIndexId = typeof params.id === 'string' ? parseInt(params.id) - 1 : -1

  const { items: jobApplications, status: applicationsStatus } = useAppSelector((state) => state.jobApplications)
  const { items: jobs, status: jobsStatus } = useAppSelector((state) => state.jobs)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedType, setSelectedType] = useState('All')
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (applicationsStatus === 'idle') {
      dispatch(fetchJobApplications(undefined))
    }
    if (jobsStatus === 'idle') {
      dispatch(fetchJobs(undefined))
    }
  }, [dispatch, applicationsStatus, jobsStatus])

  // Map Jobs for easy lookup
  const jobsMap = useMemo(() => {
    const map = new Map<string, Job>()
    if (Array.isArray(jobs)) {
      jobs.forEach(job => map.set(job._id, job))
    }
    return map
  }, [jobs])

  // Reconstruct the Company Data Structure (Same logic as main page for consistency)
  const companyData = useMemo(() => {
    const companyMap = new Map<string, {
      applications: Array<JobApplication & { job?: Job }>
      companyName: string
      location: string
      industry: string
    }>()

    let appsToProcess: JobApplication[] = []
    
    // Handle Redux state structure variations
    if (Array.isArray(jobApplications)) {
      appsToProcess = jobApplications
    } else if ((jobApplications as any)?.data?.docs) {
      appsToProcess = (jobApplications as any).data.docs
    } else if ((jobApplications as any)?.docs) {
      appsToProcess = (jobApplications as any).docs
    }

    appsToProcess.forEach(app => {
      const job = jobsMap.get(app.jobId)
      const companyName = job?.company || 'Unknown Company'
      const location = job?.location || 'Location N/A'
      
      if (!companyMap.has(companyName)) {
        companyMap.set(companyName, {
          applications: [],
          companyName,
          location,
          industry: "Technology" // Defaulting as industry isn't in Job type currently
        })
      }
      companyMap.get(companyName)!.applications.push({ ...app, job })
    })

    // Convert map to array to find by index
    const companiesArray = Array.from(companyMap.values()).map(data => {
      const applications = data.applications
      const jobApps = applications.filter(app => (app.job?.type as string) !== 'internship').length
      const internshipApps = applications.filter(app => (app.job?.type as string) === 'internship').length
      
      return {
        name: data.companyName,
        location: data.location,
        industry: data.industry,
        totalApplications: applications.length,
        jobApplications: jobApps,
        internshipApplications: internshipApps,
        hired: applications.filter(app => app.status === 'hired').length,
        underReview: applications.filter(app => app.status === 'under_review' || app.status === 'applied').length,
        shortlisted: applications.filter(app => app.status === 'shortlisted').length,
        rejected: applications.filter(app => app.status === 'rejected').length,
        applications: applications // All full application objects
      }
    })

    return companiesArray[companyIndexId] || null
  }, [jobApplications, jobsMap, companyIndexId])

  // Filter specific applications within the selected company
  const filteredApplications = useMemo(() => {
    if (!companyData) return []
    
    let filtered = companyData.applications.filter(app => {
      const jobTitle = app.job?.title || 'Unknown Position'
      const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
      
      const appStatus = app.status === 'applied' ? 'under_review' : app.status
      const matchesStatus = selectedStatus === 'All' || appStatus === selectedStatus
      
      const jobType = (app.job?.type as string) || 'job'
      const matchesType = selectedType === 'All' || 
                          (selectedType === 'job' && jobType !== 'internship') ||
                          (selectedType === 'internship' && jobType === 'internship')
      
      return matchesSearch && matchesStatus && matchesType
    })

    // Filter by tab
    if (activeTab === 'jobs') {
      filtered = filtered.filter(app => (app.job?.type as string) !== 'internship')
    } else if (activeTab === 'internships') {
      filtered = filtered.filter(app => (app.job?.type as string) === 'internship')
    }

    return filtered
  }, [companyData, searchTerm, selectedStatus, selectedType, activeTab])

  const isLoading = applicationsStatus === 'loading' || jobsStatus === 'loading'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!companyData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Company not found</h3>
          <p className="text-muted-foreground mb-4">The company you&apos;re looking for doesn&apos;t exist or hasn&apos;t received any applications yet.</p>
          <Button onClick={() => router.push('/dashboard/applications')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase()
    switch (s) {
      case 'applied':
      case 'under_review': return <Clock className="w-4 h-4" />
      case 'shortlisted': return <Star className="w-4 h-4" />
      case 'interview_scheduled': return <Calendar className="w-4 h-4" />
      case 'hired': return <UserCheck className="w-4 h-4" />
      case 'rejected': return <UserX className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase()
    switch (s) {
      case 'applied':
      case 'under_review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'shortlisted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'interview_scheduled': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'hired': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    const s = status.toLowerCase()
    switch (s) {
      case 'applied': return 'New Applied'
      case 'under_review': return 'Under Review'
      case 'shortlisted': return 'Shortlisted'
      case 'interview_scheduled': return 'Interview Scheduled'
      case 'hired': return 'Hired'
      case 'rejected': return 'Rejected'
      default: return status
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => router.push('/dashboard/applications')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{companyData.name}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" /> {companyData.location}
              </p>
            </div>
          </div>
        </div>

        {/* Company Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold text-foreground">{companyData.totalApplications}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Job Applications</p>
                  <p className="text-2xl font-bold text-foreground">{companyData.jobApplications}</p>
                </div>
                <Briefcase className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Internship Applications</p>
                  <p className="text-2xl font-bold text-foreground">{companyData.internshipApplications}</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hired</p>
                  <p className="text-2xl font-bold text-foreground">{companyData.hired}</p>
                </div>
                <UserCheck className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search candidates by name, email or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="job">Jobs</SelectItem>
                  <SelectItem value="internship">Internships</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Applications ({companyData.totalApplications})</TabsTrigger>
            <TabsTrigger value="jobs">Jobs ({companyData.jobApplications})</TabsTrigger>
            <TabsTrigger value="internships">Internships ({companyData.internshipApplications})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expected Salary</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map(application => (
                    <TableRow key={application._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                              {application.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{application.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> {application.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> {application.phone}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{application.job?.title || 'Unknown Position'}</TableCell>
                      <TableCell>
                        <Badge variant={(application.job?.type as string) === 'internship' ? 'secondary' : 'default'}>
                          {(application.job?.type as string) === 'internship' ? 'Internship' : 'Job'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1">{getStatusText(application.status)}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>{application.job?.salary ? `₹${application.job.salary.toLocaleString()}` : 'Not disclosed'}</TableCell>
                      <TableCell>{new Date(application.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/applications/details/${application._id}`)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Details</TooltipContent>
                          </Tooltip>

                          {application.resume && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a href={application.resume.startsWith('http') ? application.resume : `/uploads/${application.resume}`} target="_blank" rel="noreferrer">
                                  <Button variant="ghost" size="icon">
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </a>
                              </TooltipTrigger>
                              <TooltipContent>Download Resume</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* No Results */}
            {filteredApplications.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No applications found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or filters.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export default CompanyApplicationsPage