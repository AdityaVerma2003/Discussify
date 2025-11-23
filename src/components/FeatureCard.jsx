// src/components/FeatureCard.jsx
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const FeatureCard = ({ icon, title, description, color }) => {
  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.300",
        boxShadow: 2,
        transition: "0.3s ease",
        height: { xs: "auto", sm: 230, md: 200 },
        width: { xs: "100%", sm: "100%", md: 500 },

        "&:hover": {
          boxShadow: 8,
          transform: "translateY(-5px)",
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: `${color}.100`,
            mx: "auto",
            mb: 2,
          }}
        >
          {React.cloneElement(icon, {
            sx: {
              fontSize: { xs: 40, sm: 48, md: 55 },
              color: `${color}.main`,
            },
          })}
        </Box>

        <Typography
          variant="h6"
          align="center"
          sx={{ fontSize: { xs: "1rem", md: "1.2rem" } }}
          gutterBottom
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{
            px: { xs: 1, md: 3 },
            fontSize: { xs: "0.8rem", md: "0.95rem" },
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;