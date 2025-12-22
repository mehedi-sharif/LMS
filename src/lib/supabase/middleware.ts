import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // 1. Redirect unauthenticated users from protected routes
    const isProtectedRoute = path.startsWith('/admin') ||
        path.startsWith('/teacher') ||
        path.startsWith('/student') ||
        path.startsWith('/organization')

    if (!user && isProtectedRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth'
        return NextResponse.redirect(url)
    }

    // 2. Redirect authenticated users away from auth page
    if (user && path.startsWith('/auth')) {
        const url = request.nextUrl.clone()
        const userRole = user.user_metadata?.role || 'student'

        if (userRole === 'admin') url.pathname = '/organization/dashboard'
        else if (userRole === 'teacher') url.pathname = '/teacher/dashboard'
        else url.pathname = '/student/dashboard'

        return NextResponse.redirect(url)
    }

    // 3. Status Check & Role-based protection
    if (user) {
        const userRole = user.user_metadata?.role || 'student'

        // Fetch profile status for non-admin users on protected routes
        if (userRole !== 'admin' && isProtectedRoute && path !== '/pending-approval') {
            const { data: profile } = await supabase
                .from('profiles')
                .select('status')
                .eq('id', user.id)
                .single()

            if (profile && profile.status !== 'approved') {
                const url = request.nextUrl.clone()
                url.pathname = '/pending-approval'
                return NextResponse.redirect(url)
            }
        }

        // Additional role-based path protection
        if (path.startsWith('/admin') || path.startsWith('/organization')) {
            if (userRole !== 'admin') {
                const url = request.nextUrl.clone()
                url.pathname = '/'
                return NextResponse.redirect(url)
            }
        }

        if (path.startsWith('/teacher')) {
            if (userRole !== 'teacher' && userRole !== 'admin') {
                const url = request.nextUrl.clone()
                url.pathname = '/'
                return NextResponse.redirect(url)
            }
        }

        // If approved and on pending page, send to dashboard
        if (path === '/pending-approval') {
            const { data: profile } = await supabase
                .from('profiles')
                .select('status')
                .eq('id', user.id)
                .single()

            if (profile?.status === 'approved') {
                const url = request.nextUrl.clone()
                if (userRole === 'admin') url.pathname = '/organization/dashboard'
                else if (userRole === 'teacher') url.pathname = '/teacher/dashboard'
                else url.pathname = '/student/dashboard'
                return NextResponse.redirect(url)
            }
        }
    }

    return supabaseResponse
}
