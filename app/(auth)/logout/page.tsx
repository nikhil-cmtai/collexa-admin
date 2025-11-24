"use client";

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { removeUserCookie } from '@/lib/auth'
import { Loader2, CheckCircle, LogOut, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const LogoutPage = () => {
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)
  const [isLoggingOut, setIsLoggingOut] = useState(true)

  useEffect(() => {
    // Clear user cookie immediately
    removeUserCookie()
    
    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsLoggingOut(false)
          clearInterval(timer)
          // Redirect to login after countdown
          setTimeout(() => {
            router.push('/login')
          }, 1000)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleManualRedirect = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="mb-8">
                  {isLoggingOut ? (
                    <div className="mx-auto w-20 h-20 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mb-6">
                      <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                  ) : (
                    <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-foreground mb-3">
                  {isLoggingOut ? 'Logging Out...' : 'Logged Out Successfully'}
                </h1>
                
                <p className="text-muted-foreground mb-8 text-lg">
                  {isLoggingOut 
                    ? 'Please wait while we securely log you out' 
                    : 'You have been successfully logged out of your account'
                  }
                </p>

                {isLoggingOut && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                      <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        Redirecting to login in <span className="font-semibold text-foreground">{countdown}</span> second{countdown !== 1 ? 's' : ''}...
                      </p>
                    </div>
                  </div>
                )}

                {!isLoggingOut && (
                  <div className="space-y-6">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Your session has been securely terminated. You can now safely close this browser tab.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <Button 
                        onClick={handleManualRedirect}
                        className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Go to Login Page
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => router.push('/')}
                        className="w-full h-12 border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                      >
                        <LogOut className="w-5 h-5 mr-2" />
                        Back to Home
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Thank you for using{" "}
              <span className="font-semibold text-foreground">Collexa</span>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default LogoutPage