"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Loader2,
  Edit,
  Trash2,
  Package as PackageIcon,
  CheckCircle,
  XCircle,
  Briefcase,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { 
  fetchPackages, 
  fetchPackageStats, 
  createPackage, 
  updatePackage, 
  deletePackage, 
  Package 
} from "@/lib/redux/features/packagesSlice";

// Define the shape of data used in the form
type PackageFormData = {
  name: string;
  description: string;
  jobLimit: number;
  internshipLimit: number;
  isActive: boolean;
};

const PackagesPage = () => {
  const dispatch = useAppDispatch();
  const { items: packages, stats, status } = useAppSelector((state) => state.packages);

  const [searchTerm, setSearchTerm] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    dispatch(fetchPackages({}));
    dispatch(fetchPackageStats());
  }, [dispatch]);

  const filteredPackages = packages.filter(pkg => 
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (data: PackageFormData) => {
    setIsProcessing(true);
    await dispatch(createPackage(data));
    setIsProcessing(false);
    setShowFormModal(false);
  };

  const handleUpdate = async (id: string, data: PackageFormData) => {
    setIsProcessing(true);
    await dispatch(updatePackage({ id, data }));
    setIsProcessing(false);
    setShowFormModal(false);
  };

  const handleDelete = async () => {
    if (selectedPackage) {
      setIsProcessing(true);
      await dispatch(deletePackage(selectedPackage._id));
      setIsProcessing(false);
      setShowDeleteModal(false);
    }
  };

  const openForm = (pkg?: Package) => {
    setSelectedPackage(pkg || null);
    setShowFormModal(true);
  };

  const openDelete = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowDeleteModal(true);
  };

  if (status === "loading") {
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Packages & Plans</h1>
          <p className="text-muted-foreground">Manage subscription plans for employers.</p>
        </div>
        <Button onClick={() => openForm()} className="gap-2">
          <Plus className="w-4 h-4" /> Create Package
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Total Packages</p><p className="text-2xl font-bold">{stats.totalPackages}</p></div>
            <PackageIcon className="w-8 h-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Active Plans</p><p className="text-2xl font-bold">{stats.activePackages}</p></div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Inactive Plans</p><p className="text-2xl font-bold">{stats.totalPackages - stats.activePackages}</p></div>
            <XCircle className="w-8 h-8 text-red-500" />
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search packages..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="pl-10 max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => (
          <Card key={pkg._id} className={`relative overflow-hidden transition-all hover:shadow-lg ${!pkg.isActive ? 'opacity-75' : ''}`}>
            <div className={`absolute top-0 left-0 w-1 h-full ${pkg.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <CardDescription>{pkg.packageNumber}</CardDescription>
                </div>
                <Badge variant={pkg.isActive ? "default" : "secondary"}>{pkg.isActive ? "Active" : "Inactive"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2 h-10">{pkg.description}</p>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-2 text-sm bg-accent/50 p-2 rounded-lg">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{pkg.jobLimit} Jobs</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm bg-accent/50 p-2 rounded-lg">
                        <GraduationCap className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">{pkg.internshipLimit} Internships</span>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                    <Button variant="outline" className="flex-1" onClick={() => openForm(pkg)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button variant="ghost" className="text-destructive hover:bg-destructive/10" size="icon" onClick={() => openDelete(pkg)}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedPackage ? "Edit Package" : "Create New Package"}</DialogTitle>
            <DialogDescription>Set limits and pricing for employer subscriptions.</DialogDescription>
          </DialogHeader>
          <PackageForm 
            initialData={selectedPackage} 
            onSubmit={selectedPackage ? (data) => handleUpdate(selectedPackage._id, data) : handleCreate} 
            onCancel={() => setShowFormModal(false)}
            isLoading={isProcessing}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Delete Package</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete <strong>{selectedPackage?.name}</strong>? This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface PackageFormProps {
  initialData: Package | null;
  onSubmit: (data: PackageFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const PackageForm = ({ initialData, onSubmit, onCancel, isLoading }: PackageFormProps) => {
    const [formData, setFormData] = useState<PackageFormData>({
        name: initialData?.name || "",
        description: initialData?.description || "",
        jobLimit: initialData?.jobLimit || 0,
        internshipLimit: initialData?.internshipLimit || 0,
        isActive: initialData?.isActive ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Package Name</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Gold Plan" /></div>
            <div className="grid grid-cols-2 gap-4">
                <div><Label>Job Posting Limit</Label><Input type="number" value={formData.jobLimit} onChange={(e) => setFormData({...formData, jobLimit: Number(e.target.value)})} required /></div>
                <div><Label>Internship Limit</Label><Input type="number" value={formData.internshipLimit} onChange={(e) => setFormData({...formData, internshipLimit: Number(e.target.value)})} required /></div>
            </div>
            <div><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required placeholder="Brief details about the package" /></div>
            <div className="flex items-center gap-2">
                <Switch checked={formData.isActive} onCheckedChange={(checked) => setFormData({...formData, isActive: checked})} />
                <Label>Active Status</Label>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Package"}</Button>
            </DialogFooter>
        </form>
    );
};

export default PackagesPage;