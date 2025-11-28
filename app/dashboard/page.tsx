'use client'

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Users, GraduationCap, TrendingUp, BookOpen, DollarSign, Activity, Award, BarChart3, Clock, ArrowUpRight, ArrowDownRight, Plus, Bell, MessageSquare, FileText, Building, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { fetchDashboardData } from '@/lib/redux/features/dashboardSlice';
import { formatDistanceToNow } from 'date-fns';

const DashboardPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data, status } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchDashboardData());
    }
  }, [dispatch, status]);

  const stats = [
    { name: 'Total Students', value: data?.stats.totalStudents, icon: Users, color: 'blue', route: '/dashboard/users' },
    { name: 'Active Courses', value: data?.stats.activeCourses, icon: GraduationCap, color: 'emerald', route: '/dashboard/courses' },
    { name: 'Campus Courses', value: data?.stats.campusCourses, icon: Building, color: 'purple', route: '/dashboard/courses/campus' },
    { name: 'Skills Based', value: data?.stats.skillsBasedCourses, icon: Award, color: 'green', route: '/dashboard/courses/skills' },
    { name: 'Admission Requests', value: data?.stats.admissionRequests, icon: FileText, color: 'orange', route: '/dashboard/admission-request' },
    { name: 'Total Leads', value: data?.stats.totalLeads, icon: TrendingUp, color: 'indigo', route: '/dashboard/leads' },
    { name: 'Total Revenue', value: data?.stats.totalRevenue, isCurrency: true, icon: DollarSign, color: 'green', route: '/dashboard/reports' },
    { name: 'Testimonials', value: data?.stats.totalTestimonials, icon: MessageSquare, color: 'yellow', route: '/dashboard/testimonials' },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
      emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
      purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400',
      green: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400',
      orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400',
      indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400',
      yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'student_enrolled': return { Icon: Users, color: 'green' };
      case 'course_created': return { Icon: GraduationCap, color: 'blue' };
      case 'lead_generated': return { Icon: TrendingUp, color: 'yellow' };
      case 'admission_request': return { Icon: FileText, color: 'emerald' };
      case 'testimonial_added': return { Icon: MessageSquare, color: 'purple' };
      default: return { Icon: Activity, color: 'gray' };
    }
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here&apos;s a summary of your platform.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const displayValue = stat.isCurrency
            ? `₹${(stat.value || 0).toLocaleString('en-IN')}`
            : (stat.value ?? 0).toLocaleString();
          return (
            <Card key={stat.name} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(stat.route)}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                    <p className="text-2xl font-bold text-foreground mt-2">{displayValue}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity /> Recent Activity</CardTitle>
            <CardDescription>Latest updates from your platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.recentActivities.map((activity, index) => {
                const { Icon, color } = getActivityIcon(activity.type);
                return (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`w-10 h-10 rounded-full ${getColorClasses(color)} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground truncate">{activity.description}</p>
                    </div>
                    <div className="text-xs text-muted-foreground text-right shrink-0">
                      {activity.date ? formatDistanceToNow(new Date(activity.date), { addSuffix: true }) : 'a while ago'}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plus /> Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" onClick={() => router.push('/dashboard/users')}><Users className="w-5 h-5" /><span>Add Student</span></Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" onClick={() => router.push('/dashboard/courses')}><GraduationCap className="w-5 h-5" /><span>Add Course</span></Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" onClick={() => router.push('/dashboard/leads')}><TrendingUp className="w-5 h-5" /><span>View Leads</span></Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" onClick={() => router.push('/dashboard/admission-request')}><FileText className="w-5 h-5" /><span>Admissions</span></Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" onClick={() => router.push('/dashboard/blogs')}><BookOpen className="w-5 h-5" /><span>Add Blog</span></Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" onClick={() => router.push('/dashboard/testimonials')}><MessageSquare className="w-5 h-5" /><span>Testimonials</span></Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 /> Top Performing Courses</CardTitle>
            <CardDescription>Most enrolled courses on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.topPerformingCourses.map((course, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{course.name}</p>
                      <p className="text-xs text-muted-foreground">{course.enrollments} enrollments</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">₹{course.revenue.toLocaleString('en-IN')}</p>
                    <Badge variant="secondary">Revenue</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(DashboardPage), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  ),
});