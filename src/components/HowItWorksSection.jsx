// src/components/HowItWorksModern.jsx
import React from "react";
import {
    Box,
    Grid,
    Paper,
    Typography,
    Fade,
    Zoom,
} from "@mui/material";

const steps = [
    { number: "1", title: "Sign up for free", description: "Provide basic information and create your account in minutes." },
    { number: "2", title: "Join or Create Circles", description: "Discover relevant communities or start your own niche group ." },
    { number: "3", title: "Engage in Structured Chat", description: "Dive into threaded discussions for focused, organized conversations." },
    { number: "4", title: "Contribute Knowledge", description: "Share valuable resources and expertise with a curated audience." },
];

const HowItWorksModern = () => {
    return (
        <Box
            sx={{
                width: "100%",
                py: { xs: 8, md: 12 },
                background: "linear-gradient(180deg, #3d2bff 0%, #ffffff 50%)",
                textAlign: "center",
            }}
        >
            <Fade in timeout={1000}>
                <Typography variant="h3" sx={{ color: "white", fontWeight: 700, mb: 1 }}>
                    How it works
                </Typography>
            </Fade>

            <Fade in timeout={1400}>
                <Typography variant="h6" sx={{ color: "#e4e4e4", mb: { xs: 4, md: 6 }, fontWeight: 300 }}>
                    Follow these simple steps to get started quickly
                </Typography>
            </Fade>

            <Grid
                container
                item
                xs={12}
                sm={6}
                md={2}
                spacing={3}
                sx={{
                    margin: "0 auto",
                    px: 2,
                    mt: 2,
                    display: "flex",
                    justifyContent: "center"
                }}
                alignItems="stretch"           /* ensure rows align */
            >
                {steps.map((step, index) => (
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={2}
                        key={index}
                        sx={{
                            display: "flex",         /* make each grid item a flex column so Paper can stretch */
                        }}
                    >
                        <Zoom in timeout={600 + index * 300} style={{ width: "100%" }}>
                            <Paper
                                elevation={3}
                                sx={{
                                    width: "100%",
                                    p: 4,
                                    borderRadius: "18px",
                                    textAlign: "center",
                                    position: "relative",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "translateY(-8px)",
                                        boxShadow: "0px 12px 24px rgba(0,0,0,0.15)",
                                    },

                                    /* Make Paper stretch to fill the grid item height */
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "flex-start",
                                    boxSizing: "border-box",
                                    height: "100%",

                                    /* Add top padding so content sits below the number bubble consistently */
                                    pt: { xs: 6, md: 8 },
                                    pb: { xs: 3, md: 4 },
                                }}
                            >
                                {/* Number Circle */}
                                <Box
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: "50%",
                                        background: "#3d2bff",
                                        color: "white",
                                        fontWeight: 700,
                                        fontSize: "1.2rem",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        position: "absolute",
                                        top: { xs: -20, md: -28 },   /* responsive bubble position */
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
                                    }}
                                >
                                    {step.number}
                                </Box>

                                {/* Title */}
                                <Typography variant="h6" sx={{ mb: 1, mt: { xs: 0.5, md: 1 }, fontWeight: 700 }}>
                                    {step.title}
                                </Typography>

                                {/* Description - keep it at bottom of card if needed */}
                                <Typography variant="body2" color="text.secondary" sx={{ px: 1, mt: "auto" }}>
                                    {step.description}
                                </Typography>
                            </Paper>
                        </Zoom>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default HowItWorksModern;