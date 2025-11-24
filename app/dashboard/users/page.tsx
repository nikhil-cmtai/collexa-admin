'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { 
  Search, 
  Grid3X3, 
  List, 
  Edit, 
  Trash2, 
  UserPlus,
  User as UserIcon,
  Star,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Crown,
  Building,
  GraduationCap,
  Briefcase,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  fetchUserById,
  fetchUsersStats,
  setUserQuery,
  setUserRoleFilter,
  setUserStatusFilter,
  clearSelectedUser,
  type User,
} from '@/lib/redux/features/userSlice'

const userRoles = ["All", "admin", "student", "company", "institution"]
const userStatuses = ["All", "active", "inactive", "suspended"]

// Type for UI display (with id instead of _id)
type DashboardUser = User & {
  id: string; // UI uses 'id', backend uses '_id'
}

const mapUserToDashboard = (user: User): DashboardUser => ({
  ...user,
  id: user._id || '',
})

const UsersPage = () => {
  const dispatch = useAppDispatch()
  const {
    items: userItems,
    status: usersStatus,
    error: usersError,
    query,
    roleFilter,
    statusFilter,
    selectedUser: selectedUserFromStore,
  } = useAppSelector((state) => state.users)

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState(query)
  const [selectedRole, setSelectedRole] = useState(roleFilter || 'All')
  const [selectedStatus, setSelectedStatus] = useState(statusFilter || 'All')
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<DashboardUser | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Sync local state with Redux
  useEffect(() => {
    dispatch(setUserQuery(searchTerm))
  }, [dispatch, searchTerm])

  useEffect(() => {
    dispatch(setUserRoleFilter(selectedRole))
  }, [dispatch, selectedRole])

  useEffect(() => {
    dispatch(setUserStatusFilter(selectedStatus))
  }, [dispatch, selectedStatus])

  // Fetch users on mount and when filters change
  useEffect(() => {
    if (usersStatus === 'idle') {
      dispatch(fetchUsers(undefined))
      dispatch(fetchUsersStats())
    }
  }, [dispatch, usersStatus])

  useEffect(() => {
    dispatch(fetchUsers({
      q: query,
      role: selectedRole === 'All' ? undefined : selectedRole,
      status: selectedStatus === 'All' ? undefined : selectedStatus,
    }))
  }, [dispatch, query, selectedRole, selectedStatus])

  // Map users to dashboard format
  const users = useMemo(() => userItems.map(mapUserToDashboard), [userItems])

  // Sync selectedUser from store
  useEffect(() => {
    if (selectedUserFromStore) {
      setSelectedUser(mapUserToDashboard(selectedUserFromStore))
    }
  }, [selectedUserFromStore])

  // Filter users (additional client-side filtering if needed)
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.phone && user.phone.includes(searchTerm))
      const matchesRole = selectedRole === 'All' || user.role === selectedRole
      const matchesStatus = selectedStatus === 'All' || user.status === selectedStatus
      
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchTerm, selectedRole, selectedStatus])

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedRole, selectedStatus])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4" />
      case 'student': return <GraduationCap className="w-4 h-4" />
      case 'company': return <Briefcase className="w-4 h-4" />
      case 'institution': return <Building className="w-4 h-4" />
      default: return <UserIcon className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'outline'
      case 'student': return 'default'
      case 'company': return 'secondary'
      case 'institution': return 'outline'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'inactive': return <Clock className="w-4 h-4" />
      case 'suspended': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'warning'
      case 'suspended': return 'destructive'
      default: return 'secondary'
    }
  }


  const handleAddUser = async (userData: Omit<User, "_id" | "createdAt" | "updatedAt">) => {
    setIsActionLoading(true)
    try {
      await dispatch(createUser(userData)).unwrap()
      setShowAddModal(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Failed to create user', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleUpdateUser = async (userId: string, userData: Partial<User>) => {
    setIsActionLoading(true)
    try {
      await dispatch(updateUser({ userId, data: userData })).unwrap()
      setShowEditModal(false)
      setSelectedUser(null)
      dispatch(clearSelectedUser())
    } catch (error) {
      console.error('Failed to update user', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser || !selectedUser._id || selectedUser.role === 'admin') return
    
    setIsActionLoading(true)
    try {
      await dispatch(deleteUser(selectedUser._id)).unwrap()
      setShowDeleteModal(false)
      setSelectedUser(null)
      dispatch(clearSelectedUser())
    } catch (error) {
      console.error('Failed to delete user', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const openViewModal = async (user: DashboardUser) => {
    if (user._id) {
      await dispatch(fetchUserById(user._id))
    }
    setSelectedUser(user)
    setShowViewModal(true)
  }

  const openEditModal = (user: DashboardUser) => {
    setSelectedUser({ ...user })
    setShowEditModal(true)
  }

  const openDeleteModal = (user: DashboardUser) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const isLoading = usersStatus === 'loading' && userItems.length === 0

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
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">Manage student, company, institution, and admin accounts</p>
        </div>
          <Button onClick={() => {
            setSelectedUser(null)
            setShowAddModal(true)
          }} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Add User
          </Button>
        </div>

        {/* Error Message */}
        {usersError && (
          <Card>
            <CardContent className="p-4 text-sm text-destructive">
              {usersError}
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{users.length}</p>
                </div>
                <UserIcon className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold text-foreground">{users.filter(u => u.status === 'active').length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="text-2xl font-bold text-foreground">{users.filter(u => u.role === 'student').length}</p>
                </div>
                <GraduationCap className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Companies</p>
                  <p className="text-2xl font-bold text-foreground">{users.filter(u => u.role === 'company').length}</p>
                </div>
                <Briefcase className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Institutions</p>
                  <p className="text-2xl font-bold text-foreground">{users.filter(u => u.role === 'institution').length}</p>
                </div>
                <Building className="w-8 h-8 text-green-500" />
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
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Role Filter */}
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {userRoles.map(role => (
                    <SelectItem key={role} value={role}>
                      {role === 'All' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
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
                  {userStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === 'All' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
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

        {/* Users Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {paginatedUsers.map(user => (
              <Card key={user.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                        <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
                        <CardDescription className="text-sm">{user.email}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant={getRoleColor(user.role) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                      </Badge>
                      <Badge variant={getStatusColor(user.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {getStatusIcon(user.status)}
                        <span className="ml-1">{user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col">
                  <div className="space-y-2 flex-1">
                    {user.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Phone:</span>
                        <span className="text-sm font-medium">{user.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Verified:</span>
                      <Badge variant={user.verified ? 'success' : 'secondary'}>
                        {user.verified ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    {user.joinDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Join Date:</span>
                        <span className="text-sm font-medium">{new Date(user.joinDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {user.role === 'student' && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Courses:</span>
                        <span className="text-sm font-medium">{user.totalCourses}</span>
                      </div>
                    )}
                    {user.role === 'company' && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Rating:</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-current" />
                          <span className="text-sm font-medium">{user.rating}</span>
                        </div>
                      </div>
                    )}
                    {user.role === 'institution' && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Students:</span>
                        <span className="text-sm font-medium">{(user.students || 0).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2 mt-auto">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => openViewModal(user)}
                          className="flex-1 gap-2"
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View user profile</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => openEditModal(user)}
                          className="flex-1 gap-2"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit user details</p>
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
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                          <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleColor(user.role) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(user.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {getStatusIcon(user.status)}
                        <span className="ml-1">{user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>{user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => openViewModal(user)}
                              variant="ghost"
                              size="icon"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View user</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => openEditModal(user)}
                              variant="ghost"
                              size="icon"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit user</p>
                          </TooltipContent>
                        </Tooltip>
                        {user.role !== 'admin' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => openDeleteModal(user)}
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete user</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
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

        {/* View User Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>User Profile - {selectedUser?.firstName} {selectedUser?.lastName}</DialogTitle>
              <DialogDescription>
                Complete user information and account details.
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                {/* User Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{selectedUser.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">{selectedUser.phone}</span>
                      </div>
                      {selectedUser.dateOfBirth && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date of Birth:</span>
                          <span className="font-medium">{new Date(selectedUser.dateOfBirth).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Address:</span>
                        <span className="font-medium text-right max-w-[200px]">{selectedUser.address}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Role:</span>
                        <Badge variant={getRoleColor(selectedUser.role) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                          {getRoleIcon(selectedUser.role)}
                          <span className="ml-1">{selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}</span>
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={getStatusColor(selectedUser.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                          {getStatusIcon(selectedUser.status)}
                          <span className="ml-1">{selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}</span>
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Verified:</span>
                        <Badge variant={selectedUser.verified ? 'success' : 'secondary'}>
                          {selectedUser.verified ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      {selectedUser.joinDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Join Date:</span>
                          <span className="font-medium">{new Date(selectedUser.joinDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {selectedUser.lastLogin && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Login:</span>
                          <span className="font-medium">{new Date(selectedUser.lastLogin).toLocaleDateString()}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Bio */}
                <Card>
                  <CardHeader>
                    <CardTitle>Bio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{selectedUser.bio}</p>
                  </CardContent>
                </Card>

                {/* Role-specific Information */}
                {selectedUser.role === 'student' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Student Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">{selectedUser.totalCourses}</p>
                          <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">₹{(selectedUser.totalSpent || 0).toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Total Spent</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedUser.role === 'company' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Company Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">{selectedUser.rating}</p>
                          <p className="text-sm text-muted-foreground">Company Rating</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">Active</p>
                          <p className="text-sm text-muted-foreground">Recruitment Status</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedUser.role === 'institution' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Institution Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">{selectedUser.totalCourses}</p>
                          <p className="text-sm text-muted-foreground">Partner Courses</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">{selectedUser.students}</p>
                          <p className="text-sm text-muted-foreground">Total Students</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">{selectedUser.rating}</p>
                          <p className="text-sm text-muted-foreground">Institution Rating</p>
                        </div>
                      </div>
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

        {/* Edit User Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User - {selectedUser?.firstName} {selectedUser?.lastName}</DialogTitle>
              <DialogDescription>
                Update user information and account settings.
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <UserForm
                user={selectedUser}
                onUserChange={setSelectedUser}
                onSubmit={(userData) => {
                  if (userData._id) {
                    const { _id, ...updateData } = userData
                    handleUpdateUser(_id, updateData)
                  }
                }}
                onCancel={() => {
                  setShowEditModal(false)
                  setSelectedUser(null)
                  dispatch(clearSelectedUser())
                }}
                isLoading={isActionLoading}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Add User Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with the required information.
              </DialogDescription>
            </DialogHeader>
            <UserForm
              user={selectedUser || {
                id: '',
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                role: 'student',
                status: 'active',
                verified: false,
              } as DashboardUser}
              onUserChange={setSelectedUser}
              onSubmit={(userData) => {
                const {...createData } = userData
                handleAddUser(createData)
              }}
              onCancel={() => {
                setShowAddModal(false)
                setSelectedUser(null)
              }}
              isLoading={isActionLoading}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}? This action cannot be undone.
                {selectedUser?.role === 'admin' && (
                  <span className="block mt-2 text-destructive font-medium">
                    Admin users cannot be deleted.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isActionLoading}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteUser} 
                disabled={isActionLoading || selectedUser?.role === 'admin'}
              >
                {isActionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete User'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

// User Form Component
const UserForm = ({
  user,
  onUserChange,
  onSubmit,
  onCancel,
  isLoading
}: {
  user: DashboardUser
  onUserChange: (user: DashboardUser) => void
  onSubmit: (user: DashboardUser) => void
  onCancel: () => void
  isLoading: boolean
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(user)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="formFirstName">First Name</Label>
          <Input
            id="formFirstName"
            value={user.firstName}
            onChange={(e) => onUserChange({...user, firstName: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="formLastName">Last Name</Label>
          <Input
            id="formLastName"
            value={user.lastName}
            onChange={(e) => onUserChange({...user, lastName: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="formEmail">Email</Label>
          <Input
            id="formEmail"
            type="email"
            value={user.email}
            onChange={(e) => onUserChange({...user, email: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="formPhone">Phone</Label>
          <Input
            id="formPhone"
            value={user.phone || ''}
            onChange={(e) => onUserChange({...user, phone: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="formRole">Role</Label>
          <Select 
            value={user.role} 
            onValueChange={(value) => onUserChange({...user, role: value as User['role']})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="company">Company</SelectItem>
              <SelectItem value="institution">Institution</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="formStatus">Status</Label>
          <Select 
            value={user.status} 
            onValueChange={(value) => onUserChange({...user, status: value as User['status']})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="formDateOfBirth">Date of Birth</Label>
          <Input
            id="formDateOfBirth"
            type="date"
            value={user.dateOfBirth || ''}
            onChange={(e) => onUserChange({...user, dateOfBirth: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="formVerified">Verified</Label>
          <Select 
            value={user.verified ? 'true' : 'false'} 
            onValueChange={(value) => onUserChange({...user, verified: value === 'true'})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select verification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Verified</SelectItem>
              <SelectItem value="false">Not Verified</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="formAvatar">Avatar URL</Label>
          <Input
            id="formAvatar"
            type="url"
            value={user.avatar || ''}
            onChange={(e) => onUserChange({...user, avatar: e.target.value})}
            placeholder="https://example.com/avatar.jpg"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="formAddress">Address</Label>
        <Textarea
          id="formAddress"
          value={user.address || ''}
          onChange={(e) => onUserChange({...user, address: e.target.value})}
          rows={3}
          placeholder="Enter address"
        />
      </div>
      <div>
        <Label htmlFor="formBio">Bio</Label>
        <Textarea
          id="formBio"
          value={user.bio || ''}
          onChange={(e) => onUserChange({...user, bio: e.target.value})}
          rows={3}
          placeholder="Enter bio"
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {user._id ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            user._id ? 'Update User' : 'Create User'
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default UsersPage