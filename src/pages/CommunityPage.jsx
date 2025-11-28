import { useState } from "react";
import {
  AppBar, Toolbar, IconButton, Typography, Box,
  InputBase, Paper, Card, CardContent, Avatar, Chip, Button,
  Divider,  Stack, Tooltip
} from '@mui/material';

import {
  Notifications as NotificationsIcon, Settings as SettingsIcon, Search as SearchIcon,
  Group as GroupIcon, TrendingUp as TrendingUpIcon, ThumbUp as ThumbUpIcon,
  Close as CloseIcon, Check as CheckIcon, Edit as EditIcon,
  AddCircle as AddCircleIcon, ArrowBack as ArrowBackIcon, Send as SendIcon,
  AttachFile as AttachFileIcon, FavoriteBorder as FavoriteBorderIcon, Reply as ReplyIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';

const CommunityPage = ({ community, userId, goBack }) => {
  const [posts] = useState([
    {
      id: 1,
      creatorName: 'Alice',
      content: 'Hey everyone! Just started learning React Query!',
      timestamp: new Date(Date.now() - 3600000),
      likes: 5,
    },
  ]);
  const [newPostContent, setNewPostContent] = useState('');

  const handlePostSubmit = () => {
    if (!newPostContent.trim()) return;
    setNewPostContent('');
  };

  const PostItem = ({ post }) => (
    <Card sx={{ mb: 2, borderRadius: 2, bgcolor: 'white', border: '1px solid #e2e8f0' }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ bgcolor: community.color || '#2563eb', width: 32, height: 32, fontSize: 14 }}>
            {post.creatorName.charAt(0)}
          </Avatar>
          <Box sx={{ ml: 1.5, flexGrow: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>{post.creatorName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {post.timestamp ? new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>{post.content}</Typography>
        <Divider sx={{ my: 1 }} />
        <Stack direction="row" spacing={2}>
          <Button size="small" startIcon={<FavoriteBorderIcon />} sx={{ textTransform: 'none', color: 'text.secondary' }}>
            Like ({post.likes})
          </Button>
          <Button size="small" startIcon={<ReplyIcon />} sx={{ textTransform: 'none', color: 'text.secondary' }}>
            Reply
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f4f7f9' }}>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar sx={{ minHeight: 64 }}>
          <IconButton edge="start" color="inherit" onClick={goBack}>
            <ArrowBackIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: community.color || '#2563eb', width: 40, height: 40, mr: 1.5, fontSize: 18 }}>
            {community.name.charAt(0)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div" sx={{ lineHeight: 1.2 }}>{community.name}</Typography>
            <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
              {community.memberCount || community.members} members
            </Typography>
          </Box>
          <Tooltip title={`Your Role: ${community.role || 'Member'}`}>
            <Chip
              label={community.role || 'Member'}
              size="small"
              sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 600 }}
            />
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 1, md: 3 }, pt: 1 }}>
        {posts.length === 0 ? (
          <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
            No posts yet. Be the first to start the discussion!
          </Typography>
        ) : (
          posts.map(post => <PostItem key={post.id} post={post} />)
        )}
      </Box>

      <Paper elevation={6} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'white' }}>
        <IconButton color="primary">
          <AttachFileIcon />
        </IconButton>
        <InputBase
          placeholder="Send a message or post..."
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handlePostSubmit();
            }
          }}
          sx={{ flexGrow: 1, bgcolor: '#f1f5f9', p: 1, px: 2, borderRadius: 3, minHeight: 40 }}
          multiline
          maxRows={4}
        />
        <IconButton
          color="primary"
          onClick={handlePostSubmit}
          disabled={!newPostContent.trim()}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
            '&.Mui-disabled': { bgcolor: 'grey.300', color: 'grey.500' }
          }}
        >
          <SendIcon />
        </IconButton>
      </Paper>
    </Box>
  );
};


export default CommunityPage;
