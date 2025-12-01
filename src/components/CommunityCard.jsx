
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Button,
  Avatar,
} from '@mui/material';
import { People, Lock, Public } from '@mui/icons-material';

const CommunityCard = ({ name, description, memberCount, isPrivate, categories, coverImage }) => {
  return (
    <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        border: '1px solid ',   
        borderColor: 'grey.300',

        '&:hover': { 
            boxShadow: 6, // Lift card on hover
        } 
    }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          {/* Subtle icon/avatar based on community type */}
          <Avatar 
          src={`http://localhost:3001${coverImage}`}
          sx={{ bgcolor: 'primary.main', mr: 2 }}>
            {`http://localhost:3001${coverImage}`}
          </Avatar>
          <Typography variant="h6" component="div" noWrap>
            {name}
          </Typography>
        </Box>
        
        {/* Description and Metadata */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {description}
        </Typography>

        {/* Tags/Chips */}
        {/* <Box sx={{ my: 1 }}>
          {categories.map((tag) => (
            <Chip 
              key={tag} 
              label={tag} 
              size="small" 
              sx={{ mr: 0.5, mb: 0.5, bgcolor: 'grey.200' }} 
            />
          ))}
        </Box> */}
        
        {/* Member count */}
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mt: 1 }}>
          <People sx={{ fontSize: 16, mr: 0.5 }} />
          <Typography variant="caption">{memberCount.toLocaleString()} Members</Typography>
        </Box>
      </CardContent>
      
      {/* Call to Action - Primary button */}
      <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
        <Button 
            variant="contained" 
            fullWidth 
            color="primary"
            sx={{ textTransform: 'uppercase' }}
        >
          {isPrivate ? 'Request to Join' : 'Join Discussion'}
        </Button>
      </Box>
    </Card>
  );
};

export default CommunityCard;