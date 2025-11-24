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
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import {
  fetchInternships,
  createInternship,
  updateInternship,
  deleteInternship,
} from '@/lib/redux/features/internshipsSlice'
import type { Internship as InternshipModel } from '@/lib/redux/features/internshipsSlice'

type DashboardInternship = InternshipModel & {
  applicants: number;
  maxApplicants: number;
  rating: number;
};

const mapInternshipToDashboard = (internship: InternshipModel): DashboardInternship => ({
  ...internship,
  id: internship.id || internship._id || "",
  applicants: internship.applicants ?? 0,
  maxApplicants: internship.maxApplicants ?? 0,
  rating: internship.rating ?? 0,
  requirements: internship.requirements ?? [],
  responsibilities: internship.responsibilities ?? [],
  benefits: internship.benefits ?? [],
  skills: internship.skills ?? [],
  contactEmail: internship.contactEmail ?? "",
  contactPhone: internship.contactPhone ?? "",
  website: internship.website ?? "",
  companySize: internship.companySize ?? "",
  industry: internship.industry ?? "",
});

const createEmptyInternship = (): DashboardInternship => ({
  id: "",
  title: "",
  company: "",
  location: "",
  type: "Full-time",
  duration: "",
  stipend: 0,
  category: "Technology",
  status: "active",
  postedDate: new Date().toISOString().split("T")[0],
  applicationDeadline: "",
  description: "",
  requirements: [],
  responsibilities: [],
  benefits: [],
  skills: [],
  contactEmail: "",
  contactPhone: "",
  website: "",
  applicants: 0,
  maxApplicants: 50,
  rating: 0,
  companySize: "",
  industry: "",
});

const mapFormToPayload = (values: DashboardInternship) => {
  const {...rest } = values;
  return rest;
};

const internshipCategories = ["All", "Technology", "Marketing", "Data Science", "Design", "Business", "Content", "Cybersecurity", "Finance"]
const internshipTypes = ["All", "Full-time", "Part-time", "Remote", "Hybrid"]
const internshipStatuses = ["All", "active", "closed", "paused"]
const locations = ["All", "Bangalore, India", "Mumbai, India", "Pune, India", "Delhi, India", "Hyderabad, India", "Chennai, India"]

