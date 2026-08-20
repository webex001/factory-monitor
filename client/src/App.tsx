import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Stations } from '@/pages/Stations'
import { Dashboard } from '@/pages/Dashboard'
import { FloorMap } from '@/pages/FloorMap'
import { Layout } from './components/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            index
            element={
              <ErrorBoundary>
                <Stations />
              </ErrorBoundary>
            }
          />
          <Route
            path="dashboard"
            element={
              <ErrorBoundary>
                <Dashboard />
              </ErrorBoundary>
            }
          />
          <Route
            path="floor-map"
            element={
              <ErrorBoundary>
                <FloorMap />
              </ErrorBoundary>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
