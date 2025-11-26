import React, { useState, useCallback } from 'react';
import {
    Container, Box, Typography, TextField, Button, Grid, Paper, InputAdornment, CircularProgress,
    Link, Snackbar, Alert, IconButton
} from '@mui/material';
import { Email, Lock, Login, Forum, Send, ArrowBack, Phone } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// --- API Endpoints ---
const LOGIN_API_URL = 'http://localhost:3001/api/v1/auth/login';
const FORGOT_PASSWORD_INIT_API = 'http://localhost:3001/api/v1/auth/forgot-password';
const FORGOT_PASSWORD_RESET_API = 'http://localhost:3001/api/v1/auth/reset-password';



// Mock theme for styling
const theme = createTheme({
    palette: {
        primary: {
            main: '#0288d1', // Light Blue
        },
        secondary: {
            main: '#f50057', // Pink
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: { borderRadius: '16px' },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: { borderRadius: '12px', textTransform: 'none' },
            },
        },
    },
});


// --- STEP 2: Password Reset (OTP + New Password) View ---
const ResetPasswordView = ({ emailOrIdentifier, setCurrentView, showToast }) => {
    const [formData, setFormData] = useState({
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validate = () => {
        let tempErrors = {};
        if (formData.otp.length !== 6 || isNaN(formData.otp)) tempErrors.otp = "OTP must be a 6-digit number.";
        if (formData.newPassword.length < 6) tempErrors.newPassword = "New password must be at least 6 characters."; // Matches backend minimum
        if (formData.newPassword !== formData.confirmPassword) tempErrors.confirmPassword = "Passwords do not match.";
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            showToast("Please fix the validation errors.", "error");
            return;
        }

        setIsLoading(true);
        const dataToSend = {
            email: emailOrIdentifier, // Identifier is treated as email by backend
            otp: formData.otp,
            newPassword: formData.newPassword,
        };

        try {
            console.log("Sending password reset data:", dataToSend);
            
            const response = await fetch(FORGOT_PASSWORD_RESET_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });
            
            const result = await response.json();

            if (response.ok) {
                // Success
                showToast(result.message || "Password reset successful! You can now log in.", "success");
                setFormData({ otp: '', newPassword: '', confirmPassword: '' });
                
                // Redirect to Login view
                setTimeout(() => setCurrentView('login'), 2500);

            } else {
                // API Error
                showToast(result.message || "Failed to reset password. Please check your code or try again.", "error");
                // Clear the OTP fields if verification failed
                setFormData(prev => ({ ...prev, otp: '' }));
            }

        } catch (error) {
            console.error("Reset Password Network Error:", error);
            showToast(`Connection error: Could not reach the server.`, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={() => setCurrentView('login')} size="small" disabled={isLoading}>
                    <ArrowBack />
                </IconButton>
                <Typography component="h1" variant="h5" fontWeight={700} color="primary.main" sx={{ ml: 1 }}>
                    Reset Password
                </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
                We sent a 6-digit code to **{emailOrIdentifier}**. Enter it below to set a new password.
            </Typography>

            <TextField
                required
                fullWidth
                label="6-Digit Code (OTP)"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                inputProps={{ maxLength: 6 }}
                error={!!errors.otp}
                helperText={errors.otp || "Check your notifications for the code."}
                disabled={isLoading}
                InputProps={{ startAdornment: (<InputAdornment position="start"><Lock color="action" /></InputAdornment>), }}
            />
            
            <TextField
                required
                fullWidth
                label="New Password (Min 6 characters)"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                error={!!errors.newPassword}
                helperText={errors.newPassword}
                disabled={isLoading}
                InputProps={{ startAdornment: (<InputAdornment position="start"><Lock color="action" /></InputAdornment>), }}
            />
            
            <TextField
                required
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                disabled={isLoading}
                InputProps={{ startAdornment: (<InputAdornment position="start"><Lock color="action" /></InputAdornment>), }}
            />

            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2, py: 1.5, borderRadius: 2, fontWeight: 700 }}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Login />}
                disabled={isLoading}
            >
                {isLoading ? 'Resetting...' : 'Confirm Reset'}
            </Button>
        </Box>
    );
};


// --- STEP 1: Forgot Password (Email Input) View ---
const ForgotPasswordView = ({ setCurrentView, setEmailOrIdentifier, showToast }) => {
    const [identifier, setIdentifier] = useState(''); // Holds the email input
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setIdentifier(e.target.value);
        if (errors.identifier) setErrors({});
    };

    const validate = () => {
        let tempErrors = {};
        if (!identifier || !/\S+@\S+\.\S+/.test(identifier)) tempErrors.identifier = "Please enter a valid registered email address.";
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            showToast("Please enter a valid email address.", "error");
            return;
        }

        setIsLoading(true);
        // Backend expects 'email' key
        const dataToSend = { email: identifier };

        try {
            console.log("Requesting password reset for:", dataToSend);
            
            const response = await fetch(FORGOT_PASSWORD_INIT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });
            
            const result = await response.json();

            if (response.ok) {
                // Backend returns 200 even if user is not found (security practice)
                showToast(result.message || "Verification code sent! Check your notifications.", "success");
                setEmailOrIdentifier(identifier); // Pass identifier to the next step
                setIdentifier('');
                
                // Redirect to OTP verification view
                setTimeout(() => setCurrentView('reset-password'), 2500);

            } else {
                // Should only hit here on 400/500 errors (validation/server issue)
                showToast(result.message || "Failed to initiate reset. Please check the email and try again.", "error");
            }

        } catch (error) {
            console.error("Forgot Password Network Error:", error);
            showToast(`Connection error: Could not reach the server.`, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={() => setCurrentView('login')} size="small" disabled={isLoading}>
                    <ArrowBack />
                </IconButton>
                <Typography component="h1" variant="h5" fontWeight={700} color="primary.main" sx={{ ml: 1 }}>
                    Recover Account
                </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
                Enter your registered email address below to receive a password reset code.
            </Typography>

            <TextField
                required
                fullWidth
                label="Registered Email Address"
                name="identifier"
                value={identifier}
                onChange={handleChange}
                error={!!errors.identifier}
                helperText={errors.identifier || "We will send the OTP to this email."}
                disabled={isLoading}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Email color="action" />
                        </InputAdornment>
                    ),
                }}
            />

            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2, py: 1.5, borderRadius: 2, fontWeight: 700 }}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                disabled={isLoading}
            >
                {isLoading ? 'Sending Code...' : 'Send Reset Code'}
            </Button>
        </Box>
    );
};


