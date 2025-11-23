import React from 'react';
import { 
    Container, Box, Typography, Button, Paper 
} from '@mui/material';
import { Forum, SentimentDissatisfied, Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <Container component="main" maxWidth="md" sx={{ py: 8, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper 
                elevation={10} 
                sx={{ 
                    p: { xs: 4, md: 8 }, 
                    borderRadius: 4, 
                    width: '100%',
                    textAlign: 'center',
                    bgcolor: 'white',
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                    {/* Large Icon for the error */}
                    <SentimentDissatisfied 
                        color="error" 
                        sx={{ fontSize: { xs: 80, md: 120 }, mb: 2 }} 
                    />
                    
                    {/* 404 Code */}
                    <Typography 
                        variant="h1" 
                        component="h1" 
                        fontWeight={900} 
                        color="error.main"
                        sx={{ 
                            fontSize: { xs: '6rem', sm: '8rem', md: '10rem' }, 
                            lineHeight: 1 
                        }}
                    >
                        404
                    </Typography>

                    {/* Error Message */}
                    <Typography 
                        variant="h4" 
                        component="h2" 
                        fontWeight={700} 
                        color="text.primary" 
                        mt={2}
                        mb={2}
                    >
                        Page Not Found
                    </Typography>
                    
                    {/* Descriptive Text */}
                    <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}
                    >
                        The URL you tried to access no longer exists or was never here. Let's get you back to the discussion!
                    </Typography>

                    {/* Navigation Button */}
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/')}
                        startIcon={<Home />}
                        sx={{ 
                            mt: 2, 
                            py: 1.5, 
                            px: 4, 
                            borderRadius: 2, 
                            fontWeight: 700 
                        }}
                    >
                        Go to Home
                    </Button>
                </Box>
                
                {/* Footer Branding */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 5, color: 'text.disabled' }}>
                    <Forum sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" component="p">
                        Discussify
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default NotFoundPage;