'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Building2,
  Users,
  Briefcase,
  MapPin,
  Star,
  ChevronRight,
  FileText,
  UserCheck,
  Clock,
  UserX,
  Loader2,
  Grid3X3,
  List,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { fetchJobApplications } from '@/lib/redux/features/job-applicationSlice'
import { fetchJobs } from '@/lib/redux/features/jobsSlice'
import type { JobApplication } from '@/lib/redux/features/job-applicationSlice'
import type { Job } from '@/lib/redux/features/jobsSlice'

type CompanyWithApplications = {
  id: string
  name: string
  location: string
  totalApplications: number
  jobApplications: number
  internshipApplications: number
  hired: number
  underReview: number
  shortlisted: number
  rejected: number
  recentApplications: Array<{
    id: string
    candidateName: string
    position: string
    type: 'job' | 'internship'
    status: string
    appliedDate: string
  }>
}

const ApplicationsPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { items: jobApplications, status: applicationsStatus, error: applicationsError } = useAppSelector((state) => state.jobApplications)
  const { items: jobs, status: jobsStatus } = useAppSelector((state) => state.jobs)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (applicationsStatus === 'idle') {
      dispatch(fetchJobApplications(undefined))
    }
    if (jobsStatus === 'idle') {
      dispatch(fetchJobs(undefined))
    }
  }, [dispatch, applicationsStatus, jobsStatus])

  // Create a map of jobId -> Job for quick lookup
  const jobsMap = useMemo(() => {
    const map = new Map<string, Job>()
    jobs.forEach(job => {
      map.set(job.id, job)
    })
    return map
  }, [jobs])

  // Group applications by company
  const companiesWithApplications = useMemo(() => {
    const companyMap = new Map<string, {
      applications: Array<JobApplication & { job?: Job }>
      companyName: string
      location: string
    }>()

    jobApplications.forEach(app => {
      const job = jobsMap.get(app.jobId)
      if (!job) return

      const companyName = job.company
      const location = job.location

      if (!companyMap.has(companyName)) {
        companyMap.set(companyName, {
          applications: [],
          companyName,
          location,
        })
      }

      companyMap.get(companyName)!.applications.push({ ...app, job })
    })

    // Convert to array and calculate stats
    return Array.from(companyMap.entries()).map(([companyName, data], index) => {
      const applications = data.applications
      const jobApps = applications.filter(app => app.job?.type !== 'internship')
      const internshipApps = applications.filter(app => app.job?.type === 'internship')
      
      const statusCounts = {
        hired: applications.filter(app => app.status === 'hired').length,
        underReview: applications.filter(app => app.status === 'under_review').length,
        shortlisted: applications.filter(app => app.status === 'shortlisted').length,
        rejected: applications.filter(app => app.status === 'rejected').length,
      }

      // Get recent applications (sorted by createdAt, most recent first)
      const recentApplications = applications
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 2)
        .map(app => ({
          id: app._id || '',
          candidateName: app.name,
          position: app.job?.title || 'Unknown Position',
          type: (app.job?.type === 'internship' ? 'internship' : 'job') as 'job' | 'internship',
          status: app.status,
          appliedDate: app.createdAt,
        }))

      return {
        id: `company-${index}`,
        name: companyName,
        location: data.location,
        totalApplications: applications.length,
        jobApplications: jobApps.length,
        internshipApplications: internshipApps.length,
        hired: statusCounts.hired,
        underReview: statusCounts.underReview,
        shortlisted: statusCounts.shortlisted,
        rejected: statusCounts.rejected,
        recentApplications,
      } as CompanyWithApplications
    })
  }, [jobApplications, jobsMap])

  // Filter companies
  const filteredCompanies = useMemo(() => {
    return companiesWithApplications.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           company.location.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }, [companiesWithApplications, searchTerm])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under_review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'shortlisted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'interview_scheduled': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'hired': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'under_review': return 'Under Review'
      case 'shortlisted': return 'Shortlisted'
      case 'interview_scheduled': return 'Interview Scheduled'
      case 'hired': return 'Hired'
      case 'rejected': return 'Rejected'
      default: return status
    }
  }

  const handleCompanyClick = (companyName: string) => {
    // Find company index for routing (you may want to use company ID if available)
    const companyIndex = companiesWithApplications.findIndex(c => c.name === companyName)
    if (companyIndex !== -1) {
      router.push(`/dashboard/applications/${companyIndex + 1}`)
    }
  }

  // Calculate total stats
  const totalStats = useMemo(() => {
    return companiesWithApplications.reduce((acc, company) => ({
      totalApplications: acc.totalApplications + company.totalApplications,
      totalJobs: acc.totalJobs + company.jobApplications,
      totalInternships: acc.totalInternships + company.internshipApplications,
      totalHired: acc.totalHired + company.hired,
      totalUnderReview: acc.totalUnderReview + company.underReview,
      totalShortlisted: acc.totalShortlisted + company.shortlisted,
      totalRejected: acc.totalRejected + company.rejected
    }), {
      totalApplications: 0,
      totalJobs: 0,
      totalInternships: 0,
      totalHired: 0,
      totalUnderReview: 0,
      totalShortlisted: 0,
      totalRejected: 0
    })
  }, [companiesWithApplications])

  const isLoading = applicationsStatus === 'loading' || jobsStatus === 'loading'

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
          <h1 className="text-3xl font-bold text-foreground">Company Applications Overview</h1>
          <p className="text-muted-foreground">Monitor applications across all companies and positions</p>
        </div>
        </div>

        {/* Error Message */}
        {applicationsError && (
          <Card>
            <CardContent className="p-4 text-sm text-destructive">
              {applicationsError}
            </CardContent>
          </Card>
        )}

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold text-foreground">{totalStats.totalApplications}</p>
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
                <p className="text-2xl font-bold text-foreground">{totalStats.totalJobs}</p>
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
                <p className="text-2xl font-bold text-foreground">{totalStats.totalInternships}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                <p className="text-sm text-muted-foreground">Total Hired</p>
                <p className="text-2xl font-bold text-foreground">{totalStats.totalHired}</p>
              </div>
              <UserCheck className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Search and View Toggle */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search companies by name, industry, or location..."
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

      {/* Companies Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map(company => (
            <Card 
              key={company.id} 
              className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => handleCompanyClick(company.name)}
            >
              <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                        {company.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                        </Avatar>
                        <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {company.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {company.location}
                      </CardDescription>
                    </div>
                      </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Company Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-foreground">{company.totalApplications}</p>
                    <p className="text-xs text-muted-foreground">Total Applications</p>
                      </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-foreground">{company.hired}</p>
                    <p className="text-xs text-muted-foreground">Hired</p>
                        </div>
                      </div>

                {/* Application Types */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">Jobs</span>
                    </div>
                    <span className="text-sm font-medium">{company.jobApplications}</span>
                  </div>
                  <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-muted-foreground">Internships</span>
                    </div>
                    <span className="text-sm font-medium">{company.internshipApplications}</span>
                  </div>
                </div>

                {/* Status Breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">Under Review</span>
                          </div>
                    <span className="text-sm font-medium">{company.underReview}</span>
                          </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-muted-foreground">Shortlisted</span>
                          </div>
                    <span className="text-sm font-medium">{company.shortlisted}</span>
                          </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserX className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-muted-foreground">Rejected</span>
                    </div>
                    <span className="text-sm font-medium">{company.rejected}</span>
                          </div>
                        </div>

                {/* Recent Applications */}
                {company.recentApplications.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Recent Applications</p>
                    <div className="space-y-2">
                      {company.recentApplications.slice(0, 2).map(app => (
                        <div key={app.id} className="flex items-center justify-between text-sm">
                          <div>
                            <p className="font-medium">{app.candidateName}</p>
                            <p className="text-muted-foreground">{app.position}</p>
                          </div>
                          <Badge className={`text-xs ${getStatusColor(app.status)}`}>
                            {getStatusText(app.status)}
                            </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Total Applications</TableHead>
                <TableHead>Jobs</TableHead>
                <TableHead>Internships</TableHead>
                <TableHead>Hired</TableHead>
                <TableHead>Under Review</TableHead>
                <TableHead>Shortlisted</TableHead>
                <TableHead>Rejected</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map(company => (
                <TableRow 
                  key={company.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleCompanyClick(company.name)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                          {company.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{company.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span>{company.location}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{company.totalApplications}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-green-500" />
                      <span>{company.jobApplications}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-purple-500" />
                      <span>{company.internshipApplications}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-emerald-500" />
                      <span className="font-medium">{company.hired}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-yellow-500" />
                      <span>{company.underReview}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-blue-500" />
                      <span>{company.shortlisted}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <UserX className="w-3 h-3 text-red-500" />
                      <span>{company.rejected}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* No Results */}
      {filteredCompanies.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No companies found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or check back later for new companies.
            </p>
          </CardContent>
        </Card>
      )}

      </div>
    </TooltipProvider>
  )
}

export default ApplicationsPage