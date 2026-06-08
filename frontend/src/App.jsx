import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Pages/Authentication/Login'
import Dashboard from './Pages/Dashboard/Dashboard'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
