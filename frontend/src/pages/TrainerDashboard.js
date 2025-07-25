import React, { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, CardActions, Button, Grid, Paper } from "@mui/material";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
import CreateWorkshopForm from "./CreateWorkshopForm";

export default function TrainerDashboard() {
  const [activeTab, setActiveTab] = useState("myWorkshops");
  const [workshops, setWorkshops] = useState([]);

  // ✅ Fetch Workshops
  const fetchWorkshops = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8001/workshops/");
      setWorkshops(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch workshops", err);
    }
  };

  useEffect(() => {
    if (activeTab === "myWorkshops") {
      fetchWorkshops();
    }
  }, [activeTab]);

  const handleWorkshopCreated = () => {
    setActiveTab("myWorkshops");
    fetchWorkshops();
  };

  const menuItems = [
    { label: "My Workshops", path: "myWorkshops", action: () => setActiveTab("myWorkshops") },
    { label: "Create Workshop", path: "createWorkshop", action: () => setActiveTab("createWorkshop") },
  ];

  return (
    <DashboardLayout menuItems={menuItems}>
      {activeTab === "myWorkshops" && (
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
            My Workshops
          </Typography>
          {workshops.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              You have not created any workshops yet.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {workshops.map((workshop) => (
                <Grid item xs={12} sm={6} md={4} key={workshop.id}>
                  <Card elevation={3} sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold">
                        {workshop.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sections: {workshop.sections?.length || 0}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: "flex-end" }}>
                      <Button size="small">VIEW</Button>
                      <Button size="small">EDIT</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {activeTab === "createWorkshop" && (
        <Paper sx={{ p: 2 }}>
          <CreateWorkshopForm
            onSuccess={handleWorkshopCreated}
            onCancel={() => setActiveTab("myWorkshops")}
          />
        </Paper>
      )}
    </DashboardLayout>
  );
}