const InternshipsPage = () => {
  const dispatch = useAppDispatch()
  const { items: internshipItems, status: internshipsStatus } = useAppSelector((state) => state.internships)

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedLocation, setSelectedLocation] = useState('All')
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedInternship, setSelectedInternship] = useState<DashboardInternship | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  useEffect(() => {
    if (internshipsStatus === 'idle') {
      dispatch(fetchInternships(undefined))
    }
  }, [dispatch, internshipsStatus])

  const internships = useMemo<DashboardInternship[]>(
    () => internshipItems.map((internship) => mapInternshipToDashboard(internship)),
    [internshipItems]
  )

  const filteredInternships = useMemo<DashboardInternship[]>(() => {
    return internships.filter((internship) => {
      const matchesSearch =
        internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           internship.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === 'All' || internship.category === selectedCategory
      const matchesType = selectedType === 'All' || internship.type === selectedType
      const matchesStatus = selectedStatus === 'All' || internship.status === selectedStatus
      const matchesLocation = selectedLocation === 'All' || internship.location === selectedLocation
      
      return matchesSearch && matchesCategory && matchesType && matchesStatus && matchesLocation
    })
  }, [internships, searchTerm, selectedCategory, selectedType, selectedStatus, selectedLocation])

  const totalPages = Math.max(1, Math.ceil(filteredInternships.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedInternships = filteredInternships.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, selectedType, selectedStatus, selectedLocation])

  const handleAddInternship = async (newInternship: DashboardInternship) => {
    setIsActionLoading(true)
    try {
      await dispatch(createInternship(mapFormToPayload(newInternship))).unwrap()
      setShowAddModal(false)
    } catch (error) {
      console.error('Failed to create internship', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleUpdateInternship = async (internshipId: string, updatedInternship: DashboardInternship) => {
    setIsActionLoading(true)
    try {
      await dispatch(
        updateInternship({
          internshipId,
          data: mapFormToPayload(updatedInternship),
        })
      ).unwrap()
      setShowEditModal(false)
    } catch (error) {
      console.error('Failed to update internship', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDeleteInternship = async () => {
    if (!selectedInternship) return
    setIsActionLoading(true)
    try {
      await dispatch(deleteInternship(String(selectedInternship.id))).unwrap()
      setShowDeleteModal(false)
      setSelectedInternship(null)
    } catch (error) {
      console.error('Failed to delete internship', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const openViewModal = (internship: DashboardInternship) => {
    setSelectedInternship(internship)
    setShowViewModal(true)
  }

  const openEditModal = (internship: DashboardInternship) => {
    setSelectedInternship(internship)
    setShowEditModal(true)
  }

  const openDeleteModal = (internship: DashboardInternship) => {
    setSelectedInternship(internship)
    setShowDeleteModal(true)
  }

  const totalInternships = internships.length
  const totalApplicants = internships.reduce((sum, i) => sum + i.applicants, 0)
  const avgStipend =
    totalInternships > 0
      ? Math.round(internships.reduce((sum, i) => sum + i.stipend, 0) / totalInternships)
      : 0

const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'closed': return 'destructive'
      case 'paused': return 'warning'
      default: return 'secondary'
    }
  }

const getCategoryColor = (category?: string) => {
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

const formatStatusLabel = (status?: string) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Internships</h1>
            <p className="text-muted-foreground">Manage all internship opportunities posted by companies</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Internship
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Internships</p>
                  <p className="text-2xl font-bold text-foreground">{totalInternships}</p>
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
                  <p className="text-2xl font-bold text-foreground">{internships.filter(i => i.status === 'active').length}</p>
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
                  <p className="text-2xl font-bold text-foreground">{totalApplicants}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Stipend</p>
                  <p className="text-2xl font-bold text-foreground">₹{avgStipend.toLocaleString()}</p>
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
                  placeholder="Search internships, companies, or skills..."
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
                  {internshipCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'All' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {internshipTypes.map(type => (
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
                  {internshipStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === 'All' ? 'All Statuses' : formatStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Location Filter */}
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
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

        {/* Internships Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedInternships.map(internship => (
              <Card key={internship.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg line-clamp-2">{internship.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getStatusColor(internship.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {formatStatusLabel(internship.status)}
                      </Badge>
                      <Badge variant={getCategoryColor(internship.category) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {internship.category}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {internship.company}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Location:</span>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {internship.location}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Duration:</span>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {internship.duration}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Stipend:</span>
                      <span className="text-lg font-bold text-foreground">₹{internship.stipend.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <span className="text-sm font-medium">{internship.type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Applicants:</span>
                      <span className="text-sm font-medium">{internship.applicants}/{internship.maxApplicants}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Deadline:</span>
                      <span className="text-sm font-medium">{new Date(internship.applicationDeadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 mt-auto">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => openViewModal(internship)}
                          className="flex-1 gap-2"
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View internship details</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => openEditModal(internship)}
                          className="flex-1 gap-2"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit internship</p>
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
                  <TableHead>Internship</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Stipend</TableHead>
                  <TableHead>Applicants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInternships.map(internship => (
                  <TableRow key={internship.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{internship.title}</p>
                        <p className="text-sm text-muted-foreground">{internship.category}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-muted-foreground" />
                        <span>{internship.company}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span>{internship.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>{internship.type}</TableCell>
                    <TableCell>{internship.duration}</TableCell>
                    <TableCell className="font-medium">₹{internship.stipend.toLocaleString()}</TableCell>
                    <TableCell>{internship.applicants}/{internship.maxApplicants}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(internship.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {formatStatusLabel(internship.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => openViewModal(internship)}
                              variant="ghost"
                              size="icon"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View internship</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => openEditModal(internship)}
                              variant="ghost"
                              size="icon"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit internship</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => openDeleteModal(internship)}
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete internship</p>
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredInternships.length)} of {filteredInternships.length} internships
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

        {/* View Internship Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Internship Details - {selectedInternship?.title}</DialogTitle>
              <DialogDescription>
                Complete internship information and application details.
              </DialogDescription>
            </DialogHeader>
            {selectedInternship && (
              <div className="space-y-6">
                {/* Internship Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Internship Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Company:</span>
                        <span className="font-medium">{selectedInternship.company}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <Badge variant={getCategoryColor(selectedInternship.category) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                          {selectedInternship.category}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium">{selectedInternship.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{selectedInternship.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={getStatusColor(selectedInternship.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                          {formatStatusLabel(selectedInternship.status)}
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
                        <span className="font-medium">{selectedInternship.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stipend:</span>
                        <span className="font-bold text-lg">₹{selectedInternship.stipend.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Applicants:</span>
                        <span className="font-medium">{selectedInternship.applicants}/{selectedInternship.maxApplicants}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Deadline:</span>
                        <span className="font-medium">{new Date(selectedInternship.applicationDeadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Posted:</span>
                        <span className="font-medium">{new Date(selectedInternship.postedDate).toLocaleDateString()}</span>
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
                    <p className="text-muted-foreground">{selectedInternship.description}</p>
                  </CardContent>
                </Card>

                {/* Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedInternship.requirements.map((req, index) => (
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
                      {selectedInternship.responsibilities.map((resp, index) => (
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
                      {selectedInternship.benefits.map((benefit, index) => (
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
                      {selectedInternship.skills.map((skill, index) => (
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
                      <span className="text-sm">{selectedInternship.contactEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedInternship.contactPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <a href={selectedInternship.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                        {selectedInternship.website}
                        <ExternalLink className="w-3 h-3" />
                      </a>
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

        {/* Add Internship Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Internship</DialogTitle>
              <DialogDescription>
                Create a new internship posting with all required information.
              </DialogDescription>
            </DialogHeader>
            <InternshipForm
              internship={null}
              onSubmit={handleAddInternship}
              onCancel={() => setShowAddModal(false)}
              isLoading={isActionLoading}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Internship Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Internship</DialogTitle>
              <DialogDescription>
                Update internship information and details.
              </DialogDescription>
            </DialogHeader>
            {selectedInternship && (
              <InternshipForm
                internship={selectedInternship}
                onSubmit={(updatedInternship) => handleUpdateInternship(String(selectedInternship.id), updatedInternship)}
                onCancel={() => setShowEditModal(false)}
                isLoading={isActionLoading}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Internship</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the internship &quot;{selectedInternship?.title}&quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isActionLoading}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteInternship} 
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Internship'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

// Internship Form Component
const InternshipForm = ({ internship, onSubmit, onCancel, isLoading }: {
  internship: DashboardInternship | null
  onSubmit: (internshipData: DashboardInternship) => void
  onCancel: () => void
  isLoading: boolean
}) => {
  const [formData, setFormData] = useState<DashboardInternship>(internship ?? createEmptyInternship())

  const [requirementsInput, setRequirementsInput] = useState('')
  const [responsibilitiesInput, setResponsibilitiesInput] = useState('')
  const [benefitsInput, setBenefitsInput] = useState('')
  const [skillsInput, setSkillsInput] = useState('')

  useEffect(() => {
    setFormData(internship ?? createEmptyInternship())
  }, [internship])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const completeData: DashboardInternship = {
      ...formData,
      id: internship?.id || Date.now().toString(),
      applicants: internship?.applicants ?? 0,
      rating: internship?.rating ?? 0,
    }
    onSubmit(completeData)
  }

  const addRequirement = () => {
    if (requirementsInput.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, requirementsInput.trim()]
      })
      setRequirementsInput('')
    }
  }

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index)
    })
  }

  const addResponsibility = () => {
    if (responsibilitiesInput.trim()) {
      setFormData({
        ...formData,
        responsibilities: [...formData.responsibilities, responsibilitiesInput.trim()]
      })
      setResponsibilitiesInput('')
    }
  }

  const removeResponsibility = (index: number) => {
    setFormData({
      ...formData,
      responsibilities: formData.responsibilities.filter((_, i) => i !== index)
    })
  }

  const addBenefit = () => {
    if (benefitsInput.trim()) {
      setFormData({
        ...formData,
        benefits: [...formData.benefits, benefitsInput.trim()]
      })
      setBenefitsInput('')
    }
  }

  const removeBenefit = (index: number) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index)
    })
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Internship Title</Label>
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
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => setFormData({...formData, duration: e.target.value})}
            placeholder="e.g., 6 months"
            required
          />
        </div>
        <div>
          <Label htmlFor="stipend">Stipend (₹)</Label>
          <Input
            id="stipend"
            type="number"
            value={formData.stipend}
            onChange={(e) => setFormData({...formData, stipend: parseInt(e.target.value)})}
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
            onChange={(e) => setFormData({...formData, maxApplicants: parseInt(e.target.value)})}
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
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
            />
            <Button type="button" onClick={addRequirement} variant="outline">
              Add
            </Button>
          </div>
          <div className="space-y-1">
            {formData.requirements.map((req, index) => (
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
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
            />
            <Button type="button" onClick={addResponsibility} variant="outline">
              Add
            </Button>
          </div>
          <div className="space-y-1">
            {formData.responsibilities.map((resp, index) => (
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
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
            />
            <Button type="button" onClick={addBenefit} variant="outline">
              Add
            </Button>
          </div>
          <div className="space-y-1">
            {formData.benefits.map((benefit, index) => (
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
              {internship ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            internship ? 'Update Internship' : 'Create Internship'
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default InternshipsPage