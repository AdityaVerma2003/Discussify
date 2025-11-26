import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  Divider,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  Forum,
  Menu as MenuIcon,
  Person2Outlined,
  Login,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawer = (
    <Box
      sx={{
        width: 250,
        bgcolor: "primary.main",
        height: "100%",
        color: "white",
      }}
    >
      <Toolbar sx={{ justifyContent: "center" }}>
        <Forum sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Discussify
        </Typography>
      </Toolbar>

      <Divider sx={{ bgcolor: "white" }} />

      <List>
        <ListItem>
          <Button
            variant="contained"
            fullWidth
            sx={{
              bgcolor: "white",
              color: "primary.main",
              fontWeight: 700,
              "&:hover": { bgcolor: "grey.200" },
            }}
            onClick={() => {
              navigate("/register");
              setMobileOpen(false);
            }}
          >
            Sign Up
          </Button>
        </ListItem>

        <ListItem>
          <Button
            variant="outlined"
            fullWidth
            sx={{
              borderColor: "white",
              color: "white",
              fontWeight: 700,
            }}
            onClick={() => {
              navigate("/login");
              setMobileOpen(false);
            }}
          >
            Log In
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar
      position="sticky"
      color="primary"
      elevation={4}
      sx={{
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ py: { xs: 1, md: 1} }}>
          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            edge="start"
            sx={{ display: { md: "none" }, mr: 1 }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => navigate("/")}>
          <Forum sx={{ fontSize: { xs: 28, md: 38 }, mr: 1 }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              flexShrink: 0,
              mr: 4,
              fontSize: { xs: "1.2rem", md: "1.6rem" },
            }}
          >
            Discussify
          </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Sign Up / Log In (Desktop) */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 3,
            }}
          >
            <Button
              variant="contained"
              startIcon={<Person2Outlined />}
              sx={{
                bgcolor: "white",
                color: "primary.main",
                fontWeight: 700,
                "&:hover": { bgcolor: "grey.200" },
              }}
              onClick={() => navigate("/register")}
            >
              Sign Up
            </Button>

            <Button
              variant="outlined"
              startIcon={<Login />}
              sx={{ color: "white", borderColor: "white", fontWeight: 700 }}
              onClick={() => navigate("/login")}
            >
              Log In
            </Button>
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navbar;