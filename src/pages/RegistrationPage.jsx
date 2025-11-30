import React, { useState, useCallback, useEffect } from 'react';
import {
    Container, Box, Typography, TextField, Button, Grid, Avatar, Paper, IconButton,
    InputAdornment, Link, Snackbar, Alert, CircularProgress,
    FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput
} from '@mui/material';
import { AccountCircle, Email, Lock, Description, CloudUpload, CameraAlt, Forum, VpnKey, ContentCopy, Favorite } from '@mui/icons-material';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// --- Global Constants ---
const MAX_BIO_LENGTH = 200;
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024; // 5MB
const REGISTER_API_URL = 'http://localhost:3001/api/v1/auth/register';
const VERIFY_API_URL = 'http://localhost:3001/api/v1/auth/verify-email';
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_ ]{3,20}$/; 
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Community Categories (Must match your backend enum exactly)
const COMMUNITY_CATEGORIES = [
    'Technology',
    'Gaming',
    'Sports',
    'Music',
    'Art',
    'Education',
    'Science',
    'Business',
    'Health',
    'Food',
    'Travel',
    'Fashion',
    'Entertainment',
    'Books',
    'Photography',
    'Other'
];

const theme = createTheme({
    palette: {
        mode: 'light',
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
                root: {
                    borderRadius: '16px',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    textTransform: 'none',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                size: 'small',
            },
        },
    },
});

// Initial state for form data
const initialRegistrationData = {
    username: '',
    email: '',
    password: '',
    bio: '',
    interests: [], // State for interests
    profileImage: null,
    profileImagePreview: null,
};

// --- Email Verification Component (Unchanged) ---
const EmailVerificationPage = ({ onNavigate, registeredEmail, capturedOTP }) => {
    const [formData, setFormData] = useState({ 
        email: registeredEmail || '', 
        otp: '' 
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    const [copied, setCopied] = useState(false);

    const showToast = (message, severity) => setToast({ open: true, message, severity });
    const handleToastClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setToast(prev => ({ ...prev, open: false }));
    };

    // Warn if user somehow landed here without a valid email/otp
    useEffect(() => {
        if (!registeredEmail || !capturedOTP) {
            showToast("Verification link expired or registration incomplete. Please register again.", "error");
        }
    }, [registeredEmail, capturedOTP, onNavigate]);


    const handleCopy = () => {
        const tempElement = document.createElement('textarea');
        tempElement.value = capturedOTP;
        document.body.appendChild(tempElement);
        tempElement.select();
        try {
            const success = document.execCommand('copy');
            if (success) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                showToast("OTP copied to clipboard!", "info");
            } else {
                throw new Error("Copy command failed.");
            }
        } catch (err) {
            console.error('Could not copy text: ', err);
            showToast("Failed to copy OTP. Please type it manually.", "warning");
        } finally {
            document.body.removeChild(tempElement);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validate = () => {
        let tempErrors = {};
        let isValid = true;

        if (!formData.email || !EMAIL_REGEX.test(formData.email)) {
            tempErrors.email = 'Valid email is required.';
            isValid = false;
        }
        if (!formData.otp || formData.otp.length !== 6 || isNaN(formData.otp)) {
            tempErrors.otp = 'OTP must be a 6-digit number.';
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) {
            showToast("Please check the fields and try again.", "error");
            return;
        }
        
        if (!capturedOTP) {
            showToast("OTP missing from registration context. Cannot verify.", "error");
            return;
        }

        setLoading(true);

        let success = false;
        let finalMessage = "Verification failed due to an unknown error.";

        try {
            const response = await fetch(VERIFY_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp: formData.otp }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                success = true;
                finalMessage = "Email verified successfully! Redirecting to login...";
            } else {
                finalMessage = result.message || `Verification failed: ${response.statusText}`;
            }

        } catch (error) {
            finalMessage = `Network error: Could not connect to the server at ${VERIFY_API_URL}.`;
            console.error("Verification Network Error:", error);
        } finally {
            setLoading(false);
            showToast(finalMessage, success ? "success" : "error");

            if (success) {
                setTimeout(() => {
                    onNavigate('login');
                }, 2000);
            }
        }
    };

   return (
    <Container component="main" maxWidth="sm" sx={{ py: { xs: 4, md: 6 }, minHeight: "85vh", display: "flex", alignItems: "center" }}>
        <Paper elevation={6} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, width: "100%" }}>
            <Box textAlign="center" mb={4}>
                <VpnKey color="primary" sx={{ fontSize: 50 }} />
                <Typography variant="h5" fontWeight={700} mt={1}>
                    Verify Your Email
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                    Enter the 6-digit OTP provided after registration.
                </Typography>
            </Box>
            
            {/* OTP Display Box - Only shows the OTP received from the registration response */}
            {/* {capturedOTP && (
                <Box 
                    sx={{ 
                        p: 2, 
                        mb: 3, 
                        border: '1px dashed', 
                        borderColor: 'primary.main', 
                        borderRadius: 2, 
                        bgcolor: 'primary.light', 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexDirection: { xs: 'column', sm: 'row' }
                    }}
                >
                    <Typography variant="h6" component="span" fontWeight="bold" color="primary.dark" sx={{mb: {xs: 1, sm: 0}}}>
                        OTP: {capturedOTP}
                    </Typography>
                    <Button 
                        onClick={handleCopy} 
                        startIcon={<ContentCopy />} 
                        size="small"
                        variant="contained"
                        color={copied ? 'success' : 'primary'}
                    >
                        {copied ? 'Copied!' : 'Copy OTP'}
                    </Button>
                </Box>
            )} */}
            {/* End OTP Display Box */}


            <Box component="form" onSubmit={handleSubmit} noValidate>
                {/* EMAIL */}
                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        required
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                        disabled={loading || registeredEmail}
                        InputProps={{
                            startAdornment: (<InputAdornment position="start"><Email /></InputAdornment>),
                        }}
                    />
                </Box>

                {/* OTP Input */}
                <Box sx={{ mb: 2}}>
                    <TextField
                        fullWidth
                        required
                        label="Verification Code (OTP)"
                        name="otp"
                        type="text"
                        inputProps={{ maxLength: 6 }}
                        value={formData.otp}
                        onChange={handleChange}
                        error={!!errors.otp}
                        helperText={errors.otp || "Paste the 6-digit code here."}
                        disabled={loading}
                        InputProps={{
                            startAdornment: (<InputAdornment position="start"><Lock /></InputAdornment>),
                        }}
                    />
                </Box>

                {/* SUBMIT */}
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 1, py: 1.4, borderRadius: 2, fontWeight: "bold", fontSize: "1rem" }}
                    startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <VpnKey />}
                    disabled={loading || !capturedOTP}
                >
                    {loading ? 'Verifying...' : 'Verify Email'}
                </Button>
            </Box>
        </Paper>

        {/* TOAST / SNACKBAR COMPONENT */}
        <Snackbar open={toast.open} autoHideDuration={6000} onClose={handleToastClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
            <Alert onClose={handleToastClose} severity={toast.severity} sx={{ width: '100%' }} variant="filled">
                {toast.message}
            </Alert>
        </Snackbar>
    </Container>
);
};


