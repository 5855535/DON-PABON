import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { trackVisitOnce } from './lib/metrics'
import { ProductsProvider } from './lib/ProductsContext'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import Category from './pages/Category'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

const Admin = lazy(() => import('./pages/admin/Admin'))

function RouteEffects() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  useEffect(() => {
    if (!pathname.startsWith('/admin')) trackVisitOnce()
  }, [pathname])
  return null
}

export default function App() {
  return (
    <ProductsProvider>
      <AuthProvider>
        <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-bg">
          Saltar al contenido
        </a>
        <RouteEffects />
        <Navbar />
        <main id="contenido" className="pt-14">
          <Suspense fallback={<div className="grid min-h-[60vh] place-items-center text-mute">Cargando…</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin/*" element={<Admin />} />
              <Route path="/:slug" element={<Category />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </AuthProvider>
    </ProductsProvider>
  )
}
