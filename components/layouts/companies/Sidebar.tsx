'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FileText,
  GraduationCap,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  BookOpen,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Settings,
} from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

interface NavigationItem {
  name: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  subItems?: NavigationItem[]
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const router = useRouter()

  // Navigation items with sub-items - arranged in logical order
  const navigationItems: NavigationItem[] = [
    { name: 'Dashboard', href: '/companies', icon: LayoutDashboard },
    { name: 'Applications', href: '/companies/applications', icon: Users },
    { name: 'Internships', href: '/companies/internships', icon: FileText },
    { name: 'Jobs', icon: GraduationCap, href: '/companies/jobs'},
    { name: 'Placements', href: '/companies/placements', icon: BookOpen },
    { name: 'Events', href: '/companies/events', icon: MessageSquare },
    { name: 'Settings', href: '/companies/settings', icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === '/companies') {
      return pathname === '/companies'
    }
    return pathname.startsWith(href)
  }

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isExpanded = (itemName: string) => expandedItems.includes(itemName)

  const hasActiveSubItem = (subItems: NavigationItem[]) => {
    return subItems.some(subItem => subItem.href && isActive(subItem.href))
  }

  const handleLogout = () => {
    // Add logout logic here
    router.push('/logout')
  }

  // Custom navigation handler for main and sub items
  const handleNavigate = (href: string | undefined) => {
    if (href) {
      router.push(href)
      setIsMobileOpen(false)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-background border-r border-border 
        transition-all duration-300 ease-in-out z-50 shadow-lg flex flex-col
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          {!isCollapsed && (
            <div className="flex items-center justify-center flex-1">
              <Image 
                src="/logo.png" 
                alt="HealthCare" 
                width={100} 
                height={40} 
                className="object-contain" 
              />
            </div>
          )}
          {isCollapsed && (
            <div className="flex items-center justify-center flex-1">
              <Image 
                src="/logo.png" 
                alt="HealthCare" 
                width={32}
                height={32} 
                className="object-contain" 
              />
            </div>
          )}
          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="ghost"
            className="p-2 rounded-lg hover:bg-accent transition-colors flex-shrink-0"
            size="icon"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            )}
          </Button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const hasSubItems = item.subItems && item.subItems.length > 0
            const isItemExpanded = isExpanded(item.name)
            const hasActiveChild = hasSubItems && hasActiveSubItem(item.subItems!)
            const isItemActive = item.href ? isActive(item.href) : false

            return (
              <div key={item.name} className="space-y-1">
                {/* Main Item */}
                <div
                  className={`
                    flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative no-underline
                    ${isItemActive || hasActiveChild
                      ? 'bg-accent text-accent-foreground border-r-2 border-primary shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }
                    ${isCollapsed ? 'justify-center px-2' : ''}
                    ${hasSubItems ? 'cursor-pointer' : item.href ? 'cursor-pointer' : ''}
                  `}
                  onClick={() => {
                    if (hasSubItems) {
                      toggleExpanded(item.name)
                    } else if (item.href) {
                      handleNavigate(item.href)
                    }
                  }}
                  title={isCollapsed ? item.name : undefined}
                  style={{ userSelect: 'none' }}
                  tabIndex={0}
                  role={item.href ? 'button' : hasSubItems ? 'button' : undefined}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (hasSubItems) {
                        toggleExpanded(item.name)
                      } else if (item.href) {
                        handleNavigate(item.href)
                      }
                    }
                  }}
                >
                  <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} flex-shrink-0`} />
                  {!isCollapsed && (
                    <>
                      <span className="font-medium truncate flex-1">{item.name}</span>
                      {hasSubItems && (
                        <div className="ml-2">
                          {isItemExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      )}
                    </>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border">
                      {item.name}
                    </div>
                  )}
                </div>

                {/* Sub Items */}
                {hasSubItems && !isCollapsed && isItemExpanded && (
                  <div className="ml-4 space-y-1">
                    {item.subItems!.map((subItem) => {
                      const SubIcon = subItem.icon
                      const isSubActive = subItem.href ? isActive(subItem.href) : false

                      return (
                        <div
                          key={subItem.name}
                          className={`
                            flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative no-underline
                            ${isSubActive
                              ? 'bg-accent/80 text-accent-foreground border-r-2 border-primary/60 shadow-sm'
                              : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                            }
                            cursor-pointer
                          `}
                          onClick={() => handleNavigate(subItem.href)}
                          style={{ userSelect: 'none' }}
                          tabIndex={0}
                          role="button"
                          onKeyDown={e => {
                            if ((e.key === 'Enter' || e.key === ' ') && subItem.href) {
                              handleNavigate(subItem.href)
                            }
                          }}
                        >
                          <SubIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                          <span className="font-medium truncate">{subItem.name}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer - Fixed */}
        <div className="p-4 border-t border-border flex-shrink-0">
          <Button
            onClick={handleLogout}
            className={`
              flex items-center w-full px-3 py-2.5 text-destructive 
              hover:bg-destructive/10 rounded-lg transition-colors group relative
              ${isCollapsed ? 'justify-center px-2' : ''}
            `}
            size="icon"
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} flex-shrink-0`} />
            {!isCollapsed && <span className="font-medium">Logout</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border">
                Logout
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu button */}
      <Button
        onClick={() => setIsMobileOpen(true)}
        variant="ghost"
        className="fixed top-4 left-4 z-40 p-2 border border-border rounded-lg lg:hidden shadow-lg hover:bg-accent transition-colors"
        size="icon"
      >
        <Menu className="w-5 h-5 text-muted-foreground" />
      </Button>
    </>
  )
}

export default Sidebar