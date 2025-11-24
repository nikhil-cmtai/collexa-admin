'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ChevronRight, 
  Home, 
  Sun, 
  Moon, 
  Bell, 
  LucideIcon,
  Monitor,
  LogOut
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getUserFromCookie, logout, User } from '@/lib/auth'

interface Breadcrumb {
  name: string
  href: string
  icon?: LucideIcon
}

interface HeaderProps {
  isCollapsed: boolean
}

const Header: React.FC<HeaderProps> = ({ isCollapsed }) => {
  const pathname = usePathname()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [user, setUser] = React.useState<User | null>(null)

  React.useEffect(() => {
    setMounted(true)
    setUser(getUserFromCookie())
  }, [])

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getThemeIcon = () => {
    if (!mounted) return <Monitor className="w-5 h-5" />
    if (theme === 'light') return <Sun className="w-5 h-5" />
    if (theme === 'dark') return <Moon className="w-5 h-5" />
    return <Monitor className="w-5 h-5" />
  }

  const getThemeTitle = () => {
    if (!mounted) return 'Loading...'
    if (theme === 'light') return 'Switch to dark mode'
    if (theme === 'dark') return 'Switch to system mode'
    return 'Switch to light mode'
  }

  const generateBreadcrumbs = (): Breadcrumb[] => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const breadcrumbs: Breadcrumb[] = [
      { name: 'Dashboard', href: '/dashboard', icon: Home }
    ]

    if (pathSegments.length > 1) {
      const currentPage = pathSegments[pathSegments.length - 1]
      const capitalizedPage = currentPage.charAt(0).toUpperCase() + currentPage.slice(1)
      breadcrumbs.push({
        name: capitalizedPage,
        href: `/${pathSegments.join('/')}`
      })
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <header className={`
      fixed top-0 right-0 h-16 bg-background border-b border-border 
      transition-all duration-300 ease-in-out z-30 shadow-sm
      ${isCollapsed ? 'lg:left-16' : 'lg:left-64'}
      left-0
    `}>
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Breadcrumbs - Hidden on small screens, visible on md and up */}
        <nav className="hidden md:flex items-center justify-start space-x-1 text-sm min-w-0">
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.href}>
              {index > 0 && (
                <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              )}
              <Link
                href={breadcrumb.href}
                className={`
                  flex items-center space-x-1 px-2 py-1 rounded-md transition-colors min-w-0
                  ${index === breadcrumbs.length - 1
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {breadcrumb.icon && <breadcrumb.icon className="w-4 h-4 flex-shrink-0" />}
                <span className="truncate">{breadcrumb.name}</span>
              </Link>
            </React.Fragment>
          ))}
        </nav>

        {/* Empty div for small screens to maintain layout */}
        <div className="flex-1 md:hidden"></div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">

          {/* Notifications */}
          <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200"
            title={mounted ? `${getThemeTitle()} (Current: ${resolvedTheme})` : getThemeTitle()}
          >
            {getThemeIcon()}
            <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
              theme === 'light' ? 'bg-primary' : 
              theme === 'dark' ? 'bg-primary' : 
              'bg-primary'
            } animate-pulse`}></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3 pl-3 border-l border-border">
            <div className="hidden lg:block text-right flex flex-col justify-center">
              <p className="text-sm font-medium text-foreground leading-tight">
                {mounted && user?.name ? user.name : 'Admin'}
              </p>
              <p className="text-xs text-muted-foreground leading-tight">
                {mounted && user?.email ? user.email : 'admin@gmail.com'}
              </p>
            </div>
            <Avatar className="w-8 h-8">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="text-xs">
                {mounted && user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={logout}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header