// --- Registration Component (Modified) ---
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const RegistrationPage = ({ onNavigate, onRegistrationSuccess }) => {
    const [formData, setFormData] = useState(initialRegistrationData);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

    const showToast = (message, severity) => setToast({ open: true, message, severity });
    const handleToastClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setToast(prev => ({ ...prev, open: false }));
    };

    // Enhanced handler to remove a chip from the interests array
    const handleDeleteInterest = (chipToDelete) => (event) => {
        // Prevent the event from bubbling up to the Select component
        event.stopPropagation();
        
        setFormData((prev) => ({
            ...prev,
            interests: prev.interests.filter((interest) => interest !== chipToDelete),
        }));
    };

    const validateField = useCallback((name, value) => {
        let error = null;
        switch (name) {
            case 'username':
                if (!value) error = "Username is required.";
                else if (value.length < 3 || value.length > 20) error = "Username must be between 3 and 20 characters.";
                else if (!USERNAME_REGEX.test(value)) error = "Username can only contain letters, numbers, periods (.), and underscores (_).";
                break;
            case 'email':
                if (!value) error = "Email address is required.";
                else if (!EMAIL_REGEX.test(value)) error = "Please enter a valid email address.";
                break;
            case 'password':
                if (!value) error = "Password is required.";
                else if (value.length < 8) error = "Password must be at least 8 characters long.";
                else if (!PASSWORD_REGEX.test(value)) error = "Must include 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&).";
                break;
            case 'bio':
                if (value.length > MAX_BIO_LENGTH) error = `Bio cannot exceed ${MAX_BIO_LENGTH} characters.`;
                break;
            default: break;
        }
        setErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };
    
    const handleBlur = (e) => validateField(e.target.name, e.target.value);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        let tempErrors = { ...errors, profileImage: null };
        setFormData(prev => ({ ...prev, profileImage: null, profileImagePreview: null }));

        if (file) {
            if (file.size > MAX_IMAGE_SIZE_BYTES) {
                tempErrors.profileImage = `Image size must be less than ${MAX_IMAGE_SIZE_MB}MB.`;
            } else {
                const acceptedTypes = ['image/jpeg', 'image/png'];
                if (!acceptedTypes.includes(file.type)) {
                    tempErrors.profileImage = `Only JPEG and PNG images are accepted.`;
                } else {
                    const previewURL = URL.createObjectURL(file);
                    setFormData(prev => ({ ...prev, profileImage: file, profileImagePreview: previewURL }));
                }
            }
        } 
        setErrors(tempErrors);
    };

    const validate = () => {
        const fieldsToValidate = ['username', 'email', 'password', 'bio'];
        let isValid = true;
        fieldsToValidate.forEach(field => {
            if (!validateField(field, formData[field])) isValid = false;
        });
        if (errors.profileImage) isValid = false;
        return isValid;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) {
            showToast("Please fix the validation errors before submitting.", "error");
            return;
        }

        setLoading(true);
        
        const data = new FormData();
        data.append('username', formData.username);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('bio', formData.bio);
        
        if (formData.profileImage) {
            data.append('profileImage', formData.profileImage); 
        }

        // INTERESTS HANDLING: Append each selected interest individually
        formData.interests.forEach(interest => {
            data.append('interests[]', interest);
        });

        let success = false;
        let finalMessage = "Registration failed due to an unknown error.";
        let navigateToVerification = false;

        try {
            const response = await fetch(REGISTER_API_URL, {
                method: 'POST',
                body: data, 
            });

            const result = await response.json();

            if (response.ok && result.success) {
                
                const receivedOtp = result.user?.otp; 
                
                if (receivedOtp) {
                    onRegistrationSuccess(formData.email, receivedOtp);
                    finalMessage = `Registration successful! Your verification code is: ${receivedOtp}. You are being redirected to verification.`;
                    success = true;
                    navigateToVerification = true;
                } else {
                    finalMessage = "Registration successful, but OTP was not received. Please check backend logs or try verification later.";
                    success = true;
                }

            } else {
                finalMessage = result.message || `Registration failed: ${response.statusText}`;
            }

        } catch (error) {
            finalMessage = `Network error: Could not connect to the server at ${REGISTER_API_URL}.`;
            console.error("Registration Network Error:", error);
        } finally {
            setLoading(false);
            showToast(finalMessage, success ? "success" : "error");

            if (navigateToVerification) {
                // Clear fields
                setFormData(initialRegistrationData);
                setErrors({});

                setTimeout(() => {
                    onNavigate('verify-email');
                }, 4000); 
            }
        }
    };

    return (
        <Container component="main" maxWidth="sm" sx={{ py: { xs: 4, md: 6 }, minHeight: "85vh", display: "flex", alignItems: "center" }}>
            <Paper elevation={6} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, width: "100%" }}>
                <Box textAlign="center" mb={3}>
                    <Forum color="primary" sx={{ fontSize: 50 }} />
                    <Typography variant="h5" fontWeight={700} mt={1}>Create Your Discussify Account</Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>Join the conversation and connect with communities.</Typography>
                </Box>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={3} sx={{display:"flex" , flexDirection:"column"}} >
                        {/* Profile Image Upload */}
                        <Grid item xs={12} display="flex" justifyContent="center">
                            <Box sx={{ position: "relative", width: 110, height: 110 }}>
                                <Avatar
                                    src={formData.profileImagePreview}
                                    sx={{ width: { xs: 95, sm: 110 }, height: { xs: 95, sm: 110 }, border: "4px solid", borderColor: errors.profileImage ? "error.main" : "primary.light", mx: "auto", }}
                                >
                                    {!formData.profileImagePreview && (<AccountCircle sx={{ fontSize: { xs: 60, sm: 75 }, color: "text.disabled", }}/>)}
                                </Avatar>
                                <input accept="image/jpeg,image/png" id="profile-image-upload" type="file" style={{ display: "none" }} onChange={handleImageChange} disabled={loading}/>
                                <label htmlFor="profile-image-upload">
                                    <IconButton component="span" disabled={loading} sx={{ position: "absolute", bottom: 4, right: 4, bgcolor: "primary.main", color: "white", p: 0.7, boxShadow: 2, "&:hover": { bgcolor: "primary.dark", }, opacity: loading ? 0.6 : 1,}}>
                                        <CameraAlt fontSize="small" />
                                    </IconButton>
                                </label>
                            </Box>
                        </Grid>
                        {errors.profileImage && (
                            <Grid item xs={12} display="flex" justifyContent="center">
                                <Typography variant="caption" color="error" textAlign="center">{errors.profileImage}</Typography>
                            </Grid>
                        )}

                        {/* Username Field */}
                        <Grid item xs={12}>
                            <TextField fullWidth required label="Username (3-20 chars)" name="username" 
                            value={formData.username} 
                            onChange={handleChange} 
                            onBlur={handleBlur} 
                            error={!!errors.username} helperText={errors.username || "Required. Only letters, numbers, '.', and '_' allowed."} InputProps={{ startAdornment: (<InputAdornment position="start"><AccountCircle /></InputAdornment>),}} disabled={loading}/>
                        </Grid>

                        {/* Email Field */}
                        <Grid item xs={12}>
                            <TextField fullWidth required 
                            label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} error={!!errors.email} helperText={errors.email || "Required. Must be a valid format (e.g., user@domain.com)."} InputProps={{ startAdornment: (<InputAdornment position="start"><Email /></InputAdornment>),}} disabled={loading}/>
                        </Grid>

                        {/* Password Field */}
                        <Grid item xs={12}>
                            <TextField fullWidth required label="Password (Min 8 characters)" name="password" type="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} error={!!errors.password} helperText={errors.password || "Required. Must be 8+ chars and contain upper, lower, number, and special character."} InputProps={{ startAdornment: (<InputAdornment position="start"><Lock /></InputAdornment>),}} disabled={loading}/>
                        </Grid>
                        
                        {/* Interests Multi-Select Dropdown */}
                        <Grid item xs={12}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="interests-label" error={!!errors.interests}>Select Your Interests</InputLabel>
                                <Select
                                    labelId="interests-label"
                                    id="interests-select"
                                    multiple
                                    name="interests"
                                    value={formData.interests}
                                    onChange={handleChange}
                                    input={<OutlinedInput id="select-multiple-chip" label="Select Your Interests" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip 
                                                    key={value} 
                                                    label={value} 
                                                    size="small"
                                                    onDelete={handleDeleteInterest(value)}
                                                    onMouseDown={(event) => {
                                                        event.stopPropagation();
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                    MenuProps={MenuProps}
                                    startAdornment={<InputAdornment position="start"><Favorite color="primary" /></InputAdornment>}
                                    disabled={loading}
                                >
                                    {COMMUNITY_CATEGORIES.map((category) => (
                                        <MenuItem
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.interests && <Typography variant="caption" color="error">{errors.interests}</Typography>}
                            </FormControl>
                        </Grid>
                        
                        {/* Bio Field */}
                        <Grid item xs={12}>
                            <TextField fullWidth label="Tell Us About Yourself (Bio)" name="bio" multiline rows={3} value={formData.bio} onChange={handleChange} onBlur={handleBlur} error={!!errors.bio} helperText={errors.bio || `Optional. Max length ${MAX_BIO_LENGTH} characters. Current: ${formData.bio.length}`} InputProps={{ startAdornment: (<InputAdornment position="start" sx={{ mt: "12px", alignSelf: "flex-start",}}><Description /></InputAdornment>),}} disabled={loading}/>
                        </Grid>

                    </Grid>
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 4, py: 1.4, borderRadius: 2, fontWeight: "bold", fontSize: "1rem",}} startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <CloudUpload />} disabled={loading}>{loading ? 'Registering...' : 'Register Account'}</Button>
                    <Box textAlign="center" mt={2}>
                        <Typography variant="body2" color="text.secondary">
                            Already have an account?
                            <Link onClick={() => onNavigate('login')} sx={{ ml: 0.5, p: 0, textDecoration: "none", cursor: "pointer", textTransform: "none", fontWeight: 600 }}>Log In</Link>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
            <Snackbar open={toast.open} autoHideDuration={6000} onClose={handleToastClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={handleToastClose} severity={toast.severity} sx={{ width: '100%' }} variant="filled">{toast.message}</Alert>
            </Snackbar>
        </Container>
    );
};

// --- Main App Component for Routing (Unchanged) ---
const RegistrationComponent = () => {
    const [currentPage, setCurrentPage] = useState('register');
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [capturedOTP, setCapturedOTP] = useState(''); 
    const navigate = useNavigate();

    const handleNavigation = (page) => {
        setCurrentPage(page);
    };

    const handleRegistrationSuccess = (email, otp) => {
        setRegisteredEmail(email);
        setCapturedOTP(otp);
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'register':
                return <RegistrationPage 
                    onNavigate={handleNavigation} 
                    onRegistrationSuccess={handleRegistrationSuccess}
                />;
            case 'verify-email':
                return <EmailVerificationPage 
                    onNavigate={handleNavigation} 
                    registeredEmail={registeredEmail}
                    capturedOTP={capturedOTP}
                />;
            case 'login':
                navigate('/login');
                return null;
            default:
                return <RegistrationPage onNavigate={handleNavigation} onRegistrationSuccess={handleRegistrationSuccess} />;
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {renderPage()}
        </ThemeProvider>
    );
};

export default RegistrationComponent;