// src/pages/DiscussifyHome.jsx
import React from 'react';
import {
  AppBar, Toolbar, Typography, Button, Container, Box, Grid, TextField, InputAdornment,
  ThemeProvider, Paper, Divider, Avatar
} from '@mui/material';
import {
  Search, Forum, PersonAdd, People, Share, ChatBubble, Gavel,
  HowToReg, Lightbulb, TrendingUp, GroupAdd, Schedule, Mail
} from '@mui/icons-material';
import { createTheme } from '@mui/material/styles';
import { blue, grey, green, red, deepOrange } from '@mui/material/colors';

// ASSUMED IMPORTS (ensure these are available)
import CommunityCard from '../components/CommunityCard' // From previous response
import FeatureCard from '../components/FeatureCard'; // New component above
import Navbar from '../components/Navbar'; // Updated Navbar component
import HeroSection from './HeroSection';
import HowItWorksSection from './HowItWorksSection';
import AppFooter from '../components/AppFooter';
import { useNavigate } from 'react-router-dom';

// --- Custom Theme Definition (theme.js content) ---
const theme = createTheme({
  palette: {
    primary: {
      main: blue[700], // #007BFF equivalent
    },
    secondary: {
      main: grey[600],
    },
    background: {
      default: '#ffffffff', // Light grey background
      paper: '#FFFFFF',
    },
    success: { main: green[600] },
    error: { main: red[600] },
    info: { main: deepOrange[500] } // Added for feature colors
  },
  typography: {
    fontFamily: ['Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
    h2: { fontWeight: 700, fontSize: '3rem' },
    h4: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 8 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCard: { defaultProps: { elevation: 1 } }
  }
});
// ---------------------------------------------------


// Mock Data
const mockCommunities = [
  { id: 1, name: 'Technology', description: 'Discuss the latest developments in technology.', members: 4520, isPrivate: false, tags: ['React', 'Node'], icon: <Lightbulb /> },
  { id: 2, name: 'Health', description: 'Share tips and advice on health and wellness.', members: 1280, isPrivate: false, tags: ['Wellness', 'Fitness'], icon: <Lightbulb /> },
  { id: 3, name: 'Travel', description: 'Exchange travel experiences and recommendations.', members: 8900, isPrivate: false, tags: ['Vacation', 'Guides'], icon: <Lightbulb /> },
  { id: 4, name: 'Programming', description: 'Talk about coding, software development.', members: 600, isPrivate: false, tags: ['Strategy', 'Code'], icon: <Lightbulb /> },
];

const mockFeatures = [
  { icon: <GroupAdd />, title: 'Create Communities', description: 'Build private or public spaces around your specific passions and interests.', color: 'primary' },
  { icon: <ChatBubble />, title: 'Engage in Discussions', description: 'Participate in meaningful, structured conversations and debates.', color: 'success' },
  { icon: <Share />, title: 'Share Resources', description: 'Easily share articles, videos, and professional documents with members.', color: 'info' },
  { icon: <Gavel />, title: 'Admin Tools', description: 'Manage users and content within your community with powerful moderation tools.', color: 'secondary' },
];




const DiscussifyHome = () => {
  const navigate = useNavigate();
  return (
    <ThemeProvider theme={theme}>

      {/* 2. Main Content Sections */}
      <Box sx={{ bgcolor: 'background.default', pb: 8 }}>
        <Container maxWidth="lg">
          {/* A. Hero Section */}
          {/* A. Hero Section with Updated Headline and Styling */}
          <HeroSection />



          {/* C. Popular Communities Section */}
          <Box sx={{ py: 6 }}>
            {/* Heading: Big and Centered */}
            <Typography
              variant="h3" // Increased font size to h3 for prominence
              align="center"
              sx={{ mb: 8, fontWeight: 700 }}
            >
              Popular Communities
            </Typography>

            {/* Horizontal Scroll Container */}
            <Box
              sx={{
                display: 'flex',
                overflowX: 'scroll', // Key for horizontal scrolling
                // Hide the default scrollbar for a cleaner look (optional, but professional)
                '&::-webkit-scrollbar': { display: 'none' },
                msOverflowStyle: 'none', // IE and Edge
                scrollbarWidth: 'none', // Firefox
                pb: 2, // Padding at the bottom for scroll space
              }}
            >
              {mockCommunities.map((community) => (
                // Use Box instead of Grid Item for flex layout
                <Box
                  key={community.id}
                  sx={{
                    // Fixed width for each card, ensuring several fit on screen
                    minWidth: { xs: 280, sm: 300, md: 400 },
                    mr: 3, // Spacing between cards
                    flexShrink: 0, // Prevents cards from shrinking when scrolled
                  }}
                >
                  <CommunityCard
                    name={community.name}
                    description={community.description}
                    members={community.members}
                    isPrivate={community.isPrivate}
                    tags={community.tags}
                    icon={community.icon} // Pass the SVG icon
                  />
                </Box>
              ))}
            </Box>
          </Box>

{/* ABOUT US SECTION */}
 <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              bgcolor: 'primary.main',
              color: 'white',
              my: 4
            }}
          >
            <Typography variant="h4" component="p" sx={{ mb: 3 }}>
            About Us
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 4 , fontSize: { xs: '1rem', md: '1.2rem' } , lineHeight: 1.6 , maxWidth: 1000 , mx: 'auto' }}>
              Discussify is a modern community-based social platform designed to bring
              people together through meaningful conversations. Whether you’re exploring
              tech, health, lifestyle, or career topics – Discussify helps you learn,
              share, and connect with like-minded individuals.
            </Typography>
          </Paper>

          {/* B. Features Section */}
          <Box sx={{ py: 6 }}>
            <Typography variant="h4" align="center" sx={{ mb: 5, fontWeight: 700 }}>
              Platform Key Features
            </Typography>
            <Grid container sx={{ alignContent: "center", display: "flex", justifyContent: "center" }} spacing={3}>
              {mockFeatures.map((feature, index) => (
                <Grid item xs={12} sm={6} md={6} key={index}>
                  <FeatureCard {...feature} />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* D. How It Works Section */}
          <HowItWorksSection />

         


          {/* F. Final Call to Action (CTA) */}
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              bgcolor: 'primary.main',
              color: 'white',
              my: 4
            }}
          >
            <Typography variant="h4" component="p" sx={{ mb: 2 }}>
              Ready to Join the Conversation?
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 4 }}>
              Create your account and start connecting with like-minded professionals today.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 600, '&:hover': { bgcolor: grey[100] } }}
            >
              Create Free Account
            </Button>
          </Paper>

        </Container>
      </Box>

    </ThemeProvider>
  );
};

export default DiscussifyHome;