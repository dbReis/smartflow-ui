import { Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { BoardPage } from './pages/BoardPage'
import { FeedbackPage } from './pages/FeedbackPage'
import { NotFoundPage } from './pages/NotFoundPage'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<BoardPage />} />
        <Route path="feedback/:id" element={<FeedbackPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
