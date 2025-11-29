// src/pages/DiscussionsPage.jsx (PostItem component)

import React from 'react';
import {
  Card, CardContent, Avatar, Button,
  Divider, Stack, Typography, Box, Link, Tooltip, Chip
} from '@mui/material';

import {
  FavoriteBorder as FavoriteBorderIcon, Reply as ReplyIcon,
  InsertDriveFile as InsertDriveFileIcon, GetApp as GetAppIcon,
  ThumbUp as ThumbUpIcon, Image as ImageIcon, VideoFile as VideoFileIcon
} from '@mui/icons-material';
import { togglePostVoteAPI } from '../services/api.js'; // Import API function

const PostItem = ({ post, community, currentUserId, onPostUpdate }) => {
    // Check if the current user has liked the post
    const hasUpvoted = post.upvotes?.includes(currentUserId);
    const voteCount = post.voteCount || 0;
    const authorName = post.author?.username || post.creatorName || 'Unknown User';
    const authorAvatar = post.author?.profileImage;

    const handleVote = async () => {
        try {
            const response = await togglePostVoteAPI(post._id);
            // Call the parent handler to update the post list with the new data
            onPostUpdate(response.post); 
        } catch (error) {
            console.error('Failed to toggle vote:', error);
            // Show error snackbar
        }
    };

    // Render media content based on post type
    const renderMedia = () => {
        if (post.type === 'image' && post.images && post.images.length > 0) {
            return (
                <Box sx={{ my: 1, maxHeight: 300, overflow: 'hidden', borderRadius: 1 }}>
                    <img 
                        src={post.images[0]} 
                        alt="Post Media" 
                        style={{ width: '100%', display: 'block', objectFit: 'cover' }} 
                    />
                </Box>
            );
        }
        // ... Add logic for videoUrl, linkPreview, etc.
        return null;
    };

    return (
        <Card sx={{ mb: 2, borderRadius: 2, bgcolor: 'white', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ p: 2 }}>
                
                {/* Header (Avatar and Name) */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar 
                        src={authorAvatar} 
                        sx={{ bgcolor: community.color || '#2563eb', width: 32, height: 32, fontSize: 14 }}
                    >
                        {!authorAvatar && authorName.charAt(0)}
                    </Avatar>
                    <Box sx={{ ml: 1.5, flexGrow: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>{authorName}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Chip 
                                label={post.type} 
                                size="small" 
                                icon={post.type === 'image' ? <ImageIcon/> : post.type === 'video' ? <VideoFileIcon/> : null}
                                sx={{ height: 20, fontSize: 10 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                                {new Date(post.createdAt).toLocaleString()}
                            </Typography>
                        </Stack>
                    </Box>
                </Box>
                
                <Divider sx={{ my: 1 }} />

                {/* Content */}
                {post.title && <Typography variant="h6" sx={{ mb: 1 }}>{post.title}</Typography>}
                <Typography variant="body1" sx={{ mt: 1, mb: 2, whiteSpace: 'pre-wrap' }}>{post.content}</Typography>

                {/* Render Media */}
                {renderMedia()}
                
                <Divider sx={{ my: 1 }} />
                
                {/* Actions */}
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button 
                        size="small" 
                        startIcon={<ThumbUpIcon />} 
                        sx={{ 
                            textTransform: 'none', 
                            color: hasUpvoted ? 'primary.main' : 'text.secondary',
                            fontWeight: hasUpvoted ? 700 : 500
                        }}
                        onClick={handleVote}
                    >
                        {voteCount} Likes
                    </Button>
                    <Button 
                        size="small" 
                        startIcon={<ReplyIcon />} 
                        sx={{ textTransform: 'none', color: 'text.secondary' }}
                    >
                        Reply ({post.commentCount || 0})
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default PostItem;