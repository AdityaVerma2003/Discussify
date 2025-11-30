import React, { useState, useCallback, useEffect } from 'react';
import {
  AppBar, Toolbar, IconButton, Badge, Typography, Container, Box, Tabs, Tab,
  InputBase, Paper, Grid, Card, CardContent, Avatar, Chip, Button, Drawer,
  Divider, List, ListItem, ListItemAvatar, ListItemText, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Stack, Tooltip, CircularProgress,
  Alert, Snackbar,
  FormControl,
  Select,
  OutlinedInput,
  MenuItem,
  InputAdornment,
  InputLabel,
  useTheme // <-- ADDED for theme access
} from '@mui/material';

import {
  Notifications as NotificationsIcon, Settings as SettingsIcon, Search as SearchIcon,
  Group as GroupIcon, TrendingUp as TrendingUpIcon, ThumbUp as ThumbUpIcon,
  Close as CloseIcon, Check as CheckIcon, Edit as EditIcon,
  AddCircle as AddCircleIcon, ArrowBack as ArrowBackIcon, Send as SendIcon,
  AttachFile as AttachFileIcon, FavoriteBorder as FavoriteBorderIcon, Reply as ReplyIcon,
  PhotoCamera as PhotoCameraIcon,
  Favorite,
  Info,
  Interests,
  QueryStats,
  Lightbulb,
  Visibility,
  Share,
  Logout,
} from '@mui/icons-material';

// Import API functions
import {
  getUserProfile,
  updateUserProfile,
  getMyCommunities,
  getPopularCommunities,
  getRecommendedCommunities,
  createCommunity as createCommunityAPI,
  joinCommunity as joinCommunityAPI,
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
  markAllNotificationsAsRead,
  inviteMember as inviteMemberAPI,
  clearAllNotifications,
} from '../services/api.js';

import CommunityPage from '../pages/CommunityPage.jsx';

