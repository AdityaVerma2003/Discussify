// src/pages/CommunityPage.jsx (REWRITTEN)

import React, { useState, useEffect, useRef } from "react";
import {
  AppBar, Toolbar, IconButton, Typography, Box,
  InputBase, Paper, Avatar, Chip, Button,
  Stack, Tooltip, CircularProgress, Alert
} from '@mui/material';

import {
  ArrowBack as ArrowBackIcon, Send as SendIcon,
  AttachFile as AttachFileIcon, Group as GroupIcon, Close as CloseIcon
} from '@mui/icons-material';

import io from 'socket.io-client'; // Import Socket.io client
import PostItem from "./DiscussionsPage.jsx"; 
import { getCommunityPostsAPI, createPostAPI } from '../services/api.js'; // Import new APIs

// You MUST set this environment variable in your .env file
const SOCKET_SERVER_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1'; 

// Initialize socket outside the component (or use a dedicated hook)
const socket = io(SOCKET_SERVER_URL, {
    // Add auth token if needed, usually done in the initial handshake or middleware
});


const CommunityPage = ({ community, userId, goBack, userAvatar, showSnackbar }) => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const communityId = community._id;

  // --- Initial Data Fetch ---
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await getCommunityPostsAPI(communityId);
        setPosts(response.posts.reverse()); // Reverse to show newest at bottom
      } catch (error) {
        console.error("Error fetching posts:", error);
        showSnackbar('Failed to load community posts.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [communityId, showSnackbar]);

  // --- Socket.io Handlers ---
  useEffect(() => {
    // Join the room upon component mount
    socket.emit('joinCommunity', communityId); 

    // Listen for new posts emitted from the backend
    socket.on('newPost', (post) => {
      setPosts(prev => [...prev, post]);
      scrollToBottom();
    });

    // Listen for post updates (e.g., likes/votes)
    socket.on('postUpdated', (updatedPost) => {
        setPosts(prev => 
            prev.map(p => (p._id === updatedPost._id ? updatedPost : p))
        );
    });

    // Cleanup on unmount
    return () => {
      socket.emit('leaveCommunity', communityId);
      socket.off('newPost');
      socket.off('postUpdated');
    };
  }, [communityId]);

  // --- Scrolling and UI updates ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [posts]);

  // --- File Handling ---
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  // --- Post Submission ---
  const handlePostSubmit = async () => {
    if (!newPostContent.trim() && !attachedFile) return;

    setIsSending(true);
    const formData = new FormData();

    try {
        // Append core data
        formData.append('content', newPostContent.trim());
        formData.append('communityId', communityId);
        formData.append('title', newPostContent.trim().substring(0, 50)); // Simple title from content

        // Append file if exists. The backend expects 'file' as the field name.
        if (attachedFile) {
            formData.append('file', attachedFile);
        }

        // The backend API handles saving and emitting the socket event.
        await createPostAPI(formData); 
        
        // Reset inputs
        setNewPostContent('');
        setAttachedFile(null);
        
    } catch (err) {
        console.error('Error creating post:', err);
        showSnackbar(err.response?.data?.message || 'Failed to create post.', 'error');
    } finally {
        setIsSending(false);
    }
  };

  // Handler to update a single post, used by PostItem after liking
  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => 
        prev.map(p => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f4f7f9' }}>
      
      {/* Community Header */}
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar sx={{ minHeight: 64 }}>
          <IconButton edge="start" color="inherit" onClick={goBack}>
            <ArrowBackIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: community.color || '#2563eb', width: 40, height: 40, mr: 1.5, fontSize: 18 }}>
            {community.name.charAt(0)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div" sx={{ lineHeight: 1.2 }}>{community.name}</Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
                <GroupIcon fontSize="small" sx={{ color: 'white', opacity: 0.8 }} />
                <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                    {community.memberCount || community.members} members
                </Typography>
            </Stack>
          </Box>
          <Chip
            label={community.role || 'Member'}
            size="small"
            sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 600 }}
          />
        </Toolbar>
      </AppBar>
      
      {/* Content/Posts Area */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 1, md: 3 }, pt: 1, position: 'relative' }}>
        {isLoading ? (
            <Stack justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
            </Stack>
        ) : posts.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No posts yet. Be the first to start the discussion!
          </Alert>
        ) : (
          posts.map(post => (
            <PostItem 
                key={post._id} 
                post={post} 
                community={community} 
                currentUserId={userId} 
                onPostUpdate={handlePostUpdate} // Pass handler for local updates
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Composer */}
      <Paper elevation={6} sx={{ p: 2, display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
        
        {/* File Attachment Chip */}
        {attachedFile && (
          <Stack direction="row" spacing={1} alignItems="center" mb={1} sx={{ p: 0.5, bgcolor: '#e0f7fa', borderRadius: 1 }}>
            <Chip
              label={attachedFile.name}
              onDelete={() => setAttachedFile(null)}
              color="primary"
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Tooltip title="Clear File">
                <IconButton size="small" onClick={() => setAttachedFile(null)}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Tooltip>
          </Stack>
        )}

        <Stack direction="row" alignItems="flex-end" gap={1}>
          {/* File Attachment Button */}
          <input
            accept="image/*" // Restrict to image types as per your multer config
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            disabled={isSending}
          />
          <label htmlFor="file-upload">
            <Tooltip title="Attach Image">
              <IconButton component="span" color="primary" disabled={isSending}>
                <AttachFileIcon />
              </IconButton>
            </Tooltip>
          </label>
          
          {/* Message/Post Input */}
          <InputBase
            placeholder="Send a message or start a discussion..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isSending) {
                e.preventDefault();
                handlePostSubmit();
              }
            }}
            sx={{ flexGrow: 1, bgcolor: '#f1f5f9', p: 1, px: 2, borderRadius: 3, minHeight: 40 }}
            multiline
            maxRows={4}
            disabled={isSending}
          />
          
          {/* Send Button */}
          <IconButton
            color="primary"
            onClick={handlePostSubmit}
            disabled={isSending || (!newPostContent.trim() && !attachedFile)}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              width: 44, 
              height: 44,
              '&:hover': { bgcolor: 'primary.dark' },
              '&.Mui-disabled': { bgcolor: 'grey.300', color: 'grey.500' }
            }}
          >
            {isSending ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
          </IconButton>
        </Stack>
      </Paper>
    </Box>
  );
};


export default CommunityPage;