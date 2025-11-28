'use client'

import React, { useEffect, useState, FC, FormEvent } from 'react';
import { Search, Grid3X3, List, Edit, Trash2, Plus, Loader2, Eye, MapPin, DollarSign, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { RootState, useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { fetchJobs, createJob, updateJob, deleteJob, fetchJobsStats, fetchJobById, clearSelectedJob } from '@/lib/redux/features/jobsSlice';
import type { Job, JobCreatePayload, JobUpdatePayload } from '@/lib/redux/features/jobsSlice';

const jobCategories = ["All", "Technology", "Marketing", "Data Science", "Design", "Business", "Content", "Cybersecurity", "Finance"];
const jobTypes = ["All", "Full-time", "Part-time", "Remote", "Hybrid"] as const;
const jobStatuses = ["All", "active", "closed", "paused"] as const;
const locations = ["All", "Bangalore", "Mumbai", "Pune", "Delhi", "Hyderabad", "Chennai", "Remote"];

const JobsPage: FC = () => {
  const dispatch = useAppDispatch();
  const { items: jobs, status, stats, selectedJob } = useAppSelector((s: RootState) => s.jobs);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({ search: '', category: 'All', type: 'All', status: 'All', location: 'All' });
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const itemsPerPage = 12;

  useEffect(() => {
    dispatch(fetchJobsStats());
  }, [dispatch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(fetchJobs({
        q: filters.search || undefined,
        location: filters.location === 'All' ? undefined : filters.location,
        type: filters.type === 'All' ? undefined : filters.type,
        category: filters.category === 'All' ? undefined : filters.category,
        status: filters.status === 'All' ? undefined : filters.status,
      }));
    }, 500);
    return () => clearTimeout(handler);
  }, [filters, dispatch]);
  
  const totalPages = Math.ceil(jobs.length / itemsPerPage) || 1;
  const paginatedJobs = jobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenAddModal = () => {
    setActiveJob(null);
    setShowAddEditModal(true);
  };
  
  const handleOpenEditModal = (job: Job) => {
    dispatch(fetchJobById(job._id)); 
    setActiveJob(job);
    setShowAddEditModal(true);
  };
  
  const handleOpenViewModal = (job: Job) => {
    dispatch(fetchJobById(job._id));
    setActiveJob(job);
    setShowViewModal(true);
  };
  
  const handleOpenDeleteModal = (job: Job) => {
    setActiveJob(job);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowViewModal(false);
    setShowAddEditModal(false);
    setShowDeleteModal(false);
    setActiveJob(null);
    dispatch(clearSelectedJob());
  };
  
  const handleFormSubmit = async (formData: JobCreatePayload | JobUpdatePayload) => {
    setIsActionLoading(true);
    try {
      if (activeJob?._id) {
        await dispatch(updateJob({ jobId: activeJob._id, data: formData as JobUpdatePayload })).unwrap();
      } else {
        await dispatch(createJob(formData as JobCreatePayload)).unwrap();
      }
      closeModal();
    } catch (err) {
      console.error('Failed to save job', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!activeJob) return;
    setIsActionLoading(true);
    try {
      await dispatch(deleteJob(activeJob._id)).unwrap();
      closeModal();
    } catch (err) {
      console.error('Failed to delete job', err);
    } finally {
      setIsActionLoading(false);
    }
  };
  
  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div><h1 className="text-3xl font-bold">Jobs</h1><p className="text-muted-foreground">Manage job opportunities.</p></div>
          <Button onClick={handleOpenAddModal}><Plus size={16} className="mr-2" />Add Job</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card><CardContent className="p-6"><div><p className="text-sm text-muted-foreground">Total Jobs</p><p className="text-2xl font-bold">{stats?.totalJobs as number ?? '...'}</p></div></CardContent></Card>
          <Card><CardContent className="p-6"><div><p className="text-sm text-muted-foreground">Active Posts</p><p className="text-2xl font-bold">{stats?.activePosts as number ?? '...'}</p></div></CardContent></Card>
          <Card><CardContent className="p-6"><div><p className="text-sm text-muted-foreground">Total Applicants</p><p className="text-2xl font-bold">{stats?.totalApplicants as number ?? '...'}</p></div></CardContent></Card>
          <Card><CardContent className="p-6"><div><p className="text-sm text-muted-foreground">Avg. Salary</p><p className="text-2xl font-bold">{stats?.averageSalary ? `₹${(stats.averageSalary as number).toLocaleString()}` : '...'}</p></div></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4 flex flex-wrap gap-4 items-center">
            <div className="relative flex-grow min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search jobs..." value={filters.search} onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))} className="pl-10" /></div>
            <Select value={filters.category} onValueChange={(v) => setFilters(prev => ({ ...prev, category: v }))}><SelectTrigger className="w-full sm:w-auto"><SelectValue /></SelectTrigger><SelectContent>{jobCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
            <div className="flex border rounded-md"><Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}><Grid3X3 size={16} /></Button><Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}><List size={16} /></Button></div>
          </CardContent>
        </Card>

        {status === 'loading' && jobs.length === 0 ? <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div> :
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedJobs.map(job => <JobCard key={job._id} job={job} onView={handleOpenViewModal} onEdit={handleOpenEditModal} />)}
          </div>
        ) : (
          <Card><Table>
            <TableHeader><TableRow><TableHead>Job</TableHead><TableHead>Company</TableHead><TableHead>Salary</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>{paginatedJobs.map(job => <JobRow key={job._id} job={job} onView={handleOpenViewModal} onEdit={handleOpenEditModal} onDelete={handleOpenDeleteModal} />)}</TableBody>
          </Table></Card>
        )}
        
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}

        <JobViewModal job={selectedJob} isOpen={showViewModal} onClose={closeModal} />
        <JobFormModal key={activeJob?._id || 'new'} job={activeJob} isOpen={showAddEditModal} onClose={closeModal} onSubmit={handleFormSubmit} isLoading={isActionLoading} />
        <DeleteConfirmationModal item={activeJob} isOpen={showDeleteModal} onClose={closeModal} onConfirm={handleDelete} isLoading={isActionLoading} />
      </div>
    </TooltipProvider>
  )
}

