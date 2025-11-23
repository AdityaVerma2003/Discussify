// src/components/DynamicHeadline.jsx
import React, { useState, useEffect } from 'react';
import { Typography, Box, keyframes , Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const dynamicWords = ['CONNECT.', 'COLLABORATE.', 'CULTIVATE.'];
const TYPING_SPEED = 150; // Speed of typing letters
const DELETING_SPEED = 75; // Speed of deleting letters
const PAUSE_DURATION = 1500; // Pause after typing/deleting

// Define the blinking animation keyframes
const blink = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
`;

const HeroSection = () => {
    const navigate = useNavigate();
    const [wordIndex, setWordIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Current word being processed
    const fullText = dynamicWords[wordIndex];

    useEffect(() => {
        let timer;

        if (isDeleting) {
            // --- Deleting Logic ---
            const nextText = fullText.substring(0, displayedText.length - 1);
            timer = setTimeout(() => {
                setDisplayedText(nextText);
            }, DELETING_SPEED);

            // If deletion is complete, switch to typing the next word
            if (displayedText === '') {
                setIsDeleting(false);
                setWordIndex((prevIndex) => (prevIndex + 1) % dynamicWords.length);
            }

        } else {
            // --- Typing Logic ---
            const nextText = fullText.substring(0, displayedText.length + 1);
            timer = setTimeout(() => {
                setDisplayedText(nextText);
            }, TYPING_SPEED);

            // If typing is complete, pause, then switch to deleting
            if (displayedText === fullText) {
                clearTimeout(timer); // Stop the typing speed timer
                timer = setTimeout(() => {
                    setIsDeleting(true);
                }, PAUSE_DURATION); // Pause before starting delete
            }
        }

        return () => clearTimeout(timer); // Cleanup
    }, [displayedText, isDeleting, fullText]);

    return (
        <Box 
            sx={{ 
                textAlign: 'center', 
                py: 10, 
                mb: 8, 
                mt: 12
            }}
        >
            {/* The main dynamic headline */}
            <Typography 
                component="h1" 
                color="text.primary" 
                variant="h1"
                sx={{ 
                    mb: 4, 
                    fontWeight: 800, 
                    fontSize: { xs: '3.5rem', sm: '4.5rem', md: '6rem' }, 
                    lineHeight: 1.1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                {/* Static Text Part */}
                <Box>
                    Join Discussions to 
                </Box>
                
                {/* Dynamic Rotating Word & Cursor */}
                <Box sx={{ display: 'flex', alignItems: 'center', minHeight: { xs: 60, md: 120 } }}> 
                    <Typography 
                        component="span"
                        variant="inherit"
                        sx={{
                            fontWeight: 800,
                            color: 'primary.main', // Highlight the changing word in blue
                            whiteSpace: 'nowrap',
                            minWidth: { xs: 200, md: 350 }, // Ensure space for longest word
                            textAlign: 'right', 
                        }}
                    >
                        {displayedText}
                    </Typography>
                    
                    {/* The Blinking Cursor Element */}
                    <Box
                        sx={{
                            width: 6, // Cursor thickness
                            height: { xs: 40, md: 75 }, // Cursor height matching the text size
                            ml: 1, // Spacing from the word
                            bgcolor: 'text.primary', // Black cursor color
                            animation: `${blink} 1s step-end infinite`, // Apply the blinking animation
                        }}
                    />
                </Box>
            </Typography>

            {/* Subheading (Static and Prominent) */}
            <Typography 
                color="primary.textSecondary" 
                variant="h4" 
                component="p"
                sx={{ 
                    maxWidth: 'md', 
                    mx: 'auto', 
                    mb: 7,
                    mt:7, 
                    fontSize: { xs: '1.5rem', md: '1.8rem' }, 
                    fontWeight: 400, 
                }}
            >
                Exchange resources, deepen knowledge, and build meaningful networks.
            </Typography>
            
            {/* CTA Buttons */}
            <Button variant="contained" size="large" onClick={() => navigate('/register')} sx={{ 
                px: 4, 
                ml: 1, 
                bgcolor: 'blue.700', 
                color: 'white', 
                fontSize: '1.2rem', 
                '&:hover': { bgcolor: 'white' , color: 'primary.main', border: '1px solid blue' } 
              }}>
               Get Started
            </Button>
            
        </Box>
    );
};

export default HeroSection;