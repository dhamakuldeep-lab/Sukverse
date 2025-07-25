import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Card, CardContent, Button, List, ListItem, ListItemText, LinearProgress } from "@mui/material";
import axios from "axios";
import Navbar from "../components/Navbar";
import { UserContext } from "../contexts/UserContext";

export default function WorkshopDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);

  const [workshop, setWorkshop] = useState(null);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8001/workshops/${id}`)
      .then((res) => setWorkshop(res.data))
      .catch((err) => console.error("❌ Error fetching workshop details:", err));
  }, [id]);

  if (!workshop) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Loading workshop...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>{workshop.title}</Typography>
        <Typography variant="subtitle1" gutterBottom>Trainer ID: {workshop.trainer_id}</Typography>
        <Typography variant="body1" gutterBottom>Description: {workshop.description}</Typography>

        <Typography variant="h6" sx={{ mt: 3 }}>Sections</Typography>
        {workshop.sections && workshop.sections.length > 0 ? (
          <List>
            {workshop.sections.map((section) => (
              <ListItem key={section.id}>
                <ListItemText
                  primary={section.title}
                  secondary={section.ppt_url || "No PPT"}
                />
                <Button
                  variant="contained"
                  onClick={() => navigate(`/workshops/${id}/sections/${section.id}`)}
                  sx={{ ml: 2 }}
                >
                  Start
                </Button>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No sections available.</Typography>
        )}

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
          <Button variant="outlined" onClick={() => navigate(`/workshops/${id}/quiz`)}>Practice Quiz</Button>
          <Button variant="contained" onClick={() => navigate(`/workshops/${id}/certificate`)}>View Certificate</Button>
        </Box>
      </Box>
    </Box>
  );
}
