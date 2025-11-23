import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Drawer,
  List,
  ListItem,
  Divider,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  Search,
  Forum,
  Menu as MenuIcon,
  Home,
  Group,
  Info,
  Person2Outlined,
  Login,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Navbar = ({ handleSearch }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const navigate = useNavigate();

  const navItems = [
    { name: "Home", icon: <Home /> },
    { name: "Communities", icon: <Group /> },
    { name: "About", icon: <Info /> },
  ];

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
        {navItems.map((item) => (
          <ListItem
            button
            key={item.name}
            onClick={() => {
              navigate(`/${item.name.toLowerCase().replace(/\s+/g, '')}`);
              setMobileOpen(false);
            }}
          >
            <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}

        <Divider sx={{ bgcolor: "white", mt: 1 }} />

        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          <Button
            variant="contained"
            fullWidth
            sx={{
              bgcolor: "white",
              color: "primary.main",
              fontWeight: 700,
              "&:hover": { bgcolor: "grey.200" },
            }}
            onClick={() => navigate('/register')}
          >
            Sign Up
          </Button>

          <Button
            variant="outlined"
            fullWidth
            sx={{
              borderColor: "white",
              color: "white",
              fontWeight: 700,
            }}
            onClick={() => navigate('/login')}
          >
            Log In
          </Button>
        </Box>
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
        <Toolbar sx={{ py: { xs: 1, md: 2 } }}>
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

          {/* Search Bar - visible even on mobile (below md) */}
          <Box sx={{ flexGrow: 1, mx: 2, display: { xs: "none", sm: "block" } }}>
            <TextField
              placeholder="Search communities or topics"
              size="small"
              onChange={handleSearch}
              sx={{
                width: "100%",
                maxWidth: 420,
                bgcolor: "white",
                borderRadius: 2,
                "& fieldset": { border: "none" },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Desktop Navigation */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 3,
            }}
          >
            {navItems.map((item) => (
              <Button
                key={item.name}
                color="inherit"
                onClick={() => navigate(`/${item.name.toLowerCase().replace(/\s+/g, '')}`)}
              >
                {item.name}
              </Button>
            ))}

            <Button
              variant="contained"
              startIcon={<Person2Outlined />}
              sx={{
                bgcolor: "white",
                color: "primary.main",
                fontWeight: 700,
                "&:hover": { bgcolor: "grey.200" },
              }}
              onClick={() => navigate('/register')}
            >
              Sign Up
            </Button>

            <Button
              variant="outlined"
              startIcon={<Login />}
              sx={{ color: "white", borderColor: "white", fontWeight: 700 }}
              onClick={() => navigate('/login')}
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