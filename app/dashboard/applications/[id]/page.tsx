'use client'

import React, { useState, useMemo } from 'react'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Dummy company data
const dummyCompanyData = {
  1: {
    id: 1,
    name: "TechCorp Solutions",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center",
    industry: "Technology",
    location: "Bangalore, India",
    description: "Leading technology company specializing in software development and digital solutions.",
    totalApplications: 45,
    jobApplications: 32,
    internshipApplications: 13,
    hired: 8,
    underReview: 15,
    shortlisted: 12,
    rejected: 10,
    applications: [
      {
        id: 1,
        candidateName: "Rajesh Kumar",
        candidateEmail: "rajesh.kumar@email.com",
        candidatePhone: "+91 98765 43210",
        position: "Senior Software Engineer",
        jobId: "JOB-001",
        type: "job",
        status: "under_review",
        appliedDate: "2024-03-15",
        experience: "5 years",
        currentCompany: "TechCorp Solutions",
        expectedSalary: "₹12,00,000",
        location: "Bangalore, India",
        skills: ["React", "Node.js", "Python", "AWS", "Docker"],
        education: "B.Tech Computer Science - IIT Delhi",
        cvUrl: "https://example.com/cv/rajesh-kumar.pdf",
        coverLetter: "I am excited to apply for the Senior Software Engineer position at your company. With 5 years of experience in full-stack development, I believe I can contribute significantly to your team.",
        rating: 4.5,
        notes: "Strong technical background, good communication skills",
        interviewScheduled: false,
        interviewDate: null,
        feedback: "",
        tags: ["Senior", "Full-stack", "Experienced"]
      },
      {
        id: 2,
        candidateName: "Priya Sharma",
        candidateEmail: "priya.sharma@email.com",
        candidatePhone: "+91 98765 43211",
        position: "Data Scientist",
        jobId: "JOB-002",
        type: "job",
        status: "shortlisted",
        appliedDate: "2024-03-14",
        experience: "3 years",
        currentCompany: "DataTech Inc",
        expectedSalary: "₹8,50,000",
        location: "Mumbai, India",
        skills: ["Python", "Machine Learning", "SQL", "TensorFlow", "Pandas"],
        education: "M.Tech Data Science - IIT Bombay",
        cvUrl: "https://example.com/cv/priya-sharma.pdf",
        coverLetter: "As a passionate data scientist with expertise in machine learning and statistical analysis, I am eager to join your innovative team.",
        rating: 4.8,
        notes: "Excellent ML skills, strong analytical thinking",
        interviewScheduled: true,
        interviewDate: "2024-03-20",
        feedback: "Very promising candidate",
        tags: ["ML Expert", "Analytics", "Python"]
      },
      {
        id: 3,
        candidateName: "Amit Patel",
        candidateEmail: "amit.patel@email.com",
        candidatePhone: "+91 98765 43212",
        position: "Product Manager",
        jobId: "JOB-003",
        type: "job",
        status: "interview_scheduled",
        appliedDate: "2024-03-13",
        experience: "6 years",
        currentCompany: "ProductCorp",
        expectedSalary: "₹15,00,000",
        location: "Delhi, India",
        skills: ["Product Strategy", "Agile", "User Research", "Analytics", "Leadership"],
        education: "MBA - IIM Ahmedabad",
        cvUrl: "https://example.com/cv/amit-patel.pdf",
        coverLetter: "With extensive experience in product management and a track record of successful product launches, I am confident in my ability to drive growth.",
        rating: 4.6,
        notes: "Strong leadership skills, good product sense",
        interviewScheduled: true,
        interviewDate: "2024-03-18",
        feedback: "Scheduled for final round",
        tags: ["Leadership", "Strategy", "Experienced"]
      },
      {
        id: 4,
        candidateName: "Sneha Gupta",
        candidateEmail: "sneha.gupta@email.com",
        candidatePhone: "+91 98765 43213",
        position: "UX Designer",
        jobId: "JOB-004",
        type: "job",
        status: "rejected",
        appliedDate: "2024-03-12",
        experience: "2 years",
        currentCompany: "DesignStudio",
        expectedSalary: "₹6,50,000",
        location: "Pune, India",
        skills: ["Figma", "Adobe XD", "User Research", "Prototyping", "UI/UX"],
        education: "B.Des - NID Ahmedabad",
        cvUrl: "https://example.com/cv/sneha-gupta.pdf",
        coverLetter: "As a creative UX designer with a passion for user-centered design, I am excited about the opportunity to contribute to your design team.",
        rating: 3.8,
        notes: "Good design skills but lacks experience",
        interviewScheduled: false,
        interviewDate: null,
        feedback: "Not selected - insufficient experience for senior role",
        tags: ["Design", "Junior", "Creative"]
      },
      {
        id: 5,
        candidateName: "Vikram Singh",
        candidateEmail: "vikram.singh@email.com",
        candidatePhone: "+91 98765 43214",
        position: "DevOps Engineer",
        jobId: "JOB-005",
        type: "job",
        status: "hired",
        appliedDate: "2024-03-10",
        experience: "4 years",
        currentCompany: "CloudTech",
        expectedSalary: "₹10,00,000",
        location: "Hyderabad, India",
        skills: ["AWS", "Docker", "Kubernetes", "Jenkins", "Terraform"],
        education: "B.Tech - VIT Vellore",
        cvUrl: "https://example.com/cv/vikram-singh.pdf",
        coverLetter: "With expertise in cloud infrastructure and automation, I am ready to help scale your engineering operations.",
        rating: 4.7,
        notes: "Excellent technical skills, great cultural fit",
        interviewScheduled: true,
        interviewDate: "2024-03-16",
        feedback: "Hired - starts on April 1st",
        tags: ["DevOps", "Cloud", "Automation"]
      },
      {
        id: 6,
        candidateName: "Rahul Verma",
        candidateEmail: "rahul.verma@email.com",
        candidatePhone: "+91 98765 43215",
        position: "Frontend Developer Intern",
        jobId: "INT-001",
        type: "internship",
        status: "under_review",
        appliedDate: "2024-03-11",
        experience: "Fresher",
        currentCompany: "Student",
        expectedSalary: "₹25,000",
        location: "Delhi, India",
        skills: ["React", "JavaScript", "HTML", "CSS", "Git"],
        education: "B.Tech Computer Science - DTU",
        cvUrl: "https://example.com/cv/rahul-verma.pdf",
        coverLetter: "As a final year student with strong fundamentals in web development, I am eager to learn and contribute to your team.",
        rating: 4.2,
        notes: "Good potential, needs mentoring",
        interviewScheduled: false,
        interviewDate: null,
        feedback: "",
        tags: ["Fresher", "Frontend", "Intern"]
      }
    ]
  }
}

