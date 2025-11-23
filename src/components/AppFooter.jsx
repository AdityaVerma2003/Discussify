import { Facebook, Forum, LinkedIn, Twitter } from "@mui/icons-material";
import { Box, Container, Grid, Typography , Avatar  , Divider } from "@mui/material";
import { grey } from "@mui/material/colors";

const AppFooter = () => (
    <Box sx={{ bgcolor: 'background.paper', borderTop: `1px solid ${grey[200]}`, py: 6 }}>
        <Container maxWidth="lg">
            <Grid container spacing={8}>
                {/* Logo and Tagline */}
                <Grid item xs={12} sm={4}>
                    <Typography variant="h6" color="primary.main" gutterBottom sx={{display:"flex"}}>
                    <Forum sx={{ fontSize: { xs: 28, md: 38 }, mr: 1 }} />
                        DISCUSSIFY
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Connecting professionals and enthusiasts through meaningful discussions. 
                    </Typography>
                </Grid>

                {/* Resources and Legal Links */}
                <Grid item xs={6} sm={2}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Resources</Typography>
                    <Typography variant="body2" color="text.secondary">Help Center</Typography>
                    <Typography variant="body2" color="text.secondary">Blog</Typography>
                    <Typography variant="body2" color="text.secondary">Careers</Typography>
                </Grid>
                <Grid item xs={6} sm={2}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Legal</Typography>
                    <Typography variant="body2" color="text.secondary">Privacy Policy</Typography>
                    <Typography variant="body2" color="text.secondary">Terms of Service</Typography>
                    <Typography variant="body2" color="text.secondary">Security</Typography>
                </Grid>

                {/* Follow Us (Placeholder Social Icons) */}
                <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Follow Us</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}><Twitter/></Avatar>
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}><Facebook/></Avatar>
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}><LinkedIn/></Avatar>
                    </Box>
                </Grid>
            </Grid>
            <Divider sx={{ my: 4 }} />
            <Typography variant="body2" color="text.secondary" align="center">
                &copy; {new Date().getFullYear()} Discussify. All rights reserved.
            </Typography>
        </Container>
    </Box>
);
export default AppFooter;