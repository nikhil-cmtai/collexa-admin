"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Eye, EyeOff, Lock, User, Loader2, CheckCircle, Phone } from "lucide-react";
import { useAppDispatch } from "@/lib/redux/store";
import { registerUser } from "@/lib/redux/features/authSlice";

const SignupPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setIsLoading(true);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: "admin",
      };

      await dispatch(registerUser(payload)).unwrap();
      
      router.push(`/verify-otp?email=${formData.email}`);
    } catch (err: any) {
      setError(err || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Create Admin Account</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label htmlFor="firstName">First Name</Label><Input id="firstName" value={formData.firstName} onChange={e => handleInputChange('firstName', e.target.value)} required disabled={isLoading} /></div>
                        <div><Label htmlFor="lastName">Last Name</Label><Input id="lastName" value={formData.lastName} onChange={e => handleInputChange('lastName', e.target.value)} required disabled={isLoading} /></div>
                    </div>

                    <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} required disabled={isLoading} /></div>
                    <div><Label htmlFor="phone">Phone</Label><Input id="phone" type="tel" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} required disabled={isLoading} /></div>
                    
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <div className="relative"><Input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={e => handleInputChange('password', e.target.value)} required disabled={isLoading} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
                    </div>
                    
                    <div><Label htmlFor="confirmPassword">Confirm Password</Label><Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={e => handleInputChange('confirmPassword', e.target.value)} required disabled={isLoading} /></div>

                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating Account...</> : <><CheckCircle className="w-4 h-4 mr-2" /> Create Account</>}
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
  );
};

export default SignupPage;