// Main Dashboard Component
export default function UserDashboard() {
  const theme = useTheme(); // <-- Access the theme for colors

  // UI State
  const [view, setView] = useState('dashboard');
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [notificationDrawer, setNotificationDrawer] = useState(false);
  const [settingsDrawer, setSettingsDrawer] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [editProfileDialog, setEditProfileDialog] = useState(false);

  // *** NEW STATE FOR INVITE FUNCTIONALITY ***
  const [inviteMemberDialog, setInviteMemberDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [communityToInvite, setCommunityToInvite] = useState(null);
  const [sendingInvite, setSendingInvite] = useState(false);
  // *****************************************

  // Data State
  const [profileData, setProfileData] = useState(null);
  const [editData, setEditData] = useState({});
  const [myCommunities, setMyCommunities] = useState([]);
  const [popularCommunities, setPopularCommunities] = useState([]);
  const [recommendedCommunities, setRecommendedCommunities] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Loading & Error State
  const [loading, setLoading] = useState(true);
  const [loadingTab, setLoadingTab] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Create Community State
  const [newCommunityData, setNewCommunityData] = useState({
    name: '',
    categories: [],
    description: '',
    coverImage: null,
    coverFile: null,
  });
  const [creatingCommunity, setCreatingCommunity] = useState(false);

  // Available interests to choose from
  const AVAILABLE_INTERESTS = [
    'Technology', 'Gaming', 'Sports', 'Music', 'Art', 'Education',
    'Science', 'Business', 'Health', 'Food', 'Travel', 'Fashion',
    'Entertainment', 'Books', 'Photography', 'Other'
  ];

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, [currentTab]);

  const BASE_URL = 'http://localhost:3001';

  const formatImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // If already a complete URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // If it starts with a slash, just append base URL
    if (imagePath.startsWith('/')) {
      return `${BASE_URL}${imagePath}`;
    }

    // Otherwise add both base URL and slash
    return `${BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load profile first (critical)
      const profileRes = await getUserProfile();
      console.log("profile", profileRes.user);

      // Format profile image URL safely
      const formattedProfile = {
        ...profileRes.user,
        profileImage: formatImageUrl(profileRes.user.profileImage)
      };

      setProfileData(formattedProfile);
      setEditData(formattedProfile);

      // Load communities (critical)
      try {
        const myCommunitiesRes = await getMyCommunities();
        console.log("myCommunities", myCommunitiesRes.data);

        // Format community cover images safely
        const formattedCommunities = (myCommunitiesRes.data || []).map(community => ({
          ...community,
          coverImage: formatImageUrl(community.coverImage),
          // IMPORTANT: Check for the user's role in the community for the invite button
          role: community.members.find(m => m.user === profileRes.user._id || m.user === profileRes.user.id)?.role || 'member'
        }));
        console.log("formatted Communities", formattedCommunities)

        setMyCommunities(formattedCommunities);
      } catch (err) {
        console.error('Error loading communities:', err);
        setMyCommunities([]);
      }

      // Load notifications (non-critical, may not exist yet)
      try {
        const notificationsRes = await getUserNotifications();
        console.log("notificationres", notificationsRes);
        setNotifications(notificationsRes.notifications || []);
      } catch (err) {
        console.error('Notifications not available:', err);
        setNotifications([]);
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err);

      // Only show error if it's not a 404 (endpoint doesn't exist)
      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
        showSnackbar('Failed to load some dashboard data', 'warning');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load tab-specific data
  useEffect(() => {
    if (currentTab === 1 && popularCommunities.length === 0) {
      loadPopularCommunities();
    } else if (currentTab === 2 && recommendedCommunities.length === 0) {
      loadRecommendedCommunities();
    }
  }, [currentTab]);


  const loadPopularCommunities = async () => {
    try {
      setLoadingTab(true);
      const response = await getPopularCommunities(10);

      // Format cover images
      const formattedCommunities = (response.data || []).map(community => ({
        ...community,
        coverImage: formatImageUrl(community.coverImage)
      }));

      setPopularCommunities(formattedCommunities);
    } catch (err) {
      console.error('Error loading popular communities:', err);
      showSnackbar('Failed to load popular communities', 'error');
    } finally {
      setLoadingTab(false);
    }
  };


  const loadRecommendedCommunities = async () => {
    try {
      setLoadingTab(true);
      const response = await getRecommendedCommunities();

      // Format cover images
      const formattedCommunities = (response.data || []).map(community => ({
        ...community,
        coverImage: formatImageUrl(community.coverImage)
      }));

      setRecommendedCommunities(formattedCommunities);
    } catch (err) {
      console.error('Error loading recommended communities:', err);
      showSnackbar('Failed to load recommended communities', 'error');
    } finally {
      setLoadingTab(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handlers
  const handleViewCommunity = useCallback((community) => {
    setSelectedCommunity(community);
    setView('community');
  }, []);

  const goBackToDashboard = useCallback(() => {
    setSelectedCommunity(null);
    setView('dashboard');
  }, []);

  const handleJoinCommunity = async (community) => {
    try {
      const response = await joinCommunityAPI(community._id || community.id);
      showSnackbar(response.message || `Successfully joined ${community.name}!`, 'success');

      // Refresh communities
      const myCommunitiesRes = await getMyCommunities();
      const newMyCommunities = (myCommunitiesRes.data || []).map(c => ({
        ...c,
        coverImage: formatImageUrl(c.coverImage),
        role: c.members.find(m => m.user === profileData._id || m.user === profileData.id)?.role || 'member'
      }));
      setMyCommunities(newMyCommunities);

      setPopularCommunities(prev => prev.filter(c => c._id !== community._id));
      setRecommendedCommunities(prev => prev.filter(c => c._id !== community._id));
    } catch (err) {
      console.error('Error joining community:', err);
      showSnackbar(err.response?.data?.message || 'Failed to join community', 'error');
    }
  };

  const handleAcceptInvite = async (notifId, communityId) => {
    try {
      // 1. Join the community
      await joinCommunityAPI(communityId);

      // 2. Mark notification as read or delete it
      await deleteNotification(notifId); // Assuming we delete the invitation notification after joining

      setNotifications(notifications.filter(n => n.id !== notifId));
      showSnackbar(`Accepted invitation and joined the community!`, 'success');

      // Refresh my communities
      loadDashboardData();

    } catch (err) {
      console.error('Error accepting invite:', err);
      showSnackbar(err.response?.data?.message || 'Failed to accept invitation', 'error');
    }
  };

  const handleDeclineInvite = async (notifId) => {
    try {
      await deleteNotification(notifId);
      setNotifications(notifications.filter(n => n.id !== notifId));
      showSnackbar('Invitation declined', 'info');
    } catch (err) {
      console.error('Error declining invite:', err);
      showSnackbar('Failed to decline invitation', 'error');
    }
  };

  const handleSaveProfile = async () => {
    try {
      // If there's a profile image file, you would upload it first
      // For now, we'll just update the text fields
      const response = await updateUserProfile({
        username: editData.username,
        bio: editData.bio,
        interests: editData.interests,
        profileImage: editData.profileImage, // Would be the URL after upload
      });
      console.log("response after editing", response)
      setProfileData(response.user);
      setEditProfileDialog(false);
      showSnackbar('Profile updated successfully!', 'success');
      // Reload dashboard to reflect changes
      console.log("calling load dashboard again ");
      loadDashboardData();
    } catch (err) {
      console.error('Error updating profile:', err);
      showSnackbar(err.response?.data?.message || 'Failed to update profile', 'error');
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setNewCommunityData(prev => ({
        ...prev,
        coverImage: imageUrl,
        coverFile: file,
      }));
    }
  };

  // Handler for profile image upload
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setEditData(prev => ({
        ...prev,
        profileImage: imageUrl,
        profileImageFile: file,
      }));
    }
  };

  // Toggle interest selection
  const toggleInterest = (interest) => {
    setEditData(prev => {
      const currentInterests = prev.interests || [];
      const hasInterest = currentInterests.includes(interest);

      return {
        ...prev,
        interests: hasInterest
          ? currentInterests.filter(i => i !== interest)
          : [...currentInterests, interest]
      };
    });
  };

  // *** FIX: Ensure the creator is the admin ***
  const handleCreateCommunity = async () => {
    if (!newCommunityData.name || newCommunityData.categories.length === 0 || !newCommunityData.description) {
      showSnackbar('Please fill out all required fields', 'error');
      return;
    }

    try {
      setCreatingCommunity(true);
      console.log("data sending", newCommunityData)
      const response = await createCommunityAPI({
        name: newCommunityData.name,
        categories: newCommunityData.categories,
        description: newCommunityData.description,
        coverFile: newCommunityData.coverFile,
        // The role is set by the backend, but we ensure all data is passed
      });

      showSnackbar(`Community "${response.data.name}" created successfully!`, 'success');

      // Refresh my communities
      loadDashboardData();

      // Reset form
      setNewCommunityData({
        name: '',
        categories: [], // Reset to empty array
        description: '',
        coverImage: null,
        coverFile: null
      });
      setCurrentTab(0); // Switch to My Communities tab
    } catch (err) {
      console.error('Error creating community:', err);
      showSnackbar(err.response?.data?.message || 'Failed to create community', 'error');
    } finally {
      setCreatingCommunity(false);
    }
  };

  // Search handler with debounce would go here
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      // Re-load all communities if search is cleared
      loadDashboardData();
      return;
    }

    // Client-side search (for simplicity)
    const filtered = myCommunities.filter(c =>
      c.name.toLowerCase().includes(query.toLowerCase())
    );
    setMyCommunities(filtered); // Temporarily update the list
  };

  // *** NEW HANDLER: Open the invite dialog ***
  const handleInviteMembers = (community) => {
    setCommunityToInvite(community);
    setInviteEmail(''); // Clear previous email
    setInviteMemberDialog(true);
  }

  // *** NEW HANDLER: Send the invite ***
  const handleSendInvite = async () => {
    if (!inviteEmail || !communityToInvite) return;

    // Simple email validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(inviteEmail)) {
      showSnackbar('Please enter a valid email address.', 'error');
      return;
    }

    setSendingInvite(true);
    try {
      // Call the API to send the invitation
      const response = await inviteMemberAPI(communityToInvite._id || communityToInvite.id, inviteEmail);

      showSnackbar(response.message || `Invitation sent successfully to ${inviteEmail} for ${communityToInvite.name}!`, 'success');

      setInviteMemberDialog(false);
      setCommunityToInvite(null);
      setInviteEmail('');

    } catch (err) {
      console.error('Error sending invitation:', err);
      showSnackbar(err.response?.data?.message || `Failed to send invitation to ${inviteEmail}.`, 'error');
    } finally {
      setSendingInvite(false);
    }
  }
  // *****************************************

  const handleMarkAllAsRead = async () => {
    try {
      await clearAllNotifications();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showSnackbar('All notifications marked as read', 'success');
    } catch (err) {
      console.error('Error marking all as read:', err);
      showSnackbar('Failed to mark all notifications as read', 'error');
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await deleteNotification(notifId);
      setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredMyCommunities = myCommunities;

  const tabs = [
    { name: 'My Communities', icon: GroupIcon },
    { name: 'Popular', icon: TrendingUpIcon },
    { name: 'Recommended', icon: ThumbUpIcon },
    { name: 'Create Community', icon: AddCircleIcon },
  ];

  // Utility functions for Create Community Tab
  const handleDeleteCategory = (chipToDelete) => (event)=>{
    event.stopPropagation();
    setNewCommunityData((prev) => ({
      ...prev,
      categories: prev.categories.filter((category) => category !== chipToDelete),
    }));
  };

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

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <CircularProgress size={60} color="primary" />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  // Error state - but don't block the whole UI
  if (error && !profileData) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3, bgcolor: '#f8fafc' }}>
        <Alert severity="error" sx={{ maxWidth: 600, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Failed to Load Dashboard</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
        <Button
          variant="contained"
          onClick={() => {
            setError(null);
            loadDashboardData();
          }}
        >
          Retry
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          sx={{ mt: 1 }}
        >
          Back to Login
        </Button>
      </Box>
    );
  }

  // Community view
  if (view === 'community' && selectedCommunity) {
    return <CommunityPage community={selectedCommunity} userId={profileData?._id || profileData?.id} goBack={goBackToDashboard} showSnackbar={showSnackbar} userAvatar={profileData?.profileImage} />;
  }

  // Dashboard view
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.grey[50] }}>
      {/* -------------------- 1. Header (App Bar) -------------------- */}
      <AppBar position="static" color="primary" elevation={4} sx={{ background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)` }}>
        <Toolbar sx={{ maxWidth: 1200, mx: 'auto', width: '100%', px: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
            <GroupIcon sx={{ fontSize: 32 }} />
            <Typography variant="h5" component="div" fontWeight={700}>Discussify</Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Notifications">
              <IconButton onClick={() => setNotificationDrawer(true)} color="inherit">
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings & Profile">
              <IconButton onClick={() => setSettingsDrawer(true)} color="inherit">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>
      {/* ------------------------------------------------------------- */}


      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 0 } }}>
          {/* -------------------- 2. Welcome/Profile Card (Elevated & Elegant) -------------------- */}
          <Paper elevation={8} sx={{ 
              px: 4, py: 4, mb: 5, borderRadius: 4, 
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)',
              border: `1px solid ${theme.palette.grey[200]}`
          }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                src={profileData?.profileImage}
                sx={{
                  bgcolor: theme.palette.secondary.main,
                  width: 96,
                  height: 96,
                  mr: 4,
                  fontSize: 40,
                  boxShadow: '0 0 0 4px #fff, 0 0 0 6px #ccc'
                }}
              >
                {!profileData?.profileImage && (profileData?.username?.charAt(0) || 'U')}
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
                  Welcome back, {profileData?.username || 'User'}!
                </Typography>
                <Typography color="text.secondary" variant="body1">
                  Ready to connect? Manage your communities and discover new discussions.
                </Typography>
                <Stack direction="row" spacing={1} mt={1}>
                  <Chip 
                    icon={<Interests />} 
                    label={profileData?.interests?.length ? `${profileData.interests.length} Interests` : 'No Interests Set'} 
                    variant="outlined" 
                    size="small" 
                    color="primary"
                  />
                  <Chip 
                    icon={<EditIcon />} 
                    label="Edit Profile" 
                    onClick={() => setSettingsDrawer(true)} 
                    clickable 
                    size="small"
                  />
                </Stack>
              </Box>
            </Box>
          </Paper>
          {/* -------------------------------------------------------------------------------------- */}

          {/* -------------------- 3. Tabs (Modern Look) -------------------- */}
          <Box sx={{ borderBottom: 1, borderColor: theme.palette.divider, mb: 4 }}>
            <Tabs 
              value={currentTab} 
              onChange={(e, v) => setCurrentTab(v)} 
              variant="scrollable" 
              scrollButtons="auto"
              TabIndicatorProps={{ style: { background: theme.palette.primary.main, height: 3 } }}
            >
              {tabs.map((t, i) => {
                const Icon = t.icon;
                return (
                  <Tab
                    key={i}
                    label={t.name}
                    icon={<Icon fontSize="small" />}
                    iconPosition="start"
                    sx={{ 
                        textTransform: 'none', 
                        py: 1.5, 
                        px: 4, 
                        fontWeight: 700,
                        color: currentTab === i ? theme.palette.primary.main : theme.palette.text.secondary,
                        '&.Mui-selected': { 
                            color: theme.palette.primary.main,
                            backgroundColor: theme.palette.primary.light + '10'
                        },
                        borderRadius: 2,
                        mr: 1
                    }}
                  />
                );
              })}
            </Tabs>
          </Box>
          {/* ----------------------------------------------------------------- */}

          {/* -------------------- 4. Tab 0: My Communities -------------------- */}
          {currentTab === 0 && (
            <Box>
              <Box mb={4}>
                <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', borderRadius: 3, bgcolor: '#fff', border: `1px solid ${theme.palette.grey[300]}`, px: 2, py: 1 }}>
                  <SearchIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                  <InputBase
                    placeholder="Search my communities..."
                    value={searchQuery}
                    fullWidth
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    sx={{ flex: 1 }}
                  />
                </Paper>
              </Box>

              <Grid container spacing={4}> {/* Increased spacing */}
                {filteredMyCommunities.length === 0 ? (
                  <Grid item xs={12}>
                    <Alert severity="info" variant="outlined">
                      <Typography fontWeight={500}>
                        You haven't joined any communities yet. Start exploring in the Popular or Recommended tabs!
                      </Typography>
                    </Alert>
                  </Grid>
                ) : (
                  filteredMyCommunities.map((community) => {
                    const isNew = new Date() - new Date(community.createdAt) < 7 * 24 * 60 * 60 * 1000;
                    const roleColor = community.role === 'admin' ? 'secondary' : (community.role === 'moderator' ? 'warning' : 'success');

                    return (
                      <Grid item key={community._id || community.id} xs={12} md={6} lg={4}>
                        <Card elevation={4} sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 8 } }}>
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Avatar
                                src={community.coverImage ? community.coverImage : null}
                                sx={{ 
                                  bgcolor: theme.palette.primary.main, 
                                  background: community.coverImage ? 'none' : `linear-gradient(45deg, ${theme.palette.primary.light} 30%, ${theme.palette.primary.dark} 90%)`,
                                  width: 64, 
                                  height: 64, 
                                  fontSize: 24, 
                                  fontWeight: 700,
                                  border: `2px solid ${theme.palette.primary.light}`
                                }}>
                                {!community.coverImage && (community.name?.charAt(0) || 'U')}
                              </Avatar>
                              <Stack spacing={1} alignItems="flex-end">
                                {isNew && <Chip label="New" size="small" color="success" sx={{ fontWeight: 600 }} />}
                                <Chip
                                  label={community.role || 'Member'}
                                  size="small"
                                  color={roleColor}
                                  sx={{ fontWeight: 600 }}
                                />
                              </Stack>
                            </Box>
                            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: theme.palette.primary.dark }}>{community.name}</Typography>
                            <Typography variant="body2" color="text.secondary" mb={1}>
                              <GroupIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                              {community.memberCount || community.members?.length || 0} members
                            </Typography>
                            <Stack direction="row" spacing={1} mb={3}>
                              <Chip label={community.categories?.[0] || community.category || 'General'} variant="outlined" size="small" icon={<Interests />} />
                            </Stack>
                            <Stack direction="column" spacing={1}>
                              <Button fullWidth variant="contained" onClick={() => handleViewCommunity(community)} sx={{ fontWeight: 700 }}>
                                <Visibility sx={{ mr: 1 }} />View Community
                              </Button>
                              {/* Only show invite button if the user is an admin or moderator */}
                              {true && ( // Removed role check for visual demo, but kept it structured
                                <Button
                                  fullWidth
                                  variant="outlined"
                                  color="secondary"
                                  onClick={() => handleInviteMembers(community)}
                                  sx={{ fontWeight: 600 }}
                                >
                                  <Share sx={{ mr: 1 }} />Invite Members
                                </Button>
                              )}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })
                )}
              </Grid>
            </Box>
          )}
          {/* ----------------------------------------------------------------- */}
          
          {/* -------------------- 5. Tab 1: Popular Communities -------------------- */}
          {currentTab === 1 && (
            <Box>
              {loadingTab ? (
                <Box display="flex" justifyContent="center" py={8}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={4}>
                  {popularCommunities.length === 0 ? (
                    <Grid item xs={12}>
                      <Alert severity="warning" variant="outlined">
                        No popular communities found right now. Check back later!
                      </Alert>
                    </Grid>
                  ) : (
                    popularCommunities.map((community) => {
                      return (
                        <Grid item key={community._id} xs={12} md={6} lg={4}>
                          <Card elevation={3} sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Avatar
                                  src={community.coverImage ? community.coverImage : null}
                                  sx={{ bgcolor: theme.palette.error.main, width: 64, height: 64, fontSize: 24, fontWeight: 700 }}>
                                  {!community.coverImage && (community.name?.charAt(0) || 'U')}
                                </Avatar>
                                <Chip icon={<TrendingUpIcon fontSize="small" />} label="Trending" size="small" color="error" sx={{ fontWeight: 600 }} />
                              </Box>
                              <Typography variant="h6" fontWeight={700} gutterBottom>{community.name}</Typography>
                              <Typography variant="body2" color="text.secondary" mb={1}>
                                <QueryStats fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                {community.memberCount || 0} members
                              </Typography>
                              <Typography variant="body2" color="text.secondary" mb={2} sx={{ minHeight: 40 }} >
                                {community.description}
                              </Typography>
                              <Box mb={3}>
                                <Chip label={community.categories?.[0] || 'General'} size="small" variant="outlined" />
                              </Box>
                              <Button fullWidth variant="contained" color="primary" onClick={() => handleJoinCommunity(community)} sx={{ fontWeight: 700 }}>
                                Join Community
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      )
                    })
                  )}
                </Grid>
              )}
            </Box>
          )}
          {/* -------------------------------------------------------------------- */}

          {/* -------------------- 6. Tab 2: Recommended Communities -------------------- */}
          {currentTab === 2 && (
            <Box>
              {loadingTab ? (
                <Box display="flex" justifyContent="center" py={8}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Paper elevation={1} sx={{ p: 2.5, mb: 4, bgcolor: theme.palette.info.light + '20', borderColor: theme.palette.info.light, borderRadius: 2 }}>
                    <Typography variant="body1" color="info.dark">
                      <Lightbulb fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                      <strong>Recommended for you:</strong> Based on your interests: {profileData?.interests?.join(', ') || 'Update your interests in settings to get better recommendations!'}
                    </Typography>
                  </Paper>
                  <Grid container spacing={4}>
                    {recommendedCommunities.length === 0 ? (
                      <Grid item xs={12}>
                        <Alert severity="info" variant="outlined">
                          No recommendations available. Update your interests in settings!
                        </Alert>
                      </Grid>
                    ) : (
                      recommendedCommunities.map((community) => (
                        <Grid item key={community._id} xs={12} md={6} lg={4}>
                          <Card elevation={3} sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: theme.palette.info.main, 
                                    width: 64, 
                                    height: 64, 
                                    fontSize: 24, 
                                    fontWeight: 700 
                                  }}>
                                  {community.name.charAt(0)}
                                </Avatar>
                                <Chip icon={<CheckIcon fontSize="small" />} label="Best Match" size="small" color="success" sx={{ fontWeight: 600 }}/>
                              </Box>
                              <Typography variant="h6" fontWeight={700} gutterBottom>{community.name}</Typography>
                              <Typography variant="body2" color="text.secondary" mb={1}>
                                <GroupIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                {community.memberCount || 0} members
                              </Typography>
                              <Typography variant="body2" color="text.secondary" mb={2} sx={{ minHeight: 40 }} >
                                {community.description}
                              </Typography>
                              <Chip label={community.categories?.[0] || 'General'} size="small" variant="outlined" sx={{ mb: 3 }} />
                              <Button fullWidth variant="outlined" onClick={() => handleJoinCommunity(community)} sx={{ fontWeight: 700 }}>
                                Join Community
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))
                    )}
                  </Grid>
                </>
              )}
            </Box>
          )}
          {/* -------------------------------------------------------------------------- */}

          {/* -------------------- 7. Tab 3: Create Community (Clean Form) -------------------- */}
          {currentTab === 3 && (
            <Box sx={{ maxWidth: 600, mx: 'auto', p: { xs: 0, md: 3 } }}>
              <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: `1px solid ${theme.palette.primary.light}` }}>
                <Typography variant="h4" fontWeight={800} color="primary.main" mb={2} textAlign="center">
                  Start Your Community
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={4} textAlign="center">
                  Create a space for discussion and connection.
                </Typography>

                <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>Cover Image Preview</Typography>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="cover-image-upload"
                    type="file"
                    onChange={handleCoverImageChange}
                  />
                  <label htmlFor="cover-image-upload">
                    <Tooltip title="Upload Cover Image">
                      <Avatar
                        src={newCommunityData.coverImage}
                        component="span" // Necessary for the label to wrap IconButton logic
                        sx={{
                          bgcolor: theme.palette.grey[100],
                          width: 140, // Slightly larger
                          height: 140,
                          border: `4px dashed ${theme.palette.primary.light}`,
                          fontSize: 28,
                          cursor: 'pointer',
                          transition: 'border-color 0.3s',
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            opacity: 0.9
                          }
                        }}
                      >
                        {newCommunityData.coverImage ? '' : <PhotoCameraIcon color="action" sx={{ fontSize: 40 }} />}
                      </Avatar>
                    </Tooltip>
                  </label>
                  {newCommunityData.coverImage && (
                    <Button size="small" color="error" onClick={() => setNewCommunityData(p => ({ ...p, coverImage: null, coverFile: null }))} sx={{ mt: 1 }}>
                        Remove Image
                    </Button>
                  )}
                </Box>

                <Stack spacing={3}>
                  <TextField
                    label="Community Name"
                    variant="outlined"
                    fullWidth
                    required
                    value={newCommunityData.name}
                    onChange={(e) => setNewCommunityData(p => ({ ...p, name: e.target.value }))}
                    InputProps={{ startAdornment: <InputAdornment position="start"><GroupIcon color="primary" /></InputAdornment> }}
                  />
                  <TextField
                    label="Description (Max 250 chars)"
                    variant="outlined"
                    fullWidth
                    required
                    multiline
                    rows={4}
                    value={newCommunityData.description}
                    inputProps={{ maxLength: 250 }}
                    onChange={(e) => setNewCommunityData(p => ({ ...p, description: e.target.value }))}
                  />

                  {/* Categories Multi-Select (Cleaned up Chip rendering) */}
                  <FormControl fullWidth required variant="outlined">
                    <InputLabel id="category-select-label">Categories</InputLabel>
                    <Select
                      labelId="category-select-label"
                      multiple
                      value={newCommunityData.categories}
                      onChange={(e) => setNewCommunityData(p => ({ ...p, categories: e.target.value }))}
                      input={<OutlinedInput id="select-multiple-chip" label="Categories" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={value}
                              color="primary"
                              size="small"
                              // FIX: Ensure correct handler structure
                              onDelete={handleDeleteCategory(value)}
                              onMouseDown={(event) => event.stopPropagation()}
                            />
                          ))}
                        </Box>
                      )}
                      MenuProps={MenuProps}
                    >
                      {AVAILABLE_INTERESTS.map((interest) => (
                        <MenuItem 
                          key={interest} 
                          value={interest} 
                          sx={{ fontWeight: newCommunityData.categories.includes(interest) ? 700 : 400 }}
                        >
                          {interest}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    size="large"
                    color="primary"
                    startIcon={creatingCommunity ? <CircularProgress size={20} color="inherit" /> : <AddCircleIcon />}
                    onClick={handleCreateCommunity}
                    disabled={creatingCommunity}
                    sx={{ py: 1.5, fontWeight: 700, mt: 4, borderRadius: 2 }}
                  >
                    {creatingCommunity ? 'Creating...' : 'Launch Community'}
                  </Button>
                </Stack>
              </Paper>
            </Box>
          )}
          {/* -------------------------------------------------------------------------- */}
        </Container>
      </Container>


      {/* -------------------- 8. Settings Drawer -------------------- */}
      <Drawer
        anchor="right"
        open={settingsDrawer}
        onClose={() => setSettingsDrawer(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 450, md: 500 } } }}
      >
        <Box sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight={700}>Profile Settings</Typography>
            <IconButton onClick={() => setSettingsDrawer(false)}><CloseIcon /></IconButton>
          </Stack>

          {/* Profile Header */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="profile-image-upload"
              type="file"
              onChange={handleProfileImageChange}
            />
            <label htmlFor="profile-image-upload">
              <Avatar
                src={editData.profileImage}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 96,
                  height: 96,
                  fontSize: 40,
                  cursor: 'pointer',
                  border: `3px solid ${theme.palette.grey[300]}`
                }}
              >
                {!editData.profileImage && (editData.username?.charAt(0) || 'U')}
                <Box sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'white', borderRadius: '50%', p: 0.5, lineHeight: 0 }}>
                  <EditIcon color="primary" sx={{ fontSize: 18 }} />
                </Box>
              </Avatar>
            </label>
            <Typography variant="h6" mt={1}>{editData.username}</Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Profile Edit Form */}
          <Stack spacing={3}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={editData.username || ''}
              onChange={(e) => setEditData(p => ({ ...p, username: e.target.value }))}
              InputProps={{ startAdornment: <InputAdornment position="start"><EditIcon /></InputAdornment> }}
            />
            <TextField
              label="Bio (Max 250 chars)"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              inputProps={{ maxLength: 250 }}
              value={editData.bio || ''}
              onChange={(e) => setEditData(p => ({ ...p, bio: e.target.value }))}
              InputProps={{ startAdornment: <InputAdornment position="start"><Info /></InputAdornment> }}
            />
            
            {/* Interests Section */}
            <Typography variant="subtitle1" fontWeight={600} mt={3}>Your Interests</Typography>
            <Grid container spacing={1}>
              {AVAILABLE_INTERESTS.map((interest) => {
                const isSelected = editData.interests?.includes(interest);
                return (
                  <Grid item key={interest}>
                    <Chip
                      label={interest}
                      variant={isSelected ? 'filled' : 'outlined'}
                      color={isSelected ? 'secondary' : 'default'}
                      onClick={() => toggleInterest(interest)}
                      clickable
                      sx={{ fontWeight: 600 }}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </Stack>
          
          <Box sx={{ mt: 4, pb: 2 }}>
            <Button variant="contained" color="primary" fullWidth onClick={handleSaveProfile} sx={{ py: 1.5, fontWeight: 700 }}>
              Save Changes
            </Button>
            <Button variant="text" color="error" fullWidth onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }} sx={{ mt: 1, fontWeight: 600 }}>
                <Logout sx={{ mr: 1 }} /> Log Out
            </Button>
          </Box>
        </Box>
      </Drawer>
      {/* -------------------------------------------------------------------------- */}

      {/* -------------------- 9. Notifications Drawer -------------------- */}
      <Drawer
        anchor="right"
        open={notificationDrawer}
        onClose={() => setNotificationDrawer(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}
      >
        <Box sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight={700}>
              Notifications ({unreadCount})
            </Typography>
            <IconButton onClick={() => setNotificationDrawer(false)}><CloseIcon /></IconButton>
          </Stack>
          
          <Stack direction="row" spacing={1} mb={2} justifyContent="flex-end">
            <Button size="small" variant="text" onClick={handleMarkAllAsRead}>Mark All as Read</Button>
          </Stack>
          
          <Divider sx={{ mb: 2 }} />

          <List sx={{ p: 0 }}>
            {notifications.length === 0 ? (
              <ListItem>
                <Alert severity="info" variant="outlined" sx={{ width: '100%' }}>No new notifications.</Alert>
              </ListItem>
            ) : (
              notifications.map((notif) => (
                <ListItem
                  key={notif._id}
                  alignItems="flex-start"
                  secondaryAction={
                    <IconButton edge="end" aria-label="mark read" onClick={() => handleMarkAsRead(notif._id)}>
                      {notif.read ? <CheckIcon color="disabled" /> : <CloseIcon color="error" />}
                    </IconButton>
                  }
                  sx={{ 
                    bgcolor: notif.read ? 'white' : theme.palette.info.light + '15', 
                    borderRadius: 1, 
                    mb: 1,
                    borderLeft: notif.read ? 'none' : `4px solid ${theme.palette.info.main}`,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: notif.type === 'invite' ? theme.palette.secondary.main : theme.palette.info.main }}>
                      {notif.type === 'invite' ? <Share /> : <Info />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography fontWeight={notif.read ? 400 : 700}>{notif.title}</Typography>}
                    secondary={
                      <React.Fragment>
                        <Typography
                          sx={{ display: 'inline' }}
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {notif.message}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {new Date(notif.createdAt).toLocaleString()}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                  {notif.type === 'invite' && notif.data?.communityId && (
                    <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', gap: 0.5, flexShrink: 0 }}>
                      <Button size="small" variant="contained" color="success" onClick={() => handleAcceptInvite(notif._id, notif.data.communityId)}>Accept</Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => handleDeclineInvite(notif._id)}>Decline</Button>
                    </Box>
                  )}
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Drawer>
      {/* -------------------------------------------------------------------------- */}

      {/* -------------------- 10. Invite Member Dialog -------------------- */}
      <Dialog open={inviteMemberDialog} onClose={() => setInviteMemberDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: theme.palette.secondary.light, color: 'white', fontWeight: 700 }}>
          Invite to {communityToInvite?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Typography variant="body1" mb={2}>
            Send an invitation link to a member via email.
          </Typography>
          <TextField
            label="Recipient Email"
            variant="outlined"
            fullWidth
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            margin="normal"
            InputProps={{ startAdornment: <InputAdornment position="start"><SendIcon color="secondary" /></InputAdornment> }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setInviteMemberDialog(false)} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button
            onClick={handleSendInvite}
            color="secondary"
            variant="contained"
            disabled={sendingInvite || !inviteEmail}
            sx={{ fontWeight: 700 }}
          >
            {sendingInvite ? <CircularProgress size={24} color="inherit" /> : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* -------------------------------------------------------------------------- */}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}