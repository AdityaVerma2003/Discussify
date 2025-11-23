// src/App.js (Example structure)
import { ThemeProvider } from '@mui/material/styles';
import DiscussifyHome from './components/DiscussifyHome';
import theme from './theme';
import {BrowserRouter ,Route , Routes} from 'react-router-dom';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import UserDashboard from './pages/UserDashboard';
import RegistrationComponent from './pages/RegistrationPage';


function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={ <DiscussifyHome /> } />
          <Route path="/register" element={ <RegistrationComponent /> } />
          <Route path="/login" element={ <LoginPage /> } />
          <Route path="/user" element={ <UserDashboard /> } />
          <Route path="*" element={ <NotFoundPage /> } />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;