// --- LOGIN View (Kept for completeness, API calls are already integrated) ---
const LoginView = ({ setCurrentView, showToast }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const navigate = useNavigate(); 
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) { setErrors(prev => ({ ...prev, [name]: null })); }
    };

    const validate = () => {
        let tempErrors = {};
        if (!formData.email) tempErrors.email = "Email is required.";
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = "Email is not valid.";
        if (!formData.password) tempErrors.password = "Password is required.";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            showToast("Please check your email and password.", "error");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(LOGIN_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.token) { 
                localStorage.setItem('token', result.token);
                 localStorage.setItem('role', result.user.role);
                showToast("Login successful! Redirecting...", "success");
                setFormData({ email: '', password: '' }); 
                setTimeout(() => navigate('/user'), 1500); 

            } else {
                const errorMessage = result.message || 'Login failed. Check your credentials.';
                showToast(errorMessage, "error");
            }

        } catch (error) {
            console.error("Login Network Error:", error);
            showToast(`Connection error: Could not reach the server at ${LOGIN_API_URL}.`, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                <Forum color="primary" sx={{ fontSize: 50, mb: 1 }} />
                <Typography component="h1" variant="h4" fontWeight={700} color="primary.main">
                    Welcome Back
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Sign in to continue your discussion.
                </Typography>
            </Box>
        
            <Grid container spacing={3} sx={{ display: 'flex', flexDirection: 'column' }}>

                <Grid item xs={12}>
                    <TextField
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                        disabled={isLoading}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Email color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        error={!!errors.password}
                        helperText={errors.password}
                        sx={{ mt: 1}}
                        disabled={isLoading}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Lock color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>

            </Grid>

            {/* Submit Button */}
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2, mb: 2, py: 1.5, borderRadius: 2, fontWeight: 700 }}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Login />}
                disabled={isLoading}
            >
                {isLoading ? 'Logging In...' : 'Log In'}
            </Button>

            {/* Links: Forgot Password and Sign Up */}
            <Grid container justifyContent="space-between">
                <Grid item>
                    <Typography variant="body2">
                        <Button
                            // Navigates to the Forgot Password view
                            onClick={() => setCurrentView('forgot-password')}
                            sx={{ p: 0, textTransform: 'none', fontWeight: 600, color: 'primary.main' }}
                            disabled={isLoading}
                        >
                            Forgot password?
                        </Button>
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography variant="body2" color="text.secondary">
                        New user?
                        <Link
                            onClick={() => navigate('/register')} // Navigate to Register page
                            sx={{ p: 0, ml: 0.5, textTransform: 'none',textDecoration: 'none', cursor: 'pointer', fontWeight: 600 }}
                            disabled={isLoading}
                        >
                            Sign Up
                        </Link>
                    </Typography>
                </Grid>
            </Grid>


        </Box>
    );
};

// --- Main Auth Flow Component ---
const LoginPage = () => {
    // State to manage which component is visible: 'login', 'forgot-password', or 'reset-password'
    const [currentView, setCurrentView] = useState('login');
    const [emailOrIdentifier, setEmailOrIdentifier] = useState(''); // To pass data between FP steps

    const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

    const showToast = (message, severity) => setToast({ open: true, message, severity });
    const handleToastClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setToast(prev => ({ ...prev, open: false }));
    };

    const renderView = () => {
        switch (currentView) {
            case 'login':
                return <LoginView setCurrentView={setCurrentView} showToast={showToast} />;
            case 'forgot-password':
                return <ForgotPasswordView setCurrentView={setCurrentView} setEmailOrIdentifier={setEmailOrIdentifier} showToast={showToast} />;
            case 'reset-password':
                // Check if emailOrIdentifier is set before showing the reset view
                if (!emailOrIdentifier) {
                    // Redirect back to login if user somehow landed here without an email
                    showToast("Please enter your email first.", "warning");
                    setCurrentView('forgot-password');
                    return <ForgotPasswordView setCurrentView={setCurrentView} setEmailOrIdentifier={setEmailOrIdentifier} showToast={showToast} />;
                }
                return <ResetPasswordView setCurrentView={setCurrentView} emailOrIdentifier={emailOrIdentifier} showToast={showToast} />;
            default:
                return <LoginView setCurrentView={setCurrentView} showToast={showToast} />;
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs" sx={{ py: 6, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', mt: { xs: 0, sm: 4 } }}>
                <Paper
                    elevation={10}
                    sx={{
                        p: { xs: 3, md: 4 },
                        borderRadius: 4,
                        width: '100%',
                        bgcolor: 'white',
                    }}
                >
                    {renderView()}
                </Paper>
            </Container>

            {/* Snackbar for all views */}
            <Snackbar open={toast.open} autoHideDuration={5000} onClose={handleToastClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={handleToastClose} severity={toast.severity} sx={{ width: '100%' }} variant="filled">
                    {toast.message}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
};

export default LoginPage;