// src/pages/DiscussionsPage.jsx (PostItem component - WITH REPLY FUNCTIONALITY)
import React, { useState } from 'react';
import {
    Card, CardContent, Avatar, Button,
    Divider, Stack, Typography, Box, Link, Tooltip, Chip, IconButton, Zoom, Fade, Dialog,
    TextField, CircularProgress
} from '@mui/material';
import {
    ThumbUp as ThumbUpIcon, ThumbUpOutlined as ThumbUpOutlinedIcon,
    Image as ImageIcon, VideoFile as VideoFileIcon,
    ChatBubbleOutline as ChatBubbleOutlineIcon,
    Check as CheckIcon, DoneAll as DoneAllIcon,
    Close as CloseIcon,
    ZoomIn as ZoomInIcon,
    Send as SendIcon
} from '@mui/icons-material';
import { togglePostVoteAPI, createCommentAPI } from '../services/api.js';

const PostItem = ({ post, community, currentUserId, onPostUpdate, showSnackbar }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [openImageViewer, setOpenImageViewer] = useState(false);
    const [openReplyDialog, setOpenReplyDialog] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    // Check if this message is from the current user
    const isOwnMessage = post.author?._id === currentUserId || post.creatorId === currentUserId;

    // Check if the current user has liked the post
    const hasUpvoted = post.upvotes?.includes(currentUserId);
    const voteCount = post.voteCount || 0;
    const authorName = post.author?.username || post.creatorName || 'Unknown User';
    const authorAvatar = post.author?.profileImage;

    const handleVote = async () => {
        try {
            const response = await togglePostVoteAPI(post._id);
            // This assumes the API returns the entire updated post object, including the new voteCount/upvotes array
            onPostUpdate(response.post);
        } catch (error) {
            console.error('Failed to toggle vote:', error);
            showSnackbar(error.response?.data?.message || 'Failed to toggle vote.', 'error');
        }
    };

    // Format time like WhatsApp (e.g., "10:30 AM")
    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleImageClick = (image) => {
        setSelectedImage(image);
        setOpenImageViewer(true);
    };

    const handleCloseViewer = () => {
        setOpenImageViewer(false);
        setSelectedImage(null);
    };

    const handleOpenReplyDialog = () => {
        setOpenReplyDialog(true);
    };

    const handleCloseReplyDialog = () => {
        setOpenReplyDialog(false);
        setReplyContent('');
    };

    const handleSubmitReply = async () => {
        if (!replyContent.trim()) {
            showSnackbar('Please enter a reply', 'error');
            return;
        }

        setIsSubmittingReply(true);
        try {
            // Note: createCommentAPI should be configured to hit the new POST /api/v1/posts/:postId/comment route
            const response = await createCommentAPI(post._id, { content: replyContent.trim() });
            console.log("response from reply", response);

            // The CommunityPage parent component has a socket listener for 'postUpdated'.
            // The backend (postController) should emit 'postUpdated' after the comment count changes.
            // We'll rely on the socket for the actual count update, but for immediate UI feedback, 
            // we can trigger a manual update:

            const updatedPost = {
                ...post,
                // The comment count is incremented on the backend, this relies on the socket, 
                // but we trigger a full update so the parent can manage the array if needed.
                commentCount: (post.commentCount || 0) + 1
            };
            onPostUpdate(updatedPost);

            showSnackbar('Reply posted successfully!', 'success');
            handleCloseReplyDialog();
        } catch (error) {
            console.error('Failed to post reply:', error);
            showSnackbar(error.response?.data?.message || 'Failed to post reply', 'error');
        } finally {
            setIsSubmittingReply(false);
        }
    };

    // Render multiple images in a beautiful grid layout (KEEPING THIS LOGIC AS IS)
    const renderMedia = () => {
        if (post.type === 'image' && post.images && post.images.length > 0) {
            const imageCount = post.images.length;

            // ... (Your existing renderMedia logic for 1, 2, 3, and 4+ images) ...

            // Single image
            if (imageCount === 1) {
                return (
                    <Box
                        sx={{
                            mt: 1,
                            mb: 0.5,
                            maxWidth: '100%',
                            borderRadius: 2,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                '& .zoom-overlay': {
                                    opacity: 1
                                }
                            }
                        }}
                        onClick={() => handleImageClick(post.images[0])}
                    >
                        <img
                            src={post.images[0]}
                            alt="Post Media"
                            style={{
                                width: '100%',
                                maxHeight: '350px',
                                display: 'block',
                                objectFit: 'cover',
                                borderRadius: '8px'
                            }}
                        />
                        <Box
                            className="zoom-overlay"
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.2s ease',
                                borderRadius: '8px'
                            }}
                        >
                            <ZoomInIcon sx={{ color: 'white', fontSize: 40 }} />
                        </Box>
                    </Box>
                );
            }

            // Two images - side by side
            if (imageCount === 2) {
                return (
                    <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ mt: 1, mb: 0.5 }}
                    >
                        {post.images.map((image, index) => (
                            <Box
                                key={index}
                                sx={{
                                    flex: 1,
                                    height: '200px',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        transform: 'scale(1.02)',
                                        '& .zoom-overlay': {
                                            opacity: 1
                                        }
                                    }
                                }}
                                onClick={() => handleImageClick(image)}
                            >
                                <img
                                    src={image}
                                    alt={`Media ${index + 1}`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                                <Box
                                    className="zoom-overlay"
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'rgba(0, 0, 0, 0.4)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: 0,
                                        transition: 'opacity 0.2s ease'
                                    }}
                                >
                                    <ZoomInIcon sx={{ color: 'white', fontSize: 30 }} />
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                );
            }

            // Three images - one large, two small
            if (imageCount === 3) {
                return (
                    <Box sx={{ mt: 1, mb: 0.5 }}>
                        <Box
                            sx={{
                                height: '200px',
                                borderRadius: 2,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                position: 'relative',
                                mb: 0.5,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'scale(1.01)',
                                    '& .zoom-overlay': {
                                        opacity: 1
                                    }
                                }
                            }}
                            onClick={() => handleImageClick(post.images[0])}
                        >
                            <img
                                src={post.images[0]}
                                alt="Media 1"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                            <Box
                                className="zoom-overlay"
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'rgba(0, 0, 0, 0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0,
                                    transition: 'opacity 0.2s ease'
                                }}
                            >
                                <ZoomInIcon sx={{ color: 'white', fontSize: 30 }} />
                            </Box>
                        </Box>
                        <Stack direction="row" spacing={0.5}>
                            {post.images.slice(1).map((image, index) => (
                                <Box
                                    key={index + 1}
                                    sx={{
                                        flex: 1,
                                        height: '120px',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            transform: 'scale(1.02)',
                                            '& .zoom-overlay': {
                                                opacity: 1
                                            }
                                        }
                                    }}
                                    onClick={() => handleImageClick(image)}
                                >
                                    <img
                                        src={image}
                                        alt={`Media ${index + 2}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <Box
                                        className="zoom-overlay"
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'rgba(0, 0, 0, 0.4)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: 0,
                                            transition: 'opacity 0.2s ease'
                                        }}
                                    >
                                        <ZoomInIcon sx={{ color: 'white', fontSize: 25 }} />
                                    </Box>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                );
            }

            // Four or more images - 2x2 grid with "+X more" overlay on last
            if (imageCount >= 4) {
                return (
                    <Box
                        sx={{
                            mt: 1,
                            mb: 0.5,
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 0.5,
                            borderRadius: 2
                        }}
                    >
                        {post.images.slice(0, 4).map((image, index) => (
                            <Box
                                key={index}
                                sx={{
                                    height: '150px',
                                    borderRadius: 1.5,
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        transform: 'scale(1.02)',
                                        '& .zoom-overlay': {
                                            opacity: 1
                                        }
                                    }
                                }}
                                onClick={() => handleImageClick(image)}
                            >
                                <img
                                    src={image}
                                    alt={`Media ${index + 1}`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                                {index === 3 && imageCount > 4 && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'rgba(0, 0, 0, 0.6)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                color: 'white',
                                                fontWeight: 700
                                            }}
                                        >
                                            +{imageCount - 4}
                                        </Typography>
                                    </Box>
                                )}
                                <Box
                                    className="zoom-overlay"
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: index === 3 && imageCount > 4 ? 'transparent' : 'rgba(0, 0, 0, 0.4)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: 0,
                                        transition: 'opacity 0.2s ease'
                                    }}
                                >
                                    {!(index === 3 && imageCount > 4) && (
                                        <ZoomInIcon sx={{ color: 'white', fontSize: 25 }} />
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                );
            }
        }
        return null;
    };

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                    mb: 1.5,
                    px: { xs: 1, md: 2 },
                    animation: 'slideIn 0.3s ease-out',
                    '@keyframes slideIn': {
                        from: {
                            opacity: 0,
                            transform: isOwnMessage ? 'translateX(20px)' : 'translateX(-20px)'
                        },
                        to: {
                            opacity: 1,
                            transform: 'translateX(0)'
                        }
                    }
                }}
            >
                {/* Avatar for others' messages (left side) */}
                {!isOwnMessage && (
                    <Avatar
                        src={authorAvatar}
                        sx={{
                            width: 36,
                            height: 36,
                            mr: 1.5,
                            mt: 0.5,
                            background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                            border: '2px solid rgba(148, 163, 184, 0.3)',
                            fontSize: 14,
                            fontWeight: 600
                        }}
                    >
                        {!authorAvatar && authorName.charAt(0)}
                    </Avatar>
                )}

                {/* Message Bubble */}
                <Box
                    sx={{
                        maxWidth: { xs: '85%', sm: '70%', md: '60%' },
                        position: 'relative'
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Author name for others' messages */}
                    {!isOwnMessage && (
                        <Typography
                            variant="caption"
                            sx={{
                                ml: 1,
                                mb: 0.5,
                                display: 'block',
                                color: 'rgba(148, 163, 184, 0.9)',
                                fontWeight: 600
                            }}
                        >
                            {authorName}
                        </Typography>
                    )}

                    <Box
                        sx={{
                            position: 'relative',
                            background: isOwnMessage
                                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                                : '#ffffff',
                            color: isOwnMessage ? 'white' : '#1e293b',
                            borderRadius: isOwnMessage
                                ? '12px 12px 4px 12px'
                                : '12px 12px 12px 4px',
                            px: 2,
                            py: 1.5,
                            boxShadow: isOwnMessage
                                ? '0 2px 8px rgba(59, 130, 246, 0.3)'
                                : '0 2px 8px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                boxShadow: isOwnMessage
                                    ? '0 4px 12px rgba(59, 130, 246, 0.4)'
                                    : '0 4px 12px rgba(0, 0, 0, 0.15)',
                            },
                            // WhatsApp-style tail
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                bottom: 0,
                                [isOwnMessage ? 'right' : 'left']: -6,
                                width: 0,
                                height: 0,
                                borderStyle: 'solid',
                                borderWidth: isOwnMessage
                                    ? '0 0 12px 12px'
                                    : '0 12px 12px 0',
                                borderColor: isOwnMessage
                                    ? 'transparent transparent transparent #2563eb'
                                    : 'transparent #ffffff transparent transparent'
                            }
                        }}
                    >
                        {/* Post type badge */}
                        {post.type !== 'text' && (
                            <Chip
                                label={`${post.type}${post.images?.length > 1 ? ` (${post.images.length})` : ''}`}
                                size="small"
                                icon={post.type === 'image' ? <ImageIcon /> : post.type === 'video' ? <VideoFileIcon /> : null}
                                sx={{
                                    height: 20,
                                    fontSize: 10,
                                    fontWeight: 600,
                                    mb: 1,
                                    background: isOwnMessage
                                        ? 'rgba(255, 255, 255, 0.2)'
                                        : 'rgba(59, 130, 246, 0.1)',
                                    color: isOwnMessage ? 'white' : '#3b82f6',
                                    border: 'none',
                                    '& .MuiChip-icon': {
                                        color: isOwnMessage ? 'white' : '#3b82f6'
                                    }
                                }}
                            />
                        )}

                        {/* Title */}
                        {post.title && (
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    mb: 0.5,
                                    fontWeight: 700,
                                    color: isOwnMessage ? 'white' : '#1e293b'
                                }}
                            >
                                {post.title}
                            </Typography>
                        )}

                        {/* Content */}
                        <Typography
                            variant="body2"
                            sx={{
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                lineHeight: 1.5,
                                color: isOwnMessage ? 'rgba(255, 255, 255, 0.95)' : '#334155'
                            }}
                        >
                            {post.content}
                        </Typography>

                        {/* Media */}
                        {renderMedia()}

                        {/* Time and status row */}
                        <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                            justifyContent="flex-end"
                            sx={{ mt: 0.5 }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: 11,
                                    color: isOwnMessage
                                        ? 'rgba(255, 255, 255, 0.7)'
                                        : 'rgba(100, 116, 139, 0.8)',
                                    fontWeight: 500
                                }}
                            >
                                {formatTime(post.createdAt)}
                            </Typography>
                            {isOwnMessage && (
                                <DoneAllIcon
                                    sx={{
                                        fontSize: 16,
                                        color: 'rgba(255, 255, 255, 0.7)'
                                    }}
                                />
                            )}
                        </Stack>
                    </Box>

                    {/* Reactions bar (appears on hover) */}
                    <Fade in={isHovered} timeout={200}>
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                                position: 'absolute',
                                bottom: -35,
                                [isOwnMessage ? 'right' : 'left']: 0,
                                background: 'rgba(30, 41, 59, 0.95)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: 3,
                                px: 1.5,
                                py: 0.75,
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                zIndex: 10
                            }}
                        >
                            <Tooltip title={hasUpvoted ? "Unlike" : "Like"} arrow>
                                <IconButton
                                    size="small"
                                    onClick={handleVote}
                                    sx={{
                                        color: hasUpvoted ? '#3b82f6' : 'rgba(148, 163, 184, 0.9)',
                                        '&:hover': {
                                            color: '#3b82f6',
                                            background: 'rgba(59, 130, 246, 0.1)'
                                        }
                                    }}
                                >
                                    {hasUpvoted ? <ThumbUpIcon fontSize="small" /> : <ThumbUpOutlinedIcon fontSize="small" />}
                                </IconButton>
                            </Tooltip>
                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: 'rgba(148, 163, 184, 0.9)',
                                    fontWeight: 600,
                                    px: 1
                                }}
                            >
                                {voteCount}
                            </Typography>
                            <Tooltip title="Reply" arrow>
                                <IconButton
                                    size="small"
                                    // 🐛 FIX: Add the onClick handler to open the dialog
                                    onClick={handleOpenReplyDialog}
                                    sx={{
                                        color: 'rgba(148, 163, 184, 0.9)',
                                        '&:hover': {
                                            color: '#3b82f6',
                                            background: 'rgba(59, 130, 246, 0.1)'
                                        }
                                    }}
                                >
                                    <ChatBubbleOutlineIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: 'rgba(148, 163, 184, 0.9)',
                                    fontWeight: 600,
                                    px: 0.5
                                }}
                            >
                                {post.commentCount || 0}
                            </Typography>
                        </Stack>
                    </Fade>
                </Box>

                {/* Avatar for own messages (right side) */}
                {isOwnMessage && (
                    <Avatar
                        src={authorAvatar}
                        sx={{
                            width: 36,
                            height: 36,
                            ml: 1.5,
                            mt: 0.5,
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            border: '2px solid rgba(59, 130, 246, 0.3)',
                            fontSize: 14,
                            fontWeight: 600
                        }}
                    >
                        {!authorAvatar && authorName.charAt(0)}
                    </Avatar>
                )}
            </Box>

            {/* Full Screen Image Viewer (Completed) */}
            <Dialog
                open={openImageViewer}
                onClose={handleCloseViewer}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        background: 'rgba(0, 0, 0, 0.9)',
                        backdropFilter: 'blur(5px)'
                    }
                }}
            >
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                    <IconButton
                        onClick={handleCloseViewer}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: 'white',
                            zIndex: 10
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    {selectedImage && (
                        <img
                            src={selectedImage}
                            alt="Full Size Media"
                            style={{
                                maxHeight: '90vh',
                                maxWidth: '100%',
                                objectFit: 'contain'
                            }}
                        />
                    )}
                </Box>
            </Dialog>

            {/* Reply Dialog (Beautified) */}
            <Dialog
                open={openReplyDialog}
                onClose={handleCloseReplyDialog}
                maxWidth="sm"
                fullWidth
                // 1. Refined Dialog Paper Styling
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: 'linear-gradient(145deg, #1f2937 0%, #111827 100%)', // Subtle dark gradient
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                    }
                }}
            >
                <Box sx={{ p: 4, color: 'white' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5" sx={{ color: '#3b82f6', fontWeight: 800 }}>
                            💬 Reply to {authorName}
                        </Typography>
                        <IconButton onClick={handleCloseReplyDialog} sx={{
                            color: 'rgba(148, 163, 184, 0.9)',
                            '&:hover': { color: '#3b82f6' }
                        }}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>

                    {/* 2. Enhanced Quoted Post Preview (WhatsApp/Slack style quote) */}
                    <Box
                        sx={{
                            mb: 3,
                            p: 1.5,
                            pl: 2, // Padding left for the border
                            background: '#1f2937', // Slightly lighter background for contrast
                            borderRadius: 2,
                            borderLeft: '4px solid #3b82f6', // Strong blue left border
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        <Typography variant="caption" sx={{ color: 'rgba(59, 130, 246, 0.9)', fontWeight: 700, display: 'block' }}>
                            {authorName}
                        </Typography>
                        <Typography variant="body2" sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontStyle: 'italic'
                        }}>
                            {post.content.substring(0, 70)}{post.content.length > 70 ? '...' : ''}
                        </Typography>
                    </Box>

                    {/* 3 & 4. Text Field and Floating Send Button */}
                    <Box sx={{ position: 'relative' }}>
                        <TextField
                            multiline
                            rows={4}
                            placeholder={`Replying to ${authorName}...`}
                            variant="outlined"
                            fullWidth
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            disabled={isSubmittingReply}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    background: '#0f172a',
                                    color: 'white',
                                    borderRadius: 2,
                                    pr: 8, // Space for the floating button
                                    '& fieldset': {
                                        borderColor: 'rgba(59, 130, 246, 0.4)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#3b82f6',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#3b82f6',
                                    },
                                },
                                '& .MuiInputBase-input::placeholder': {
                                    color: 'rgba(148, 163, 184, 0.7)'
                                },
                            }}
                        />

                        <Button
                            variant="contained"
                            color="primary"
                            // Floating Action Button position
                            sx={{
                                position: 'absolute',
                                bottom: 8,
                                right: 8,
                                height: 40,
                                minWidth: 40,
                                borderRadius: 2,
                                p: 0,
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                boxShadow: '0 4px 10px rgba(59, 130, 246, 0.5)',
                                '&:hover': {
                                    boxShadow: '0 6px 15px rgba(59, 130, 246, 0.7)',
                                }
                            }}
                            onClick={handleSubmitReply}
                            disabled={isSubmittingReply || !replyContent.trim()}
                        >
                            {isSubmittingReply
                                ? <CircularProgress size={20} color="inherit" />
                                : <SendIcon sx={{ ml: isSubmittingReply ? 0 : 1, mr: isSubmittingReply ? 0 : 1 }} />
                            }
                        </Button>
                    </Box>
                </Box>
            </Dialog>
        </>
    );
};

export default PostItem;