const JobCard: FC<{job: Job, onView: (j: Job) => void, onEdit: (j: Job) => void}> = ({ job, onView, onEdit }) => (
  <Card className="flex flex-col">
    <CardHeader><CardTitle className="line-clamp-2 text-base">{job.title}</CardTitle><CardDescription>{job.company}</CardDescription></CardHeader>
    <CardContent className="flex-grow flex flex-col justify-between space-y-2 text-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-1"><MapPin size={14} />{job.location}</div>
        <div className="flex items-center gap-1"><DollarSign size={14} />{job.salary ? `₹${job.salary.toLocaleString()}` : 'N/A'}</div>
        <div className="flex items-center gap-1"><Briefcase size={14} />{job.type}</div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button onClick={() => onView(job)} size="sm" variant="outline" className="flex-1">View</Button>
        <Button onClick={() => onEdit(job)} size="sm" className="flex-1">Edit</Button>
      </div>
    </CardContent>
  </Card>
);

const JobRow: FC<{job: Job, onView: (j: Job) => void, onEdit: (j: Job) => void, onDelete: (j: Job) => void}> = ({ job, onView, onEdit, onDelete }) => (
  <TableRow>
    <TableCell><div className="font-medium">{job.title}</div></TableCell>
    <TableCell>{job.company}</TableCell>
    <TableCell>{job.salary ? `₹${job.salary.toLocaleString()}` : 'N/A'}</TableCell>
    <TableCell><Badge variant={job.status === 'active' ? 'default' : 'secondary'}>{job.status}</Badge></TableCell>
    <TableCell>
      <div className="flex gap-1">
        <Button onClick={() => onView(job)} variant="ghost" size="icon"><Eye size={16}/></Button>
        <Button onClick={() => onEdit(job)} variant="ghost" size="icon"><Edit size={16}/></Button>
        <Button onClick={() => onDelete(job)} variant="ghost" size="icon" className="text-destructive"><Trash2 size={16}/></Button>
      </div>
    </TableCell>
  </TableRow>
);

const Pagination: FC<{currentPage: number, totalPages: number, onPageChange: (p: number) => void}> = ({ currentPage, totalPages, onPageChange }) => (
  <Card><CardContent className="p-4 flex items-center justify-between">
    <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
      <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
    </div>
  </CardContent></Card>
);

