
// src/pages/CommunityPage.jsx (MO
import React, { useState, useEffect, useRef } from "react";
import {
  AppBar, Toolbar, IconButton, Typography, Box,
  InputBase, Paper, Avatar, Chip, Button,
  Stack, Tooltip, CircularProgress, Alert, Fade, Slide, Snackbar
} from '@mui/material';

import {
  ArrowBack as ArrowBackIcon, Send as SendIcon,
  AttachFile as AttachFileIcon, Group as GroupIcon, 
  Close as CloseIcon, Image as ImageIcon
} from '@mui/icons-material';

import io from 'socket.io-client';
import PostItem from "./DiscussionsPage.jsx"; 
import { getCommunityPostsAPI, createPostAPI } from '../services/api.js';

const SOCKET_SERVER_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1'; 

const socket = io(SOCKET_SERVER_URL, {});

const CommunityPage = ({ community, userId, goBack, userAvatar, showSnackbar }) => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const messagesEndRef = useRef(null);
  const communityId = community._id;
    const handleShowSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Initial Data Fetch
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await getCommunityPostsAPI(communityId);
        setPosts(response.posts.reverse());
      } catch (error) {
        console.error("Error fetching posts:", error);
        handleShowSnackbar('Failed to load community posts.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [communityId]);

  // Socket.io Handlers
  useEffect(() => {
    socket.emit('joinCommunity', communityId); 

    socket.on('newPost', (post) => {
      setPosts(prev => [...prev, post]);
      scrollToBottom();
    });

    socket.on('postUpdated', (updatedPost) => {
        setPosts(prev => 
            prev.map(p => (p._id === updatedPost._id ? updatedPost : p))
        );
    });

    return () => {
      socket.emit('leaveCommunity', communityId);
      socket.off('newPost');
      socket.off('postUpdated');
    };
  }, [communityId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [posts]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    const maxFiles = 5; // Maximum 5 files
    
    if (files.length === 0) return;

    // Check if total files exceed limit
    if (attachedFiles.length + files.length > maxFiles) {
      handleShowSnackbar(`You can only attach up to ${maxFiles} images at a time.`, 'error');
      event.target.value = '';
      return;
    }

    const validFiles = [];
    const invalidFiles = [];

    files.forEach(file => {
      if (file.size > maxSize) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        invalidFiles.push(`${file.name} (${fileSizeMB}MB)`);
      } else {
        // Create preview URL for the file
        const fileWithPreview = {
          file: file,
          preview: URL.createObjectURL(file),
          name: file.name
        };
        validFiles.push(fileWithPreview);
      }
    });

    if (invalidFiles.length > 0) {
      handleShowSnackbar(
        `${invalidFiles.length} file(s) exceed 5MB limit: ${invalidFiles.join(', ')}`,
        'error'
      );
    }

    if (validFiles.length > 0) {
      setAttachedFiles(prev => [...prev, ...validFiles]);
      handleShowSnackbar(
        `${validFiles.length} image(s) attached successfully!`,
        'success'
      );
    }

    // Clear input to allow selecting the same file again
    event.target.value = '';
  };

  const handleRemoveFile = (index) => {
    setAttachedFiles(prev => {
      const newFiles = [...prev];
      // Revoke the preview URL to free memory
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
    handleShowSnackbar('Image removed', 'info');
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      attachedFiles.forEach(fileObj => {
        URL.revokeObjectURL(fileObj.preview);
      });
    };
  }, [attachedFiles]);

  const handlePostSubmit = async () => {
    if (!newPostContent.trim() && attachedFiles.length === 0) return;

    setIsSending(true);
    const formData = new FormData();

    try {
        formData.append('content', newPostContent.trim());
        formData.append('communityId', communityId);
        formData.append('title', newPostContent.trim().substring(0, 50));

        // Append all files
        attachedFiles.forEach((fileObj) => {
            formData.append('file', fileObj.file);
        });

        const response = await createPostAPI(formData);
        setPosts(prev => [...prev, response.post]);
        
        // Cleanup
        attachedFiles.forEach(fileObj => {
          URL.revokeObjectURL(fileObj.preview);
        });
        
        setNewPostContent('');
        setAttachedFiles([]);
        
    } catch (err) {
        console.error('Error creating post:', err);
        handleShowSnackbar(err.response?.data?.message || 'Failed to create post.', 'error');
    } finally {
        setIsSending(false);
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => 
        prev.map(p => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e3a8a 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15), transparent 50%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.15), transparent 50%)',
          pointerEvents: 'none'
        }
      }}
    >
      
      {/* Modern Glassmorphic Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
        }}
      >
        <Toolbar sx={{ minHeight: 72, px: { xs: 2, md: 3 } }}>
          <IconButton 
            edge="start" 
            onClick={goBack}
            sx={{
              color: 'white',
              mr: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateX(-4px)',
                bgcolor: 'rgba(59, 130, 246, 0.2)'
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Avatar 
            sx={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              width: 48, 
              height: 48, 
              mr: 2, 
              fontSize: 20,
              fontWeight: 700,
              border: '3px solid rgba(59, 130, 246, 0.4)',
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.4)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1) rotate(5deg)'
              }
            }}
          >
            {community.name.charAt(0)}
          </Avatar>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                lineHeight: 1.2, 
                color: 'white',
                fontWeight: 700,
                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}
            >
              {community.name}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                <GroupIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.9)' }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 500
                  }}
                >
                    {community.memberCount || community.members} members
                </Typography>
            </Stack>
          </Box>
          
          <Chip
            label={community.role || 'Member'}
            size="medium"
            sx={{ 
              bgcolor: '#3b82f6', 
              color: 'white', 
              fontWeight: 700,
              px: 1.5,
              fontSize: '0.875rem',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.6)',
                bgcolor: '#2563eb'
              }
            }}
          />
        </Toolbar>
      </AppBar>
      
      {/* Content/Posts Area with Modern Styling */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          p: { xs: 2, md: 3 }, 
          pt: 3,
          position: 'relative',
          zIndex: 1,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '10px',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.4)'
            }
          }
        }}
      >
        {isLoading ? (
            <Stack justifyContent="center" alignItems="center" height="100%">
                <CircularProgress 
                  size={50} 
                  sx={{ 
                    color: 'white',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                  }} 
                />
                <Typography 
                  sx={{ 
                    mt: 2, 
                    color: 'white', 
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  Loading conversations...
                </Typography>
            </Stack>
        ) : posts.length === 0 ? (
          <Fade in timeout={500}>
            <Paper
              elevation={0}
              sx={{ 
                mt: 4,
                p: 4,
                textAlign: 'center',
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: 4,
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}
            >
              <Typography variant="h6" sx={{ color: '#3b82f6', fontWeight: 700, mb: 1 }}>
                🚀 Start the Conversation
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Be the first to share your thoughts with the community!
              </Typography>
            </Paper>
          </Fade>
        ) : (
          posts.map((post, index) => (
            <Slide 
              key={post._id} 
              direction="up" 
              in 
              timeout={300 + (index * 50)}
              mountOnEnter 
              unmountOnExit
            >
              <div>
                <PostItem 
                    post={post} 
                    community={community} 
                    currentUserId={userId} 
                    onPostUpdate={handlePostUpdate} 
                    showSnackbar={handleShowSnackbar}
                />
              </div>
            </Slide>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Modern Glassmorphic Input Composer */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2.5,
          display: 'flex', 
          flexDirection: 'column',
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(59, 130, 246, 0.2)',
          boxShadow: '0 -8px 32px 0 rgba(0, 0, 0, 0.3)',
          position: 'relative',
          zIndex: 2
        }}
      >
        
        {/* File Attachment Previews with Animation */}
        {attachedFiles.length > 0 && (
          <Fade in timeout={300}>
            <Box sx={{ mb: 1.5 }}>
              <Stack 
                direction="row" 
                spacing={1.5} 
                sx={{ 
                  flexWrap: 'wrap',
                  gap: 1.5
                }}
              >
                {attachedFiles.map((fileObj, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'relative',
                      width: 100,
                      height: 100,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '2px solid rgba(59, 130, 246, 0.3)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        border: '2px solid rgba(59, 130, 246, 0.6)',
                        transform: 'scale(1.05)',
                        '& .remove-button': {
                          opacity: 1
                        }
                      }
                    }}
                  >
                    <img
                      src={fileObj.preview}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <IconButton
                      className="remove-button"
                      onClick={() => handleRemoveFile(index)}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        background: 'rgba(220, 38, 38, 0.9)',
                        color: 'white',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        '&:hover': {
                          background: 'rgba(185, 28, 28, 1)',
                        }
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        fontSize: 10,
                        px: 0.5,
                        py: 0.25,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {fileObj.name}
                    </Box>
                  </Box>
                ))}
                {attachedFiles.length < 5 && (
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: 2,
                      border: '2px dashed rgba(59, 130, 246, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        border: '2px dashed rgba(59, 130, 246, 0.7)',
                        background: 'rgba(59, 130, 246, 0.05)'
                      }
                    }}
                    onClick={() => document.getElementById('file-upload').click()}
                  >
                    <Stack alignItems="center" spacing={0.5}>
                      <ImageIcon sx={{ color: '#3b82f6', fontSize: 30 }} />
                      <Typography variant="caption" sx={{ color: '#3b82f6', fontSize: 9 }}>
                        Add More
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </Stack>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(148, 163, 184, 0.7)',
                  display: 'block',
                  mt: 1
                }}
              >
                {attachedFiles.length} of 5 images selected
              </Typography>
            </Box>
          </Fade>
        )}

        <Stack direction="row" alignItems="flex-end" gap={1.5}>
          {/* File Attachment Button */}
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileChange}
            disabled={isSending}
          />
          <label htmlFor="file-upload">
            <Tooltip title="Attach Images (Max 5)" placement="top" arrow>
              <IconButton 
                component="span" 
                disabled={isSending || attachedFiles.length >= 5}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  width: 48,
                  height: 48,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(37, 99, 235, 0.5)'
                  },
                  '&.Mui-disabled': {
                    background: 'rgba(71, 85, 105, 0.5)',
                    color: 'rgba(148, 163, 184, 0.5)'
                  }
                }}
              >
                <AttachFileIcon />
              </IconButton>
            </Tooltip>
          </label>
          
          {/* Message Input with Modern Styling */}
          <InputBase
            placeholder="Share your thoughts with the community..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isSending) {
                e.preventDefault();
                handlePostSubmit();
              }
            }}
            sx={{ 
              flexGrow: 1,
              bgcolor: 'rgba(15, 23, 42, 0.6)',
              color: 'white',
              p: 1.5,
              px: 2.5,
              borderRadius: 3,
              minHeight: 48,
              fontSize: '0.95rem',
              border: '2px solid rgba(59, 130, 246, 0.2)',
              transition: 'all 0.3s ease',
              '& input::placeholder': {
                color: 'rgba(148, 163, 184, 0.7)'
              },
              '&:focus-within': {
                bgcolor: 'rgba(30, 41, 59, 0.8)',
                border: '2px solid #3b82f6',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
              }
            }}
            multiline
            maxRows={4}
            disabled={isSending}
          />
          
          {/* Send Button with Gradient */}
          <Tooltip title="Send Message" placement="top" arrow>
            <span>
              <IconButton
                onClick={handlePostSubmit}
                disabled={isSending || (!newPostContent.trim() && attachedFiles.length === 0)}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  width: 52, 
                  height: 52,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    transform: 'scale(1.05) rotate(5deg)',
                    boxShadow: '0 6px 20px rgba(37, 99, 235, 0.5)'
                  },
                  '&.Mui-disabled': { 
                    background: 'rgba(71, 85, 105, 0.5)', 
                    color: 'rgba(148, 163, 184, 0.5)'
                  }
                }}
              >
                {isSending ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  <SendIcon />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Paper>
    </Box>
  );
};

export default CommunityPage;