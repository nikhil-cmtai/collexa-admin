'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Download, 
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  User,
  Save,
  Loader2
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { 
  fetchJobApplicationById, 
  updateJobApplication 
} from '@/lib/redux/features/job-applicationSlice'
import { fetchJobs } from '@/lib/redux/features/jobsSlice'
import type { Job } from '@/lib/redux/features/jobsSlice'
import type { JobApplication } from '@/lib/redux/features/job-applicationSlice'

const ApplicationDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  
  const applicationId = params.id as string

  const { selectedJobApplication: application, status: appStatus, error } = useAppSelector((state) => state.jobApplications)
  const { items: jobs, status: jobsStatus } = useAppSelector((state) => state.jobs)

  const [notes, setNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (applicationId) {
      dispatch(fetchJobApplicationById(applicationId))
    }
  }, [dispatch, applicationId])

  useEffect(() => {
    if (jobsStatus === 'idle') {
      dispatch(fetchJobs(undefined))
    }
  }, [dispatch, jobsStatus])

  useEffect(() => {
    if (application) {
      setNotes(application.notes || '')
    }
  }, [application])

  const associatedJob = useMemo(() => {
    if (!application || !jobs.length) return null
    return jobs.find((j: Job) => j._id === application.jobId)
  }, [application, jobs])

  const handleStatusChange = async (newStatus: string) => {
    if (!application) return
    
    try {
      await dispatch(updateJobApplication({
        applicationId: application._id as string,
        data: { status: newStatus as JobApplication['status'] }
      })).unwrap()
      
      alert(`Status Updated: Application status changed to ${newStatus.replace('_', ' ')}`)
    } catch (error) {
      console.error("Failed to update status", error)
      alert("Error: Failed to update status")
    }
  }

  const handleSaveNotes = async () => {
    if (!application) return
    setIsUpdating(true)
    
    try {
      await dispatch(updateJobApplication({
        applicationId: application._id as string,
        data: { notes }
      })).unwrap()
      
      alert("Success: Internal notes have been updated.")
    } catch (error) {
      console.error("Failed to save notes", error)
      alert("Error: Failed to save notes")
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
      case 'under_review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200'
      case 'shortlisted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200'
      case 'interview_scheduled': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200'
      case 'hired': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  if (appStatus === 'loading' || jobsStatus === 'loading') {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="p-4 rounded-full bg-destructive/10">
          <XCircle className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">Application Not Found</h2>
        <p className="text-muted-foreground">The application you are looking for does not exist or has been deleted.</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mt-1">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">{application.name}</h1>
              <Badge variant="outline" className={`${getStatusColor(application.status)} capitalize`}>
                {formatStatus(application.status)}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" />
                {associatedJob?.title || 'Unknown Position'}
              </span>
              <span className="flex items-center gap-1.5">
                <Building className="w-4 h-4" />
                {associatedJob?.company || 'Unknown Company'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Applied {new Date(application.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select 
            defaultValue={application.status} 
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Change Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          
          {application.resume && (
             <Button variant="outline" asChild>
               <a 
                 href={application.resume.startsWith('http') ? application.resume : `/uploads/${application.resume}`} 
                 target="_blank" 
                 rel="noopener noreferrer"
               >
                 <Download className="w-4 h-4 mr-2" />
                 Resume
               </a>
             </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {application.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Candidate</p>
                  <p className="text-xs text-muted-foreground">ID: {application._id?.slice(-6)}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${application.email}`} className="hover:underline text-foreground">
                    {application.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${application.phone}`} className="hover:underline text-foreground">
                    {application.phone}
                  </a>
                </div>
                {associatedJob?.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{associatedJob.location}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {associatedJob ? (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Position</p>
                    <p className="font-medium">{associatedJob.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Department/Industry</p>
                    <p className="font-medium">{associatedJob.category || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Employment Type</p>
                    <Badge variant="secondary" className="capitalize">
                      {associatedJob.type}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Salary Range</p>
                    <p className="font-medium">
                      {associatedJob.salary ? `₹${associatedJob.salary.toLocaleString()}` : 'Not disclosed'}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Job details not available.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="h-full">
            <CardHeader>
              <Tabs defaultValue="details" className="w-full">
                <div className="flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="details">Application Details</TabsTrigger>
                    <TabsTrigger value="resume">Resume Preview</TabsTrigger>
                    <TabsTrigger value="notes">Internal Notes</TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="mt-6">
                  <TabsContent value="details" className="m-0 space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Cover Letter</h3>
                      <div className="p-4 bg-muted/50 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
                        {application.coverLetter || "No cover letter provided."}
                      </div>
                    </div>
                    
                    {application.message && (
                      <div>
                         <h3 className="text-sm font-medium text-muted-foreground mb-2">Additional Message</h3>
                         <div className="p-4 border rounded-lg text-sm">
                           {application.message}
                         </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 border rounded-lg bg-card">
                         <div className="flex items-center gap-2 mb-2">
                           <Clock className="w-4 h-4 text-blue-500"/>
                           <p className="text-sm font-medium">Last Updated</p>
                         </div>
                         <p className="text-2xl font-bold">
                           {new Date(application.updatedAt).toLocaleDateString()}
                         </p>
                       </div>
                       <div className="p-4 border rounded-lg bg-card">
                         <div className="flex items-center gap-2 mb-2">
                           <CheckCircle2 className="w-4 h-4 text-green-500"/>
                           <p className="text-sm font-medium">Current Stage</p>
                         </div>
                         <p className="text-xl font-bold capitalize">
                           {formatStatus(application.status)}
                         </p>
                       </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="resume" className="m-0">
                    <div className="border rounded-lg overflow-hidden bg-muted/20 min-h-[500px] flex items-center justify-center">
                      {application.resume ? (
                        <iframe 
                          src={application.resume.startsWith('http') ? application.resume : `/uploads/${application.resume}`}
                          className="w-full h-[600px]"
                          title="Resume Preview"
                        />
                      ) : (
                        <div className="text-center p-8">
                          <p className="text-muted-foreground">No resume uploaded</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="notes" className="m-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <h3 className="text-sm font-medium">Recruiter Notes</h3>
                         <span className="text-xs text-muted-foreground">Visible only to internal team</span>
                      </div>
                      <Textarea 
                        placeholder="Add notes about the candidate, interview feedback, etc..."
                        className="min-h-[200px] resize-none"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                      <div className="flex justify-end">
                        <Button onClick={handleSaveNotes} disabled={isUpdating}>
                          {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          <Save className="w-4 h-4 mr-2" />
                          Save Notes
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ApplicationDetailsPage