const JobViewModal: FC<{job: Job | null, isOpen: boolean, onClose: () => void}> = ({ job, isOpen, onClose }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>{job?.title}</DialogTitle>
                <DialogDescription>{job?.company} - {job?.location}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 text-sm max-h-[60vh] overflow-y-auto">
                <p><strong>Description:</strong> {job?.description}</p>
                <p><strong>Experience:</strong> {job?.experience}</p>
                <p><strong>Skills:</strong> {(job?.skills || []).join(', ')}</p>
                <p><strong>Responsibilities:</strong> {(job?.responsibilities || []).join(', ')}</p>
            </div>
            <DialogFooter><Button onClick={onClose}>Close</Button></DialogFooter>
        </DialogContent>
    </Dialog>
);

const JobFormModal: FC<{job: Job | null, isOpen: boolean, onClose: () => void, onSubmit: (d: any) => void, isLoading: boolean}> = ({ job, isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<Partial<JobCreatePayload>>({});
  
  useEffect(() => {
    if (isOpen) {
        setFormData(job ? {
            ...job,
            applicationDeadline: job.applicationDeadline?.split('T')[0]
        } : { status: 'active', type: 'Full-time' });
    }
  }, [job, isOpen]);

  const handleChange = (field: keyof JobCreatePayload, value: string | number | string[]) => {
    setFormData(prev => ({...prev, [field]: value}));
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{job ? 'Edit' : 'Add'} Job</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><Label>Title</Label><Input value={formData.title || ''} onChange={(e) => handleChange('title', e.target.value)} required /></div>
              <div><Label>Company</Label><Input value={formData.company || ''} onChange={(e) => handleChange('company', e.target.value)} required /></div>
              <div><Label>Location</Label><Input value={formData.location || ''} onChange={(e) => handleChange('location', e.target.value)} required /></div>
              <div><Label>Salary</Label><Input type="number" value={formData.salary || ''} onChange={(e) => handleChange('salary', Number(e.target.value))} required /></div>
              <div><Label>Type</Label><Select value={formData.type} onValueChange={(v) => handleChange('type', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{jobTypes.slice(1).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Category</Label><Select value={formData.category} onValueChange={(v) => handleChange('category', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{jobCategories.slice(1).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Experience</Label><Input value={formData.experience || ''} onChange={(e) => handleChange('experience', e.target.value)} required /></div>
              <div><Label>Max Applicants</Label><Input type="number" value={formData.maxApplicants || ''} onChange={(e) => handleChange('maxApplicants', Number(e.target.value))} required /></div>
              <div><Label>Deadline</Label><Input type="date" value={formData.applicationDeadline || ''} onChange={(e) => handleChange('applicationDeadline', e.target.value)} required /></div>
              <div><Label>Contact Email</Label><Input type="email" value={formData.contactEmail || ''} onChange={(e) => handleChange('contactEmail', e.target.value)} required /></div>
              <div><Label>Contact Phone</Label><Input value={formData.contactPhone || ''} onChange={(e) => handleChange('contactPhone', e.target.value)} required /></div>
              <div><Label>Website</Label><Input type="url" value={formData.website || ''} onChange={(e) => handleChange('website', e.target.value)} /></div>
          </div>
          <div className="space-y-4">
            <div><Label>Description</Label><Textarea value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} required/></div>
            <div><Label>Skills (comma-separated)</Label><Input value={(formData.skills || []).join(', ')} onChange={(e) => handleChange('skills', e.target.value.split(',').map(s => s.trim()))} /></div>
            <div><Label>Requirements (comma-separated)</Label><Textarea value={(formData.requirements || []).join(', ')} onChange={(e) => handleChange('requirements', e.target.value.split(',').map(s => s.trim()))} /></div>
            <div><Label>Responsibilities (comma-separated)</Label><Textarea value={(formData.responsibilities || []).join(', ')} onChange={(e) => handleChange('responsibilities', e.target.value.split(',').map(s => s.trim()))} /></div>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
};

const DeleteConfirmationModal: FC<{item: { _id: string, title: string } | null, isOpen: boolean, onClose: () => void, onConfirm: () => void, isLoading: boolean}> = ({ item, isOpen, onClose, onConfirm, isLoading }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Confirm Deletion</DialogTitle><DialogDescription>Are you sure you want to delete &quot;{item?.title}&quot;?</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant="destructive" onClick={onConfirm} disabled={isLoading}>{isLoading ? 'Deleting...' : 'Delete'}</Button></DialogFooter></DialogContent>
    </Dialog>
);

export default JobsPage;