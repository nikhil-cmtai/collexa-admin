"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppDispatch } from '@/lib/redux/store';
import { logoutUser } from '@/lib/redux/features/authSlice';

const LogoutPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [countdown, setCountdown] = useState(3);
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  useEffect(() => {
    const performLogout = async () => {
      try {
        await dispatch(logoutUser()).unwrap();
      } catch (error) {
        console.error("Logout failed, but proceeding with client-side cleanup.", error);
      }
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setIsLoggingOut(false);
            clearInterval(timer);
            router.push('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    };

    performLogout();
  }, [dispatch, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-gray-100 mb-4">
            {isLoggingOut ? (
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            ) : (
              <CheckCircle className="w-8 h-8 text-green-500" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {isLoggingOut ? 'Logging Out...' : 'Logged Out Successfully'}
          </CardTitle>
          <CardDescription>
            {isLoggingOut ? `Redirecting in ${countdown}...` : 'You can now safely close this window.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isLoggingOut && (
            <Button onClick={() => router.push('/login')} className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Return to Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LogoutPage;