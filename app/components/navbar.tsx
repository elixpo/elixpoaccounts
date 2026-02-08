'use client';


import { AppBar, Box, Chip, Toolbar, Typography } from "@mui/material";
import Link from "next/link";

const Navbar = () => (
  <AppBar position="sticky" elevation={0} sx={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.1)", zIndex: 1000 }}>
    <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
      <Link href="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "12px", flexGrow: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img src="/gsoc_logo.webp" alt="GSoC" style={{ height: "24px" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, background: "linear-gradient(135deg, #fff 0%, #a1a1aa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.02em" }}>
            GSoC
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "1.2rem" }}>×</Typography>
          <img src="/logo-text.svg" alt="pollinations.ai" style={{ height: "28px", filter: "brightness(0) invert(1)" }} />
        </Box>
        <Chip label="2026" size="small" sx={{ bgcolor: "rgba(132, 204, 22, 0.1)", color: "#84cc16", fontSize: "10px", height: "22px", fontFamily: "monospace", fontWeight: 500, border: "1px solid rgba(132, 204, 22, 0.3)" }} />
      </Link>
    </Toolbar>
  </AppBar>
);

export default Navbar;