// src/pages/DiscussifyHome.jsx
import React, { useState } from 'react';
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

import CommunityCard from '../components/CommunityCard'
import FeatureCard from '../components/FeatureCard';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import HowItWorksSection from '../components/HowItWorksSection';
import AppFooter from '../components/AppFooter';
import { useNavigate } from 'react-router-dom';

// Modern Premium UI Theme
const theme = createTheme({
  palette: {
    primary: { main: blue[700] },
    secondary: { main: grey[700] },
    background: {
      default: '#f7f9fc',
      paper: '#ffffff',
    },
    success: { main: green[600] },
    error: { main: red[600] },
    info: { main: deepOrange[500] }
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          paddingLeft: 20,
          paddingRight: 20,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          transition: "0.3s",
        },
      },
    },
  }
});

// Mock Data
const mockCommunities = [
  { id: 1, name: 'Technology', description: 'Discuss the latest developments in technology.', members: 4520, isPrivate: false, tags: ['React', 'Node'], icon: <Lightbulb /> },
  { id: 2, name: 'Health', description: 'Tips and advice on wellness.', members: 1280, isPrivate: false, tags: ['Fitness'], icon: <Lightbulb /> },
  { id: 3, name: 'Travel', description: 'Travel experiences & recommendations.', members: 8900, isPrivate: false, tags: ['Guides'], icon: <Lightbulb /> },
  { id: 4, name: 'Programming', description: 'Talk about coding & software development.', members: 600, isPrivate: false, tags: ['Strategy', 'Code'], icon: <Lightbulb /> },
];

const mockFeatures = [
  { icon: <GroupAdd />, title: 'Create Communities', description: 'Build private or public spaces.', color: 'primary' },
  { icon: <ChatBubble />, title: 'Engage in Discussions', description: 'Join deep, meaningful conversations.', color: 'success' },
  { icon: <Share />, title: 'Share Resources', description: 'Share articles, videos & documents.', color: 'info' },
  { icon: <Gavel />, title: 'Admin Tools', description: 'Manage users & moderate content.', color: 'secondary' },
];

const DiscussifyHome = () => {
  const navigate = useNavigate();
  const [communities , setCommunities] = useState([]);
  // const getPopularCommunities = async()=>{
  //   try {
  //       const resp = await
  //   } catch (error) {
      
  //   }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default' , mt:0}}>
        <Container maxWidth="lg">

          {/* HERO */}
          <HeroSection />

          {/* POPULAR COMMUNITIES */}
          <Box sx={{ py: 8 }}>
            <Typography variant="h3" align="center" sx={{ mb: 6 }}>
              Popular Communities
            </Typography>

            <Box
              sx={{
                display: 'flex',
                overflowX: 'auto',
                gap: 1,
                pb: 1,
                px: 1,
                '&::-webkit-scrollbar': { display: 'none' },
              }}
            >
              {mockCommunities.map((community) => (
                <Box
                  key={community.id}
                  sx={{
                    minWidth: { xs: 260, sm: 300, md: 360 },
                    flexShrink: 0,
                  }}
                >
                  <CommunityCard {...community} />
                </Box>
              ))}
            </Box>
          </Box>

          {/* ABOUT US */}
          <Paper
            elevation={4}
            sx={{
              p: { xs: 4, md: 6 },
              textAlign: 'center',
              background: 'linear-gradient(135deg, #1565c0 0%, #1e88e5 100%)',
              color: 'white',
              my: 6,
              borderRadius: 4
            }}
          >
            <Typography variant="h4" sx={{ mb: 2 }}>
              About Us
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                maxWidth: 900,
                mx: 'auto',
                fontSize: '1.15rem',
                lineHeight: 1.7,
                opacity: 0.95,
              }}
            >
              Discussify is a modern social platform designed to bring people together
              through meaningful discussions. Whether you're exploring tech, health,
              lifestyle, or career topics — Discussify helps you learn and connect with
              like-minded individuals.
            </Typography>
          </Paper>

          {/* FEATURES */}
          <Box sx={{ py: 8 }}>
            <Typography variant="h3" align="center" sx={{ mb: 6 }}>
              Platform Key Features
            </Typography>

            <Grid container spacing={4} alignItems="stretch" sx={{display:"flex", justifyContent:"center" }}>
              {mockFeatures.map((feature, index) => (
                <Grid item xs={12} md={4} key={index} sx={{display:"flex", justifyContent:"center" }} >
                  <FeatureCard {...feature} />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* HOW IT WORKS */}
          <HowItWorksSection />

          {/* CTA */}
          <Paper
            elevation={5}
            sx={{
              p: { xs: 4, md: 6 },
              textAlign: 'center',
              background: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)',
              color: 'white',
              mt: 8,
              borderRadius: 4
            }}
          >
            <Typography variant="h4" sx={{ mb: 2 }}>
              Ready to Join the Conversation?
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 4, opacity: 0.95 }}>
              Create your account and start connecting with professionals today.
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                fontWeight: 700,
                px: 4,
                py: 1.2,
                fontSize: '1.1rem',
                '&:hover': { bgcolor: grey[200] }
              }}
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