const CompanyApplicationsPage = () => {
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedType, setSelectedType] = useState('All')
  const [activeTab, setActiveTab] = useState('all')

  const company = dummyCompanyData[companyId as unknown as keyof typeof dummyCompanyData]

  // Filter applications - moved before early return to avoid conditional hook usage
  const filteredApplications = useMemo(() => {
    if (!company) return []
    
    let filtered = company.applications.filter(app => {
      const matchesSearch = app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = selectedStatus === 'All' || app.status === selectedStatus
      const matchesType = selectedType === 'All' || app.type === selectedType
      
      return matchesSearch && matchesStatus && matchesType
    })

    // Filter by tab
    if (activeTab === 'jobs') {
      filtered = filtered.filter(app => app.type === 'job')
    } else if (activeTab === 'internships') {
      filtered = filtered.filter(app => app.type === 'internship')
    }

    return filtered
  }, [company, searchTerm, selectedStatus, selectedType, activeTab])

  if (!company) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Company not found</h3>
          <p className="text-muted-foreground mb-4">The company you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/dashboard/applications')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'under_review': return <Clock className="w-4 h-4" />
      case 'shortlisted': return <Star className="w-4 h-4" />
      case 'interview_scheduled': return <Calendar className="w-4 h-4" />
      case 'hired': return <UserCheck className="w-4 h-4" />
      case 'rejected': return <UserX className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

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

  return (
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
            <h1 className="text-3xl font-bold text-foreground">{company.name}</h1>
            <p className="text-muted-foreground">{company.industry} • {company.location}</p>
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
                <p className="text-2xl font-bold text-foreground">{company.totalApplications}</p>
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
                <p className="text-2xl font-bold text-foreground">{company.jobApplications}</p>
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
                <p className="text-2xl font-bold text-foreground">{company.internshipApplications}</p>
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
                <p className="text-2xl font-bold text-foreground">{company.hired}</p>
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
                placeholder="Search applications..."
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
          <TabsTrigger value="all">All Applications ({company.totalApplications})</TabsTrigger>
          <TabsTrigger value="jobs">Jobs ({company.jobApplications})</TabsTrigger>
          <TabsTrigger value="internships">Internships ({company.internshipApplications})</TabsTrigger>
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
                  <TableHead>Experience</TableHead>
                  <TableHead>Expected Salary</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map(application => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{application.candidateName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{application.candidateName}</p>
                          <p className="text-sm text-muted-foreground">{application.candidateEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{application.position}</TableCell>
                    <TableCell>
                      <Badge variant={application.type === 'job' ? 'default' : 'secondary'}>
                        {application.type === 'job' ? 'Job' : 'Internship'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1">{getStatusText(application.status)}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>{application.experience}</TableCell>
                    <TableCell>{application.expectedSalary}</TableCell>
                    <TableCell>{new Date(application.appliedDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-current" />
                        <span className="text-sm font-medium">{application.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="w-4 h-4" />
                        </Button>
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
  )
}

export default CompanyApplicationsPage
