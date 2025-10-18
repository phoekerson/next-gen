import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Définir les routes protégées
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/upload(.*)',
  '/api/download(.*)',
  '/api/download-file(.*)',
  '/api/download-simple(.*)',
  '/api/download-direct(.*)',
  '/api/download-final(.*)',
  '/api/download-redirect(.*)',
  '/api/make-public(.*)',
  '/api/fix-public-access(.*)',
  '/api/sync-user(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // Protection des routes sensibles
  if (isProtectedRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};