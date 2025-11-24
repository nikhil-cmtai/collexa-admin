'use client'

import React, { useState } from 'react'
import { 
  User, 
  Search, 
  Building2, 
  Bell, 
  CreditCard, 
  Truck, 
  Shield, 
  Save,
  Loader2,
  Eye,
  EyeOff,
  Upload,
  AlertCircle,
  Edit
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Image from 'next/image'

const SettingsPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  
  // Edit states for each tab
  const [editStates, setEditStates] = useState({
    profile: false,
    seo: false,
    business: false,
    notifications: false,
    payments: false,
    shipping: false,
    security: false
  })
  
  // Original data for cancel functionality
  const [originalData, setOriginalData] = useState({
    profile: null,
    seo: null,
    business: null,
    notifications: null,
    payments: null,
    shipping: null,
    security: null
  })

  // Profile Settings State
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@wellnessfuel.com',
    phone: '+91 98765 43210',
    avatar: '',
    bio: 'E-commerce store owner focused on wellness and health products.',
    timezone: 'Asia/Kolkata',
    language: 'en'
  })

  // SEO Settings State
  const [seoData, setSeoData] = useState({
    siteTitle: 'Wellness Fuel - Premium Health & Wellness Products',
    siteDescription: 'Discover premium health and wellness products including supplements, vitamins, and natural remedies for a healthier lifestyle.',
    siteKeywords: 'wellness, health, supplements, vitamins, natural products, fitness, nutrition',
    ogImage: '',
    twitterHandle: '@wellnessfuel',
    googleAnalytics: '',
    facebookPixel: '',
    sitemapUrl: 'https://wellnessfuel.com/sitemap.xml',
    robotsTxt: 'https://wellnessfuel.com/robots.txt',
    thirdPartyScripts: {
      googleTagManager: '',
      hotjar: '',
      intercom: '',
      zendesk: '',
      customScripts: ''
    },
    metaTags: {
      author: 'Wellness Fuel Team',
      robots: 'index, follow',
      viewport: 'width=device-width, initial-scale=1',
      themeColor: '#10b981',
      customMetaTags: ''
    }
  })

  // Business Settings State
  const [businessData, setBusinessData] = useState({
    businessName: 'Wellness Fuel Pvt Ltd',
    businessEmail: 'info@wellnessfuel.com',
    businessPhone: '+91 98765 43210',
    businessAddress: '123 Wellness Street, Health District, Mumbai, Maharashtra 400001',
    gstNumber: '27ABCDE1234F1Z5',
    panNumber: 'ABCDE1234F',
    businessType: 'Private Limited',
    industry: 'Health & Wellness',
    foundedYear: '2020',
    website: 'https://wellnessfuel.com',
    socialMedia: {
      facebook: 'https://facebook.com/wellnessfuel',
      instagram: 'https://instagram.com/wellnessfuel',
      twitter: 'https://twitter.com/wellnessfuel',
      linkedin: 'https://linkedin.com/company/wellnessfuel'
    }
  })

  // Notification Settings State
  const [notificationData, setNotificationData] = useState({
    emailNotifications: {
      orderUpdates: true,
      newOrders: true,
      lowStock: true,
      customerReviews: true,
      marketingEmails: false,
      systemAlerts: true
    },
    smsNotifications: {
      orderUpdates: false,
      newOrders: true,
      lowStock: true,
      systemAlerts: false
    },
    pushNotifications: {
      orderUpdates: true,
      newOrders: true,
      lowStock: true,
      customerReviews: true,
      systemAlerts: true
    }
  })

  // Payment Settings State
  const [paymentData, setPaymentData] = useState({
    currency: 'INR',
    paymentMethods: {
      razorpay: {
        enabled: true,
        keyId: 'rzp_test_1234567890',
        keySecret: '••••••••••••••••••••••••••••••••'
      },
      paypal: {
        enabled: false,
        clientId: '',
        clientSecret: ''
      },
      stripe: {
        enabled: false,
        publishableKey: '',
        secretKey: ''
      },
      cod: {
        enabled: true,
        minAmount: 0,
        maxAmount: 5000
      }
    },
    taxSettings: {
      gstRate: 18,
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 18
    }
  })

  // Shipping Settings State
  const [shippingData, setShippingData] = useState({
    defaultShippingRate: 50,
    freeShippingThreshold: 1000,
    shippingZones: [
      {
        id: 1,
        name: 'Mumbai',
        rate: 50,
        freeShipping: 1000
      },
      {
        id: 2,
        name: 'Delhi',
        rate: 75,
        freeShipping: 1000
      },
      {
        id: 3,
        name: 'Bangalore',
        rate: 60,
        freeShipping: 1000
      }
    ],
    deliveryTime: {
      standard: '3-5 business days',
      express: '1-2 business days',
      overnight: 'Next day delivery'
    }
  })

  const handleEdit = (section: string) => {
    // Store original data before editing
    const dataMap = {
      profile: profileData,
      seo: seoData,
      business: businessData,
      notifications: notificationData,
      payments: paymentData,
      shipping: shippingData,
      security: null // Security doesn't have editable data
    }
    
    setOriginalData(prev => ({
      ...prev,
      [section]: dataMap[section as keyof typeof dataMap]
    }))
    
    setEditStates(prev => ({
      ...prev,
      [section]: true
    }))
  }

  const handleCancel = (section: string) => {
    // Restore original data
    const original = originalData[section as keyof typeof originalData]
    if (original) {
      switch (section) {
        case 'profile':
          setProfileData(original as typeof profileData)
          break
        case 'seo':
          setSeoData(original as typeof seoData)
          break
        case 'business':
          setBusinessData(original as typeof businessData)
          break
        case 'notifications':
          setNotificationData(original as typeof notificationData)
          break
        case 'payments':
          setPaymentData(original as typeof paymentData)
          break
        case 'shipping':
          setShippingData(original as typeof shippingData)
          break
      }
    }
    
    setEditStates(prev => ({
      ...prev,
      [section]: false
    }))
  }

  const handleSave = async (section: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log(`Saving ${section} settings...`)
      
      // Exit edit mode after successful save
      setEditStates(prev => ({
        ...prev,
        [section]: false
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0]
    if (file) {
      // Handle image upload logic here
      console.log(`Uploading ${type} image:`, file.name)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your store settings and preferences</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Business
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Shipping
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information and preferences</CardDescription>
                </div>
                {!editStates.profile ? (
                  <Button onClick={() => handleEdit('profile')} variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => handleCancel('profile')} variant="outline" disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleSave('profile')} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    {profileData.avatar ? (
                      <Image src={profileData.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'avatar')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Photo
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">JPG, PNG up to 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    disabled={!editStates.profile}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    disabled={!editStates.profile}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    disabled={!editStates.profile}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    disabled={!editStates.profile}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  rows={3}
                  disabled={!editStates.profile}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={profileData.timezone} onValueChange={(value) => setProfileData({...profileData, timezone: value})} disabled={!editStates.profile}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={profileData.language} onValueChange={(value) => setProfileData({...profileData, language: value})} disabled={!editStates.profile}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="mr">Marathi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>SEO Settings</CardTitle>
                  <CardDescription>Configure your website&apos;s search engine optimization</CardDescription>
                </div>
                {!editStates.seo ? (
                  <Button onClick={() => handleEdit('seo')} variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit SEO
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => handleCancel('seo')} variant="outline" disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleSave('seo')} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="siteTitle">Site Title</Label>
                <Input
                  id="siteTitle"
                  value={seoData.siteTitle}
                  onChange={(e) => setSeoData({...seoData, siteTitle: e.target.value})}
                  placeholder="Your website title"
                  disabled={!editStates.seo}
                />
                <p className="text-sm text-muted-foreground mt-1">Recommended: 50-60 characters</p>
              </div>

              <div>
                <Label htmlFor="siteDescription">Meta Description</Label>
                <Textarea
                  id="siteDescription"
                  value={seoData.siteDescription}
                  onChange={(e) => setSeoData({...seoData, siteDescription: e.target.value})}
                  rows={3}
                  placeholder="Brief description of your website"
                  disabled={!editStates.seo}
                />
                <p className="text-sm text-muted-foreground mt-1">Recommended: 150-160 characters</p>
              </div>

              <div>
                <Label htmlFor="siteKeywords">Keywords</Label>
                <Input
                  id="siteKeywords"
                  value={seoData.siteKeywords}
                  onChange={(e) => setSeoData({...seoData, siteKeywords: e.target.value})}
                  placeholder="keyword1, keyword2, keyword3"
                  disabled={!editStates.seo}
                />
                <p className="text-sm text-muted-foreground mt-1">Separate keywords with commas</p>
              </div>

              <div>
                <Label htmlFor="ogImage">Open Graph Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="ogImage"
                    value={seoData.ogImage}
                    onChange={(e) => setSeoData({...seoData, ogImage: e.target.value})}
                    placeholder="https://example.com/og-image.jpg"
                    disabled={!editStates.seo}
                  />
                  <Button variant="outline" size="sm" disabled={!editStates.seo}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Recommended: 1200x630px</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="twitterHandle">Twitter Handle</Label>
                  <Input
                    id="twitterHandle"
                    value={seoData.twitterHandle}
                    onChange={(e) => setSeoData({...seoData, twitterHandle: e.target.value})}
                    placeholder="@yourhandle"
                    disabled={!editStates.seo}
                  />
                </div>
                <div>
                  <Label htmlFor="googleAnalytics">Google Analytics ID</Label>
                  <Input
                    id="googleAnalytics"
                    value={seoData.googleAnalytics}
                    onChange={(e) => setSeoData({...seoData, googleAnalytics: e.target.value})}
                    placeholder="GA-XXXXXXXXX-X"
                    disabled={!editStates.seo}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Third-Party Scripts</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="googleTagManager">Google Tag Manager ID</Label>
                    <Input
                      id="googleTagManager"
                      value={seoData.thirdPartyScripts.googleTagManager}
                      onChange={(e) => setSeoData({
                        ...seoData,
                        thirdPartyScripts: {
                          ...seoData.thirdPartyScripts,
                          googleTagManager: e.target.value
                        }
                      })}
                      placeholder="GTM-XXXXXXX"
                      disabled={!editStates.seo}
                    />
                    <p className="text-sm text-muted-foreground mt-1">Your Google Tag Manager container ID</p>
                  </div>
                  <div>
                    <Label htmlFor="hotjar">Hotjar Site ID</Label>
                    <Input
                      id="hotjar"
                      value={seoData.thirdPartyScripts.hotjar}
                      onChange={(e) => setSeoData({
                        ...seoData,
                        thirdPartyScripts: {
                          ...seoData.thirdPartyScripts,
                          hotjar: e.target.value
                        }
                      })}
                      placeholder="1234567"
                      disabled={!editStates.seo}
                    />
                    <p className="text-sm text-muted-foreground mt-1">Your Hotjar site tracking ID</p>
                  </div>
                  <div>
                    <Label htmlFor="intercom">Intercom App ID</Label>
                    <Input
                      id="intercom"
                      value={seoData.thirdPartyScripts.intercom}
                      onChange={(e) => setSeoData({
                        ...seoData,
                        thirdPartyScripts: {
                          ...seoData.thirdPartyScripts,
                          intercom: e.target.value
                        }
                      })}
                      placeholder="xxxxxxxx"
                      disabled={!editStates.seo}
                    />
                    <p className="text-sm text-muted-foreground mt-1">Your Intercom application ID</p>
                  </div>
                  <div>
                    <Label htmlFor="zendesk">Zendesk Widget Key</Label>
                    <Input
                      id="zendesk"
                      value={seoData.thirdPartyScripts.zendesk}
                      onChange={(e) => setSeoData({
                        ...seoData,
                        thirdPartyScripts: {
                          ...seoData.thirdPartyScripts,
                          zendesk: e.target.value
                        }
                      })}
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      disabled={!editStates.seo}
                    />
                    <p className="text-sm text-muted-foreground mt-1">Your Zendesk widget key</p>
                  </div>
                  <div>
                    <Label htmlFor="customScripts">Custom Scripts</Label>
                    <Textarea
                      id="customScripts"
                      value={seoData.thirdPartyScripts.customScripts}
                      onChange={(e) => setSeoData({
                        ...seoData,
                        thirdPartyScripts: {
                          ...seoData.thirdPartyScripts,
                          customScripts: e.target.value
                        }
                      })}
                      placeholder="<!-- Custom tracking scripts -->&#10;&lt;script&gt;&#10;  // Your custom JavaScript code here&#10;&lt;/script&gt;"
                      rows={6}
                      disabled={!editStates.seo}
                    />
                    <p className="text-sm text-muted-foreground mt-1">Add custom JavaScript code for tracking, analytics, or other third-party services</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Meta Tags</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="metaAuthor">Author</Label>
                      <Input
                        id="metaAuthor"
                        value={seoData.metaTags.author}
                        onChange={(e) => setSeoData({
                          ...seoData,
                          metaTags: {
                            ...seoData.metaTags,
                            author: e.target.value
                          }
                        })}
                        placeholder="Author Name"
                        disabled={!editStates.seo}
                      />
                    </div>
                    <div>
                      <Label htmlFor="metaRobots">Robots</Label>
                      <Select 
                        value={seoData.metaTags.robots} 
                        onValueChange={(value) => setSeoData({
                          ...seoData,
                          metaTags: {
                            ...seoData.metaTags,
                            robots: value
                          }
                        })}
                        disabled={!editStates.seo}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select robots directive" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="index, follow">Index, Follow</SelectItem>
                          <SelectItem value="index, nofollow">Index, No Follow</SelectItem>
                          <SelectItem value="noindex, follow">No Index, Follow</SelectItem>
                          <SelectItem value="noindex, nofollow">No Index, No Follow</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="metaViewport">Viewport</Label>
                      <Input
                        id="metaViewport"
                        value={seoData.metaTags.viewport}
                        onChange={(e) => setSeoData({
                          ...seoData,
                          metaTags: {
                            ...seoData.metaTags,
                            viewport: e.target.value
                          }
                        })}
                        placeholder="width=device-width, initial-scale=1"
                        disabled={!editStates.seo}
                      />
                    </div>
                    <div>
                      <Label htmlFor="metaThemeColor">Theme Color</Label>
                      <Input
                        id="metaThemeColor"
                        value={seoData.metaTags.themeColor}
                        onChange={(e) => setSeoData({
                          ...seoData,
                          metaTags: {
                            ...seoData.metaTags,
                            themeColor: e.target.value
                          }
                        })}
                        placeholder="#10b981"
                        disabled={!editStates.seo}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="customMetaTags">Custom Meta Tags</Label>
                    <Textarea
                      id="customMetaTags"
                      value={seoData.metaTags.customMetaTags}
                      onChange={(e) => setSeoData({
                        ...seoData,
                        metaTags: {
                          ...seoData.metaTags,
                          customMetaTags: e.target.value
                        }
                      })}
                      placeholder="&lt;meta name=&quot;custom&quot; content=&quot;value&quot;&gt;&#10;&lt;meta property=&quot;og:type&quot; content=&quot;website&quot;&gt;&#10;&lt;meta name=&quot;twitter:card&quot; content=&quot;summary_large_image&quot;&gt;"
                      rows={6}
                      disabled={!editStates.seo}
                    />
                    <p className="text-sm text-muted-foreground mt-1">Add custom meta tags for Open Graph, Twitter Cards, or other specific requirements</p>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Settings */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>Manage your business details and legal information</CardDescription>
                </div>
                {!editStates.business ? (
                  <Button onClick={() => handleEdit('business')} variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Business
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => handleCancel('business')} variant="outline" disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleSave('business')} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessData.businessName}
                    onChange={(e) => setBusinessData({...businessData, businessName: e.target.value})}
                    disabled={!editStates.business}
                  />
                </div>
                <div>
                  <Label htmlFor="businessEmail">Business Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={businessData.businessEmail}
                    onChange={(e) => setBusinessData({...businessData, businessEmail: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="businessPhone">Business Phone</Label>
                  <Input
                    id="businessPhone"
                    value={businessData.businessPhone}
                    onChange={(e) => setBusinessData({...businessData, businessPhone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={businessData.website}
                    onChange={(e) => setBusinessData({...businessData, website: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="businessAddress">Business Address</Label>
                <Textarea
                  id="businessAddress"
                  value={businessData.businessAddress}
                  onChange={(e) => setBusinessData({...businessData, businessAddress: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    value={businessData.gstNumber}
                    onChange={(e) => setBusinessData({...businessData, gstNumber: e.target.value})}
                    placeholder="27ABCDE1234F1Z5"
                  />
                </div>
                <div>
                  <Label htmlFor="panNumber">PAN Number</Label>
                  <Input
                    id="panNumber"
                    value={businessData.panNumber}
                    onChange={(e) => setBusinessData({...businessData, panNumber: e.target.value})}
                    placeholder="ABCDE1234F"
                  />
                </div>
                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select value={businessData.businessType} onValueChange={(value) => setBusinessData({...businessData, businessType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Private Limited">Private Limited</SelectItem>
                      <SelectItem value="Public Limited">Public Limited</SelectItem>
                      <SelectItem value="Partnership">Partnership</SelectItem>
                      <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                      <SelectItem value="LLP">Limited Liability Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="foundedYear">Founded Year</Label>
                  <Input
                    id="foundedYear"
                    value={businessData.foundedYear}
                    onChange={(e) => setBusinessData({...businessData, foundedYear: e.target.value})}
                    placeholder="2020"
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Social Media Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={businessData.socialMedia.facebook}
                      onChange={(e) => setBusinessData({
                        ...businessData, 
                        socialMedia: {...businessData.socialMedia, facebook: e.target.value}
                      })}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={businessData.socialMedia.instagram}
                      onChange={(e) => setBusinessData({
                        ...businessData, 
                        socialMedia: {...businessData.socialMedia, instagram: e.target.value}
                      })}
                      placeholder="https://instagram.com/yourpage"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={businessData.socialMedia.twitter}
                      onChange={(e) => setBusinessData({
                        ...businessData, 
                        socialMedia: {...businessData.socialMedia, twitter: e.target.value}
                      })}
                      placeholder="https://twitter.com/yourpage"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={businessData.socialMedia.linkedin}
                      onChange={(e) => setBusinessData({
                        ...businessData, 
                        socialMedia: {...businessData.socialMedia, linkedin: e.target.value}
                      })}
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Configure how you want to receive notifications</CardDescription>
                </div>
                {!editStates.notifications ? (
                  <Button onClick={() => handleEdit('notifications')} variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Notifications
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => handleCancel('notifications')} variant="outline" disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleSave('notifications')} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  {Object.entries(notificationData.emailNotifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {key === 'orderUpdates' && 'Get notified when order status changes'}
                          {key === 'newOrders' && 'Receive alerts for new orders'}
                          {key === 'lowStock' && 'Get notified when inventory is low'}
                          {key === 'customerReviews' && 'Receive notifications for new reviews'}
                          {key === 'marketingEmails' && 'Receive promotional emails and updates'}
                          {key === 'systemAlerts' && 'Get important system notifications'}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked: boolean) => setNotificationData({
                          ...notificationData,
                          emailNotifications: {
                            ...notificationData.emailNotifications,
                            [key]: checked
                          }
                        })}
                        disabled={!editStates.notifications}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">SMS Notifications</h3>
                <div className="space-y-4">
                  {Object.entries(notificationData.smsNotifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {key === 'orderUpdates' && 'Get SMS when order status changes'}
                          {key === 'newOrders' && 'Receive SMS alerts for new orders'}
                          {key === 'lowStock' && 'Get SMS when inventory is low'}
                          {key === 'systemAlerts' && 'Get important system SMS notifications'}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked: boolean) => setNotificationData({
                          ...notificationData,
                          smsNotifications: {
                            ...notificationData.smsNotifications,
                            [key]: checked
                          }
                        })}
                        disabled={!editStates.notifications}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
                <div className="space-y-4">
                  {Object.entries(notificationData.pushNotifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {key === 'orderUpdates' && 'Get push notifications when order status changes'}
                          {key === 'newOrders' && 'Receive push alerts for new orders'}
                          {key === 'lowStock' && 'Get push notifications when inventory is low'}
                          {key === 'customerReviews' && 'Receive push notifications for new reviews'}
                          {key === 'systemAlerts' && 'Get important system push notifications'}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked: boolean) => setNotificationData({
                          ...notificationData,
                          pushNotifications: {
                            ...notificationData.pushNotifications,
                            [key]: checked
                          }
                        })}
                        disabled={!editStates.notifications}
                      />
                    </div>
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Settings</CardTitle>
                  <CardDescription>Configure payment gateways and tax settings</CardDescription>
                </div>
                {!editStates.payments ? (
                  <Button onClick={() => handleEdit('payments')} variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Payments
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => handleCancel('payments')} variant="outline" disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleSave('payments')} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="currency">Default Currency</Label>
                <Select value={paymentData.currency} onValueChange={(value) => setPaymentData({...paymentData, currency: value})} disabled={!editStates.payments}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="GBP">British Pound (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Payment Gateways</h3>
                <div className="space-y-6">
                  {/* Razorpay */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Razorpay</h4>
                          <p className="text-sm text-muted-foreground">Accept payments via Razorpay</p>
                        </div>
                      </div>
                      <Switch
                        checked={paymentData.paymentMethods.razorpay.enabled}
                        onCheckedChange={(checked: boolean) => setPaymentData({
                          ...paymentData,
                          paymentMethods: {
                            ...paymentData.paymentMethods,
                            razorpay: {
                              ...paymentData.paymentMethods.razorpay,
                              enabled: checked
                            }
                          }
                        })}
                      />
                    </div>
                    {paymentData.paymentMethods.razorpay.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="razorpayKeyId">Key ID</Label>
                          <Input
                            id="razorpayKeyId"
                            value={paymentData.paymentMethods.razorpay.keyId}
                            onChange={(e) => setPaymentData({
                              ...paymentData,
                              paymentMethods: {
                                ...paymentData.paymentMethods,
                                razorpay: {
                                  ...paymentData.paymentMethods.razorpay,
                                  keyId: e.target.value
                                }
                              }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="razorpayKeySecret">Key Secret</Label>
                          <div className="relative">
                            <Input
                              id="razorpayKeySecret"
                              type={showPassword ? "text" : "password"}
                              value={paymentData.paymentMethods.razorpay.keySecret}
                              onChange={(e) => setPaymentData({
                                ...paymentData,
                                paymentMethods: {
                                  ...paymentData.paymentMethods,
                                  razorpay: {
                                    ...paymentData.paymentMethods.razorpay,
                                    keySecret: e.target.value
                                  }
                                }
                              })}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cash on Delivery */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                          <Truck className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Cash on Delivery</h4>
                          <p className="text-sm text-muted-foreground">Accept cash payments on delivery</p>
                        </div>
                      </div>
                      <Switch
                        checked={paymentData.paymentMethods.cod.enabled}
                        onCheckedChange={(checked: boolean) => setPaymentData({
                          ...paymentData,
                          paymentMethods: {
                            ...paymentData.paymentMethods,
                            cod: {
                              ...paymentData.paymentMethods.cod,
                              enabled: checked
                            }
                          }
                        })}
                      />
                    </div>
                    {paymentData.paymentMethods.cod.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="codMinAmount">Minimum Amount</Label>
                          <Input
                            id="codMinAmount"
                            type="number"
                            value={paymentData.paymentMethods.cod.minAmount}
                            onChange={(e) => setPaymentData({
                              ...paymentData,
                              paymentMethods: {
                                ...paymentData.paymentMethods,
                                cod: {
                                  ...paymentData.paymentMethods.cod,
                                  minAmount: Number(e.target.value)
                                }
                              }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="codMaxAmount">Maximum Amount</Label>
                          <Input
                            id="codMaxAmount"
                            type="number"
                            value={paymentData.paymentMethods.cod.maxAmount}
                            onChange={(e) => setPaymentData({
                              ...paymentData,
                              paymentMethods: {
                                ...paymentData.paymentMethods,
                                cod: {
                                  ...paymentData.paymentMethods.cod,
                                  maxAmount: Number(e.target.value)
                                }
                              }
                            })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Tax Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="gstRate">GST Rate (%)</Label>
                    <Input
                      id="gstRate"
                      type="number"
                      value={paymentData.taxSettings.gstRate}
                      onChange={(e) => setPaymentData({
                        ...paymentData,
                        taxSettings: {
                          ...paymentData.taxSettings,
                          gstRate: Number(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cgstRate">CGST Rate (%)</Label>
                    <Input
                      id="cgstRate"
                      type="number"
                      value={paymentData.taxSettings.cgstRate}
                      onChange={(e) => setPaymentData({
                        ...paymentData,
                        taxSettings: {
                          ...paymentData.taxSettings,
                          cgstRate: Number(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sgstRate">SGST Rate (%)</Label>
                    <Input
                      id="sgstRate"
                      type="number"
                      value={paymentData.taxSettings.sgstRate}
                      onChange={(e) => setPaymentData({
                        ...paymentData,
                        taxSettings: {
                          ...paymentData.taxSettings,
                          sgstRate: Number(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="igstRate">IGST Rate (%)</Label>
                    <Input
                      id="igstRate"
                      type="number"
                      value={paymentData.taxSettings.igstRate}
                      onChange={(e) => setPaymentData({
                        ...paymentData,
                        taxSettings: {
                          ...paymentData.taxSettings,
                          igstRate: Number(e.target.value)
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Shipping Settings</CardTitle>
                  <CardDescription>Configure shipping rates and delivery options</CardDescription>
                </div>
                {!editStates.shipping ? (
                  <Button onClick={() => handleEdit('shipping')} variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Shipping
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => handleCancel('shipping')} variant="outline" disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleSave('shipping')} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="defaultShippingRate">Default Shipping Rate (₹)</Label>
                  <Input
                    id="defaultShippingRate"
                    type="number"
                    value={shippingData.defaultShippingRate}
                    onChange={(e) => setShippingData({...shippingData, defaultShippingRate: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="freeShippingThreshold">Free Shipping Threshold (₹)</Label>
                  <Input
                    id="freeShippingThreshold"
                    type="number"
                    value={shippingData.freeShippingThreshold}
                    onChange={(e) => setShippingData({...shippingData, freeShippingThreshold: Number(e.target.value)})}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Shipping Zones</h3>
                <div className="space-y-4">
                  {shippingData.shippingZones.map((zone) => (
                    <div key={zone.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Zone Name</Label>
                          <Input value={zone.name} readOnly />
                        </div>
                        <div>
                          <Label>Shipping Rate (₹)</Label>
                          <Input
                            type="number"
                            value={zone.rate}
                            onChange={(e) => {
                              const updatedZones = shippingData.shippingZones.map(z => 
                                z.id === zone.id ? {...z, rate: Number(e.target.value)} : z
                              )
                              setShippingData({...shippingData, shippingZones: updatedZones})
                            }}
                          />
                        </div>
                        <div>
                          <Label>Free Shipping Threshold (₹)</Label>
                          <Input
                            type="number"
                            value={zone.freeShipping}
                            onChange={(e) => {
                              const updatedZones = shippingData.shippingZones.map(z => 
                                z.id === zone.id ? {...z, freeShipping: Number(e.target.value)} : z
                              )
                              setShippingData({...shippingData, shippingZones: updatedZones})
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Delivery Timeframes</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="standardDelivery">Standard Delivery</Label>
                    <Input
                      id="standardDelivery"
                      value={shippingData.deliveryTime.standard}
                      onChange={(e) => setShippingData({
                        ...shippingData,
                        deliveryTime: {
                          ...shippingData.deliveryTime,
                          standard: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expressDelivery">Express Delivery</Label>
                    <Input
                      id="expressDelivery"
                      value={shippingData.deliveryTime.express}
                      onChange={(e) => setShippingData({
                        ...shippingData,
                        deliveryTime: {
                          ...shippingData.deliveryTime,
                          express: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="overnightDelivery">Overnight Delivery</Label>
                    <Input
                      id="overnightDelivery"
                      value={shippingData.deliveryTime.overnight}
                      onChange={(e) => setShippingData({
                        ...shippingData,
                        deliveryTime: {
                          ...shippingData.deliveryTime,
                          overnight: e.target.value
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security and privacy</CardDescription>
                </div>
                {!editStates.security ? (
                  <Button onClick={() => handleEdit('security')} variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Security
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => handleCancel('security')} variant="outline" disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleSave('security')} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Keep your account secure by regularly updating your password and enabling two-factor authentication.
                </AlertDescription>
              </Alert>

              <div>
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button variant="outline">
                    Update Password
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Enable 2FA</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Login Sessions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-muted-foreground">Chrome on Windows • Mumbai, India</p>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Mobile App</p>
                      <p className="text-sm text-muted-foreground">iOS App • Last active 2 hours ago</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Revoke
                    </Button>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SettingsPage 
                   