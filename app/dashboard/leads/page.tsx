'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { 
  Search, 
  Grid3X3, 
  List, 
  Edit, 
  Trash2, 
  Users,
  Phone,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserPlus,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
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
  fetchLeads,
  updateLead,
  deleteLead,
  type Lead,
} from '@/lib/redux/features/leadSlice'

type DashboardLead = Lead & {
  id: string
  assignedTo?: string
}

const generateId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const mapLeadToDashboard = (lead: Lead & { id?: string; assignedTo?: string }): DashboardLead => ({
  ...lead,
  id: lead._id || lead.id || generateId(),
  source: lead.source || 'Website',
  status: lead.status || 'new',
  priority: lead.priority || 'medium',
  estimatedValue: lead.estimatedValue ?? 0,
  notes: lead.notes || '',
  assignedTo: lead.assignedTo || 'Unassigned',
  lastContact: lead.lastContact || new Date().toISOString(),
  createdAt: lead.createdAt || new Date().toISOString(),
})

const leadStatuses = ["All", "new", "contacted", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"]
const leadSources = ["All", "Website", "Referral", "Social Media", "Cold Call", "Trade Show", "Email Campaign"]
const leadPriorities = ["All", "low", "medium", "high"]

const LeadsPage = () => {
  const dispatch = useAppDispatch()
  const { items: leadItems, status: leadsStatus, error: leadsError } = useAppSelector((state) => state.leads)
  const leads = useMemo(() => leadItems.map(mapLeadToDashboard), [leadItems])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedSource, setSelectedSource] = useState('All')
  const [selectedPriority, setSelectedPriority] = useState('All')
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<DashboardLead | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    if (leadsStatus === 'idle') {
      dispatch(fetchLeads(undefined))
    }
  }, [dispatch, leadsStatus])

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.company.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === 'All' || lead.status === selectedStatus
      const matchesSource = selectedSource === 'All' || lead.source === selectedSource
      const matchesPriority = selectedPriority === 'All' || lead.priority === selectedPriority
      
      return matchesSearch && matchesStatus && matchesSource && matchesPriority
    })
  }, [leads, searchTerm, selectedStatus, selectedSource, selectedPriority])

  // Pagination logic
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex)

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedStatus, selectedSource, selectedPriority])

  const handleUpdateLeadStatus = async (leadId: string, newStatus: string, updates?: Partial<DashboardLead>) => {
    setIsActionLoading(true)
    try {
      await dispatch(
        updateLead({
          leadId,
          data: {
            status: newStatus,
            priority: updates?.priority ?? selectedLead?.priority,
            notes: updates?.notes ?? selectedLead?.notes,
            lastContact: new Date().toISOString().split('T')[0],
          },
        })
      ).unwrap()
      setShowEditModal(false)
      setSelectedLead(null)
    } catch (error) {
      console.error('Failed to update lead', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDeleteLead = async () => {
    if (!selectedLead) return
    setIsActionLoading(true)
    try {
      await dispatch(deleteLead(selectedLead.id)).unwrap()
      setShowDeleteModal(false)
      setSelectedLead(null)
    } catch (error) {
      console.error('Failed to delete lead', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const openViewModal = (lead: DashboardLead) => {
    setSelectedLead(lead)
    setShowViewModal(true)
  }

  const openEditModal = (lead: DashboardLead) => {
    setSelectedLead(lead)
    setShowEditModal(true)
  }

  const openDeleteModal = (lead: DashboardLead) => {
    setSelectedLead(lead)
    setShowDeleteModal(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <UserPlus className="w-4 h-4" />
      case 'contacted': return <Phone className="w-4 h-4" />
      case 'qualified': return <CheckCircle className="w-4 h-4" />
      case 'proposal': return <FileText className="w-4 h-4" />
      case 'negotiation': return <TrendingUp className="w-4 h-4" />
      case 'closed-won': return <CheckCircle className="w-4 h-4" />
      case 'closed-lost': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'secondary'
      case 'contacted': return 'default'
      case 'qualified': return 'success'
      case 'proposal': return 'warning'
      case 'negotiation': return 'default'
      case 'closed-won': return 'success'
      case 'closed-lost': return 'default'
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

  const formatStatusLabel = (status?: string) =>
    status ? status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ') : 'Unknown'

  const formatPriorityLabel = (priority?: string) =>
    priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'N/A'

  const totalPipelineValue = leads.reduce((sum, lead) => sum + (lead.estimatedValue ?? 0), 0)
  const totalNewLeads = leads.filter((l) => l.status === 'new').length
  const totalQualifiedLeads = leads.filter((l) => l.status === 'qualified').length

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leads</h1>
            <p className="text-muted-foreground">Manage sales leads and customer prospects</p>
          </div>
        </div>

        {leadsError && (
          <Card>
            <CardContent className="p-4 text-sm text-destructive">
              {leadsError}
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Leads</p>
                  <p className="text-2xl font-bold text-foreground">{leads.length}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New Leads</p>
                  <p className="text-2xl font-bold text-foreground">{totalNewLeads}</p>
                </div>
                <UserPlus className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Qualified Leads</p>
                  <p className="text-2xl font-bold text-foreground">{totalQualifiedLeads}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pipeline Value</p>
                  <p className="text-2xl font-bold text-foreground">₹{totalPipelineValue.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
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
                  placeholder="Search leads..."
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
                  {leadStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === 'All' ? 'All Statuses' : formatStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Source Filter */}
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {leadSources.map(source => (
                    <SelectItem key={source} value={source}>
                      {source === 'All' ? 'All Sources' : source}
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
                  {leadPriorities.map(priority => (
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

        {/* Leads Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedLeads.map(lead => (
              <Card key={lead.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{lead.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getStatusColor(lead.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {getStatusIcon(lead.status)}
                        <span className="ml-1">{formatStatusLabel(lead.status)}</span>
                      </Badge>
                      <Badge variant={getPriorityColor(lead.priority) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {formatPriorityLabel(lead.priority)}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{lead.company} • {lead.position}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Source:</span>
                      <span className="text-sm font-medium">{lead.source}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Estimated Value:</span>
                      <span className="text-lg font-bold text-foreground">₹{lead.estimatedValue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Contact:</span>
                      <span className="text-sm font-medium">{new Date(lead.lastContact).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Assigned To:</span>
                      <span className="text-sm font-medium">{lead.assignedTo}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 mt-auto">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => openViewModal(lead)}
                          className="flex-1 gap-2"
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View lead details</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => openEditModal(lead)}
                          className="flex-1 gap-2"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit lead status</p>
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
                  <TableHead>Lead</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLeads.map(lead => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">{lead.email}</p>
                        <p className="text-sm text-muted-foreground">{lead.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{lead.company}</p>
                        <p className="text-sm text-muted-foreground">{lead.position}</p>
                      </div>
                    </TableCell>
                    <TableCell>{lead.source}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(lead.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {getStatusIcon(lead.status)}
                        <span className="ml-1">{formatStatusLabel(lead.status)}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(lead.priority) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {formatPriorityLabel(lead.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">₹{lead.estimatedValue.toLocaleString()}</TableCell>
                    <TableCell>{new Date(lead.lastContact).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => openViewModal(lead)}
                              variant="ghost"
                              size="icon"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View lead</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => openEditModal(lead)}
                              variant="ghost"
                              size="icon"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit lead</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => openDeleteModal(lead)}
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete lead</p>
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredLeads.length)} of {filteredLeads.length} leads
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

        {/* View Lead Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Lead Details - {selectedLead?.name}</DialogTitle>
              <DialogDescription>
                Complete lead information and contact details.
              </DialogDescription>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-6">
                {/* Lead Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{selectedLead.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{selectedLead.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">{selectedLead.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Company:</span>
                        <span className="font-medium">{selectedLead.company}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Position:</span>
                        <span className="font-medium">{selectedLead.position}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Lead Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={getStatusColor(selectedLead.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                          {getStatusIcon(selectedLead.status)}
                          <span className="ml-1">{formatStatusLabel(selectedLead.status)}</span>
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Priority:</span>
                        <Badge variant={getPriorityColor(selectedLead.priority) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                          {formatPriorityLabel(selectedLead.priority)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Source:</span>
                        <span className="font-medium">{selectedLead.source}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated Value:</span>
                        <span className="font-bold text-lg">₹{selectedLead.estimatedValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Assigned To:</span>
                        <span className="font-medium">{selectedLead.assignedTo}</span>
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
                        <span className="text-muted-foreground">Created:</span>
                        <span className="font-medium">{new Date(selectedLead.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Contact:</span>
                        <span className="font-medium">{new Date(selectedLead.lastContact).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                {selectedLead.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{selectedLead.notes}</p>
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

        {/* Edit Lead Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Lead Status</DialogTitle>
              <DialogDescription>
                Change the status of lead {selectedLead?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="lead-status" className="mb-2 block">Lead Status</Label>
                  <Select 
                    value={selectedLead.status} 
                    onValueChange={(value) => setSelectedLead((prev) => prev ? { ...prev, status: value } : prev)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {leadStatuses.slice(1).map(status => (
                        <SelectItem key={status} value={status}>
                          {formatStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lead-priority" className="mb-2 block">Priority</Label>
                  <Select 
                    value={selectedLead.priority} 
                    onValueChange={(value) => setSelectedLead((prev) => prev ? { ...prev, priority: value } : prev)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {leadPriorities.slice(1).map(priority => (
                        <SelectItem key={priority} value={priority}>
                          {formatPriorityLabel(priority)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lead-notes" className="mb-2 block">Notes</Label>
                  <Textarea
                    id="lead-notes"
                    placeholder="Add lead notes"
                    value={selectedLead.notes || ''}
                    onChange={(e) => setSelectedLead((prev) => prev ? { ...prev, notes: e.target.value } : prev)}
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)} disabled={isActionLoading}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (selectedLead) {
                    handleUpdateLeadStatus(selectedLead.id, selectedLead.status, selectedLead)
                  }
                }} 
                disabled={isActionLoading || !selectedLead}
              >
                {isActionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Lead'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Lead</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete lead {selectedLead?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isActionLoading}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteLead} 
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Lead'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

export default LeadsPage
