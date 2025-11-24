"use client"

import Link from 'next/link'
import React from 'react'
import { motion } from 'framer-motion'
import { Home, Search, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/3 rounded-full blur-3xl"></div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 text-center">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="mb-6"
        >
          <h1 className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary">
            404
          </h1>
        </motion.div>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4 mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-heading">
            Oops! Page Not Found
          </h2>
          <p className="text-base text-muted max-w-xl mx-auto">
            The page you&apos;re looking for seems to have wandered off into the digital void. 
            Don&apos;t worry, let&apos;s get you back on track!
          </p>
        </motion.div>

        {/* Floating illustration */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <motion.div
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center"
            >
              <Compass className="w-24 h-24 md:w-28 md:h-28 text-primary/30" />
            </motion.div>
            {/* Floating particles */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-primary/20 rounded-full"
                style={{
                  top: `${20 + i * 20}%`,
                  left: `${10 + i * 15}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 2 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link href="/" className="flex items-center gap-2 !text-white">
              <Home className="w-5 h-5" />
              Go to Homepage
            </Link>
          </Button>
          
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Link href="/learn-skills" className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Explore Courses
            </Link>
          </Button>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 pt-6 border-t border-border"
        >
          <p className="text-xs text-muted mb-3">Popular Pages:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/campus-courses"
              className="text-sm text-primary hover:text-secondary transition-colors"
            >
              Campus Courses
            </Link>
            <span className="text-muted">•</span>
            <Link
              href="/jobs"
              className="text-sm text-primary hover:text-secondary transition-colors"
            >
              Jobs
            </Link>
            <span className="text-muted">•</span>
            <Link
              href="/internship"
              className="text-sm text-primary hover:text-secondary transition-colors"
            >
              Internships
            </Link>
            <span className="text-muted">•</span>
            <Link
              href="/contact"
              className="text-sm text-primary hover:text-secondary transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default NotFound
