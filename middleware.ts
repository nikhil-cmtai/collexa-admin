import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes and their required roles
const protectedRoutes = {
  '/dashboard': ['admin'],
  }


export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow all static asset requests (served from /public) to pass through
  // This prevents images, fonts, and other files from being blocked by auth redirects
  const isStaticAsset =
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|mp4|webm|woff2?|ttf|otf|eot)$/i.test(pathname) ||
    pathname.startsWith('/images/') ||
    pathname === '/logo.png' ||
    pathname === '/next.svg' ||
    pathname === '/vercel.svg' ||
    pathname === '/globe.svg' ||
    pathname === '/window.svg'

  if (isStaticAsset) {
    return NextResponse.next()
  }

  // Get user data from cookies
  const userCookie = request.cookies.get('user')
  let user = null
  
  if (userCookie) {
    try {
      user = JSON.parse(userCookie.value)
    } catch (error) {
      console.error('Error parsing user cookie:', error)
    }
  }

  // Check if the current path is a public route

  // If user is authenticated
  if (user) {
    // Check if user has access to the current route
    const routeAccess = Object.entries(protectedRoutes).find(([route]) => 
      pathname.startsWith(route)
    )

    if (routeAccess) {
      const [route, allowedRoles] = routeAccess
      
      if (!allowedRoles.includes(user.role)) {
        // User doesn't have access to this route, redirect to their dashboard
        return NextResponse.redirect(new URL(getDashboardForRole(user.role), request.url))
      }
    }
  }

  return NextResponse.next()
}

function getDashboardForRole(role: string): string {
  switch (role) {
    case 'admin':
      return '/dashboard'
    default:
      return '/'
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
