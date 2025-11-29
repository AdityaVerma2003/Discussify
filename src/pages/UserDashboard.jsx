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
  // updateUserInterests, // Assuming this is part of updateUserProfile now
  getMyCommunities,
  getPopularCommunities,
  getRecommendedCommunities,
  createCommunity as createCommunityAPI,
  joinCommunity as joinCommunityAPI,
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
  markAllNotificationsAsRead,
  // searchUserCommunities, // Assuming search is handled client-side for now
  // *** NEW IMPORT: API function from previous steps ***
  inviteMember as inviteMemberAPI,
  clearAllNotifications,
} from '../services/api.js';

import CommunityPage from '../pages/CommunityPage.jsx';

// Main Dashboard Component
export default function UserDashboard() {
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

  const handleDeleteCategory = (chipToDelete) => {
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
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  // Error state - but don't block the whole UI
  if (error && !profileData) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3 }}>
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
    return <CommunityPage community={selectedCommunity} userId={profileData?._id || profileData?.id} goBack={goBackToDashboard} />;
  }

  // Dashboard view
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Header (App Bar) - Remains the same */}
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar sx={{ maxWidth: 1200, mx: 'auto', width: '100%', px: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            <GroupIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" component="div">Community Dashboard</Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={() => setNotificationDrawer(true)} color="inherit">
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton onClick={() => setSettingsDrawer(true)} color="inherit">
              <SettingsIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 0 } }}>
          {/* Welcome */}
          <Paper sx={{ px: 3, py: 3, mb: 4 }}>
            <Box sx={{ display: "flex" }}>
              <Avatar
                src={profileData?.profileImage}
                sx={{
                  bgcolor: '#1e40af',
                  width: 80,
                  height: 80,
                  mx: 4,
                  mb: 2,
                  fontSize: 32
                }}
              >
                {!profileData?.profileImage && (profileData?.username?.charAt(0) || 'U')}
              </Avatar>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
                  Welcome back, {profileData?.username}!
                </Typography>
                <Typography color="text.secondary">Manage your communities and discover new ones</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Tabs - Remains the same */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
            <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} variant="scrollable" scrollButtons="auto">
              {tabs.map((t, i) => {
                const Icon = t.icon;
                return (
                  <Tab
                    key={i}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Icon fontSize="small" />
                        <Typography variant="body2">{t.name}</Typography>
                      </Box>
                    }
                    sx={{ textTransform: 'none', py: 2, px: 4, fontWeight: 600 }}
                  />
                );
              })}
            </Tabs>
          </Box>

          {/* Tab 0: My Communities - With Invite Button */}
          {currentTab === 0 && (
            <Box>
              <Box mb={4}>
                <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', borderRadius: 2, border: '1px solid', borderColor: 'grey.300', px: 1, py: 0.5 }}>
                  <SearchIcon sx={{ ml: 1, color: 'text.disabled' }} />
                  <InputBase
                    placeholder="Search my communities..."
                    value={searchQuery}
                    fullWidth
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    sx={{ ml: 1, flex: 1, px: 1 }}
                  />
                </Paper>
              </Box>

              <Grid container spacing={3}>
                {filteredMyCommunities.length === 0 ? (
                  <Grid item xs={12}>
                    <Typography align="center" color="text.secondary">
                      You haven't joined any communities yet. Explore popular or recommended communities!
                    </Typography>
                  </Grid>
                ) : (
                  filteredMyCommunities.map((community) => {
                    const isNew = new Date() - new Date(community.createdAt) < 7 * 24 * 60 * 60 * 1000;
                    return (
                      <Grid item key={community._id || community.id} xs={12} md={6} lg={4}>
                        <Card variant="outlined" sx={{ borderRadius: 2, '&:hover': { boxShadow: 4 } }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                              <Avatar
                                src={community.coverImage ? community.coverImage : null}
                                sx={{ bgcolor: '#2563eb', width: 56, height: 56, fontSize: 20, fontWeight: 700 }}>
                                {!community.coverImage && (community.name?.charAt(0) || 'U')}
                              </Avatar>
                              {isNew && <Chip label="New" size="small" color="success" />}
                            </Box>
                            <Typography variant="h6" fontWeight={700} gutterBottom>{community.name}</Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                              {community.memberCount || community.members?.length || 0} members
                            </Typography>
                            <Stack direction="row" spacing={1} mb={2}>
                              <Chip label={community.categories?.[0] || community.category || 'General'} variant="outlined" size="small" />
                              <Chip
                                label={community.role || 'Member'}
                                size="small"
                                color={community.role === 'admin' ? 'secondary' : (community.role === 'moderator' ? 'warning' : 'success')}
                              />
                            </Stack>
                            <Stack direction="column" spacing={1}>
                              <Button fullWidth variant="contained" onClick={() => handleViewCommunity(community)} sx={{ fontWeight: 600 }}>
                                <Visibility sx={{ mr: 1 }} />View Community
                              </Button>
                              {/* Only show invite button if the user is an admin or moderator */}
                              {true && (
                                <Button
                                  fullWidth
                                  variant="outlined"
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

          {/* Tab 1: Popular - Remains the same */}
          {currentTab === 1 && (
            <Box>
              {loadingTab ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {popularCommunities.length === 0 ? (
                    <Grid item xs={12}>
                      <Typography align="center" color="text.secondary">No popular communities found</Typography>
                    </Grid>
                  ) : (
                    popularCommunities.map((community) => {
                      return (
                        <Grid item key={community._id} xs={12} md={6} lg={4}>
                          <Card variant="outlined" sx={{ borderRadius: 2, '&:hover': { boxShadow: 4 } }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Avatar
                                  src={community.coverImage ? community.coverImage : null}
                                  sx={{ bgcolor: '#ef4444', width: 56, height: 56, fontSize: 20, fontWeight: 700 }}>
                                  {!community.coverImage && (community.name?.charAt(0) || 'U')}
                                </Avatar>
                                <Chip icon={<TrendingUpIcon fontSize="small" />} label="Trending" size="small" color="error" />
                              </Box>
                              <Typography variant="h6" fontWeight={700} gutterBottom>{community.name}</Typography>
                              <Typography variant="body2" color="text.secondary" mb={1}>
                                {community.memberCount || 0} members
                              </Typography>
                              <Typography variant="body2" color="text.secondary" mb={2} noWrap>
                                {community.description}
                              </Typography>
                              <Box mb={2}>
                                <Chip label={community.categories?.[0] || 'General'} size="small" variant="outlined" />
                              </Box>
                              <Button fullWidth variant="outlined" onClick={() => handleJoinCommunity(community)} sx={{ fontWeight: 600 }}>
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

          {/* Tab 2: Recommended - Remains the same */}
          {currentTab === 2 && (
            <Box>
              {loadingTab ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: 'primary.lighter', borderColor: 'primary.light' }}>
                    <Typography variant="body2" color="primary.main">
                      <strong>Based on your interests:</strong> {profileData?.interests?.join(', ') || 'Update your interests to get recommendations'}
                    </Typography>
                  </Paper>
                  <Grid container spacing={3}>
                    {recommendedCommunities.length === 0 ? (
                      <Grid item xs={12}>
                        <Typography align="center" color="text.secondary">
                          No recommendations available. Update your interests in settings!
                        </Typography>
                      </Grid>
                    ) : (
                      recommendedCommunities.map((community) => (
                        <Grid item key={community._id} xs={12} md={6} lg={4}>
                          <Card variant="outlined" sx={{ borderRadius: 2, '&:hover': { boxShadow: 4 } }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Avatar sx={{ bgcolor: '#0ea5e9', width: 56, height: 56, fontSize: 20, fontWeight: 700 }}>
                                  {community.name.charAt(0)}
                                </Avatar>
                                <Chip icon={<CheckIcon fontSize="small" />} label="Match" size="small" color="success" />
                              </Box>
                              <Typography variant="h6" fontWeight={700} gutterBottom>{community.name}</Typography>
                              <Typography variant="body2" color="text.secondary" mb={1}>
                                {community.memberCount || 0} members
                              </Typography>
                              <Typography variant="body2" color="text.secondary" mb={2} noWrap>
                                {community.description}
                              </Typography>
                              <Chip label={community.categories?.[0] || 'General'} size="small" variant="outlined" sx={{ mb: 2 }} />
                              <Button fullWidth variant="outlined" onClick={() => handleJoinCommunity(community)} sx={{ fontWeight: 600 }}>
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

          {/* Tab 3: Create Community - Updated Handler */}
          {currentTab === 3 && (
            <Box sx={{ maxWidth: 600, mx: 'auto', p: { xs: 0, md: 3 } }}>
              <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight={700} color="primary.main" mb={2} textAlign="center">
                  Start a New Community
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={4} textAlign="center">
                  Fill in the details below to launch your community!
                </Typography>

                <Box display="flex" justifyContent="center" mb={4}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="cover-image-upload"
                    type="file"
                    onChange={handleCoverImageChange}
                  />
                  <label htmlFor="cover-image-upload">
                    <Tooltip title="Upload Cover Image">
                      <IconButton component="span" disableRipple sx={{ p: 0 }}>
                        <Avatar
                          src={newCommunityData.coverImage}
                          sx={{
                            bgcolor: '#f1f5f9',
                            width: 120,
                            height: 120,
                            border: '4px dashed #94a3b8',
                            fontSize: 24,
                          }}
                        >
                          {newCommunityData.coverImage ? '' : <PhotoCameraIcon color="action" />}
                        </Avatar>
                      </IconButton>
                    </Tooltip>
                  </label>
                </Box>

                <Stack spacing={3}>
                  <TextField
                    label="Community Name"
                    variant="outlined"
                    fullWidth
                    required
                    value={newCommunityData.name}
                    onChange={(e) => setNewCommunityData(p => ({ ...p, name: e.target.value }))}
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

                  {/* Categories Multi-Select */}
                  <FormControl fullWidth required>
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
                              onDelete={(event) => {
                                event.stopPropagation(); // Stop event from bubbling to the Select
                                handleDeleteCategory(value); // Call the simple function to update state
                              }}
                              onClick={(event) => event.stopPropagation()} // Prevent select menu from opening on chip click
                            />
                          ))}
                        </Box>
                      )}
                      MenuProps={MenuProps}
                    >
                      {AVAILABLE_INTERESTS.map((interest) => (
                        <MenuItem key={interest} value={interest}>
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
                    sx={{ py: 1.5, fontWeight: 700 }}
                  >
                    {creatingCommunity ? 'Creating...' : 'Create Community'}
                  </Button>
                </Stack>
              </Paper>
            </Box>
          )}


        </Container>
      </Container>

      <Dialog
        open={inviteMemberDialog}
        onClose={() => setInviteMemberDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Invite Member to {communityToInvite?.name}
          <IconButton
            onClick={() => setInviteMemberDialog(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" gutterBottom>
            Enter the email address of the user you want to invite.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteMemberDialog(false)} disabled={sendingInvite}>
            Cancel
          </Button>
          <Button
            onClick={handleSendInvite}
            color="primary"
            variant="contained"
            disabled={sendingInvite || !inviteEmail}
            startIcon={sendingInvite && <CircularProgress size={20} color="inherit" />}
          >
            {sendingInvite ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>




      {/* Notification Drawer (Beautified) */}
      <Drawer
        anchor="right"
        open={notificationDrawer}
        onClose={() => setNotificationDrawer(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 450 }, bgcolor: '#f8fafc' } }} // Lighter background
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight={700}>
              Notifications
              <Badge badgeContent={unreadCount} color="error" sx={{ ml: 1 }}>
                <NotificationsIcon />
              </Badge>
            </Typography>
            <IconButton onClick={() => setNotificationDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {unreadCount > 0 && (
            <Button
              fullWidth
              variant="text"
              color="primary"
              onClick={handleMarkAllAsRead}
              startIcon={<CheckIcon />}
              sx={{ mb: 2 }}
            >
              Mark all {unreadCount} as read
            </Button>
          )}

          <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
            {notifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', mt: 4, py: 4, bgcolor: 'white', borderRadius: 2 }}>
                <Lightbulb color="action" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  You are all caught up!
                </Typography>
              </Box>
            ) : (
              notifications.map((notif) => {
                const isInvite = notif.type === 'COMMUNITY_INVITE';
                const IconComponent = isInvite ? Share : GroupIcon; // Use Share for invite
                const bgColor = notif.read ? 'white' : '#e0f2fe'; // Light blue for unread

                return (
                  <Paper
                    key={notif._id}
                    elevation={0}
                    sx={{
                      mb: 1.5,
                      p: 2,
                      bgcolor: bgColor,
                      borderRadius: 2,
                      borderLeft: notif.read ? 'none' : '4px solid #0288d1', // Highlight unread
                      cursor: notif.read ? 'default' : 'pointer',
                      '&:hover': {
                        bgcolor: notif.read ? '#f5f5f5' : '#b3e5fc'
                      }
                    }}
                    onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                  >
                    <ListItem disablePadding sx={{ alignItems: 'flex-start' }}>
                      <ListItemAvatar sx={{ minWidth: 40, mt: 0 }}>
                        <Avatar sx={{ bgcolor: isInvite ? 'secondary.main' : 'primary.main', width: 32, height: 32 }}>
                          <IconComponent fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2" fontWeight={700}>
                              {notif.title}
                            </Typography>
                            {!notif.read && (
                              <Badge variant="dot" color="error" />
                            )}
                          </Stack>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                              sx={{ display: 'block', mt: 0.5 }}
                            >
                              {notif.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              {new Date(notif.createdAt).toLocaleString()}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>

                    {/* Invitation Action Buttons */}
                    {isInvite && !notif.read && (
                      <Stack direction="row" spacing={1} justifyContent="flex-end" mt={1.5} pr={1}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckIcon />}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent ListItem click
                            handleAcceptInvite(notif._id, notif.data.communityId);
                          }}
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<CloseIcon />}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent ListItem click
                            handleDeclineInvite(notif._id);
                          }}
                        >
                          Decline
                        </Button>
                      </Stack>
                    )}
                  </Paper>
                );
              })
            )}
          </List>
        </Box>
      </Drawer>

      {/* Settings Drawer */}
      <Drawer anchor="right" open={settingsDrawer} onClose={() => setSettingsDrawer(false)} PaperProps={{ sx: { width: 384 } }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Settings</Typography>
            <IconButton onClick={() => setSettingsDrawer(false)}><CloseIcon /></IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ textAlign: 'center', mb: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Avatar
              src={profileData?.profileImage}
              sx={{
                bgcolor: '#1e40af',
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                fontSize: 32
              }}
            >
              {!profileData?.profileImage && (profileData?.name?.charAt(0) || 'U')}
            </Avatar>
            <Typography variant="h6">{profileData?.username || 'User'}</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {profileData?.email || ''}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => {
                setEditData({ ...profileData });
                setEditProfileDialog(true);
                setSettingsDrawer(false);
              }}
              sx={{ textTransform: 'none' }}
            >
              Edit Profile
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: "600", display: "flex" }} gutterBottom>
                Bio  <Lightbulb sx={{ color: "yellow", pl: 1 }} />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profileData?.bio || 'No bio yet'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: "600", display: "flex" }} gutterBottom>
                Interests <Interests sx={{ color: "red", pl: 1 }} /></Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {profileData?.interests?.length > 0 ? (
                  profileData.interests.map((interest, idx) => (
                    <Chip key={idx} label={interest} size="small" sx={{ bgcolor: 'primary.lighter', color: 'primary.main' }} />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No interests added</Typography>
                )}
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: "600", display: "flex" }} gutterBottom>
                Statistics <QueryStats sx={{ color: "blue", pl: 1 }} /> </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Communities</Typography>
                <Typography variant="body2" fontWeight={700}>{myCommunities.length}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Member Since</Typography>
                <Typography variant="body2" fontWeight={700}>
                  {profileData?.createdAt ? new Date(profileData.createdAt).toDateString() : 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Verified</Typography>
                <Typography variant="body2" fontWeight={700}>
                  {profileData?.isEmailVerified === true ? 'Yes' : 'No'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Last Login</Typography>
                <Typography variant="body2" fontWeight={700}>
                  {profileData?.lastLogin ? new Date(profileData.lastLogin).toLocaleTimeString() : 'N/A'}
                </Typography>
              </Box>
              {/* Action: Logout */}

              <Button
                type="submit"
                fullWidth
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
                variant="contained"
                sx={{ mt: 2, mb: 2, py: 1.5, borderRadius: 2, fontWeight: 700, bgcolor: 'red' }}
                startIcon={<Logout />}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileDialog} onClose={() => setEditProfileDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>

            {/* Profile Image Upload Section */}
            <Box display="flex" flexDirection="column" alignItems="center">
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-image-upload"
                type="file"
                onChange={handleProfileImageChange}
              />
              <label htmlFor="profile-image-upload">
                <Tooltip title="Upload Profile Picture">
                  <IconButton component="span" disableRipple sx={{ p: 0 }}>
                    <Avatar
                      src={editData.profileImage || profileData?.profileImage}
                      alt="Profile"
                      sx={{
                        width: 100,
                        height: 100,
                        bgcolor: '#1e40af',
                        border: '4px solid',
                        borderColor: 'primary.main',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        fontSize: 40,
                        '&:hover': {
                          transform: 'scale(1.05)',
                          opacity: 0.9
                        }
                      }}
                    >
                      {!editData.profileImage && !profileData?.profileImage && (
                        editData.username?.charAt(0) || 'U'
                      )}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              </label>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Click to upload profile picture
              </Typography>
            </Box>

            {/* Name Field */}
            <TextField
              label="Name"
              value={editData.username || ''}
              onChange={(e) => setEditData({ ...editData, username: e.target.value })}
              fullWidth
              required
            />

            {/* Email Field (Disabled) */}
            <TextField
              label="Email"
              value={editData.email || ''}
              disabled
              fullWidth
              helperText="Email cannot be changed"
            />

            {/* Bio Field */}
            <TextField
              label="Bio"
              value={editData.bio || ''}
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              multiline
              rows={3}
              fullWidth
              placeholder="Tell us about yourself..."
            />

            {/* Interests Selection */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 1.5, fontWeight: 600 }}>
                Select Your Interests
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {AVAILABLE_INTERESTS.map((interest) => {
                  const isSelected = editData.interests?.includes(interest);
                  return (
                    <Chip
                      key={interest}
                      label={interest}
                      onClick={() => toggleInterest(interest)}
                      color={isSelected ? 'primary' : 'default'}
                      variant={isSelected ? 'filled' : 'outlined'}
                      icon={isSelected ? <CheckIcon /> : undefined}
                      sx={{
                        fontWeight: isSelected ? 600 : 400,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                        },
                      }}
                    />
                  );
                })}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {editData.interests?.length || 0} interest(s) selected
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditProfileDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            disabled={!editData.username || editData.interests?.length === 0}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}
