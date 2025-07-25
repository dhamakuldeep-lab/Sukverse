import React from "react";
import { Box, Button, Typography, List, ListItem, ListItemText } from "@mui/material";

export default function DashboardLayout({ menuItems, children }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f7f9fc" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 260,
          bgcolor: "#0f172a",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          p: 3,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Trainer
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: "italic", mb: 3 }}>
            (User)
          </Typography>
          <List>
            {menuItems.map((item, index) => (
              <ListItem
                key={index}
                button
                sx={{
                  mb: 1,
                  "&:hover": { bgcolor: "#1e293b" },
                  borderRadius: 1,
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (item.action) {
                    item.action(); // Trigger the state change
                  }
                }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
        <Button
          variant="contained"
          color="error"
          sx={{ textTransform: "uppercase", fontWeight: "bold" }}
        >
          Logout
        </Button>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 4 }}>{children}</Box>
    </Box>
  );
}
