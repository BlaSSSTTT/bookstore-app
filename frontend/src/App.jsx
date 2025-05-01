import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AuthorPage from './components/AuthorPage';
import GenrePage from './components/GenrePage';
import BookPage from './components/BookPage';
import ReceiptPage from './components/ReceiptPage';
import ReportPage from './components/ReportPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Navbar from './components/Navbar';
import ClientPage from './components/ClientPage';

function ProtectedRoute({ children, allowedRoles }) {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const decoded = jwtDecode(token);
      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        navigate('/books');
      }
    } catch (error) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate, allowedRoles]);
  return children;
}

function PublicRoute({ children }) {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/books');
    }
  }, [navigate]);
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['user', 'manager', 'admin']}>
              <Navbar />
              <BookPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/authors"
          element={
            <ProtectedRoute allowedRoles={['user', 'manager', 'admin']}>
              <Navbar />
              <AuthorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/genres"
          element={
            <ProtectedRoute allowedRoles={['user', 'manager', 'admin']}>
              <Navbar />
              <GenrePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/books"
          element={
            <ProtectedRoute allowedRoles={['user', 'manager', 'admin']}>
              <Navbar />
              <BookPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <Navbar />
              <ClientPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receipts"
          element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <Navbar />
              <ReceiptPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Navbar />
              <ReportPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;