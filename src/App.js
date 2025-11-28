// src/App.js
import { ThemeProvider } from '@mui/material/styles';
import DiscussifyHome from './pages/DiscussifyHome';
import theme from './theme';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import UserDashboard from './pages/UserDashboard';
import RegistrationComponent from './pages/RegistrationPage';
import Navbar from './components/Navbar';
import AppFooter from './components/AppFooter';

function AppContent() {
  const location = useLocation();
  const hideNavAndFooter = location.pathname === '/user';

  return (
    <>
      {!hideNavAndFooter && <Navbar />}
      <Routes>
        <Route path="/" element={<DiscussifyHome />} />
        <Route path="/register" element={<RegistrationComponent />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {!hideNavAndFooter && <AppFooter />}
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;