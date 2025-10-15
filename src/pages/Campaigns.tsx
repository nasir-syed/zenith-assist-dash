import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Edit,
  Trash2,
  UserCircle,
  Loader2,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";

const Campaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Leads view modal
  const [leadsModalOpen, setLeadsModalOpen] = useState(false);
  const [currentLeads, setCurrentLeads] = useState<any[]>([]);
  const [currentCampaignName, setCurrentCampaignName] = useState("");

  // Fetch campaigns
  const fetchCampaigns = async () => {
    if (!user?.name || !user?.email) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/campaigns?name=${encodeURIComponent(
          user.name
        )}&email=${encodeURIComponent(user.email)}`
      );
      const data = await res.json();
      setCampaigns(data);
    } catch (err) {
      console.error("❌ Failed to fetch campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [user]);

  // Open edit modal
  const handleEditCampaign = (campaign: any) => {
    setEditingCampaign(campaign);
    setCampaignName(campaign.campaignName || "");
    setSelectedLeads(campaign.leads || []);
    setIsModalOpen(true);
  };

  // Remove lead from campaign in modal
  const handleRemoveLead = (leadId: string) => {
    setSelectedLeads((prev) => prev.filter((lead) => lead.id !== leadId));
  };

  // Save edited campaign
  const handleSaveCampaign = async () => {
    if (!editingCampaign?._id) return;
    try {
      setLoading(true);
      const updated = {
        ...editingCampaign,
        campaignName,
        leads: selectedLeads,
      };

      const res = await fetch(
        `http://localhost:5000/api/campaigns/${editingCampaign._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        }
      );

      if (!res.ok) throw new Error("Failed to update campaign");

      setIsModalOpen(false);
      setEditingCampaign(null);
      fetchCampaigns();
    } catch (err) {
      console.error("❌ Error updating campaign:", err);
    } finally {
      setLoading(false);
    }
  };

  // Open delete modal
  const handleDeleteCampaign = (campaign: any) => {
    setCampaignToDelete(campaign);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDeleteCampaign = async () => {
    if (!campaignToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/campaigns/${campaignToDelete._id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Failed to delete campaign");
      setCampaigns((prev) =>
        prev.filter((c) => c._id !== campaignToDelete._id)
      );
    } catch (err) {
      console.error("❌ Error deleting campaign:", err);
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setCampaignToDelete(null);
    }
  };

  // Open leads modal
  const handleViewLeads = (leads: any[], campaignName: string) => {
    setCurrentLeads(leads);
    setCurrentCampaignName(campaignName);
    setLeadsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
            <p className="text-muted-foreground">
              View, edit, or delete your campaigns.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Campaigns Directory</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="animate-spin h-10 w-10 text-primary mb-3" />
                <p className="text-muted-foreground">Loading campaigns...</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign Name</TableHead>
                      <TableHead className="text-center">Leads</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign._id}>
                        <TableCell>{campaign.campaignName}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleViewLeads(
                                campaign.leads || [],
                                campaign.campaignName
                              )
                            }
                          >
                            ...
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditCampaign(campaign)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteCampaign(campaign)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* --- Edit Modal (your version) --- */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Edit Campaign</DialogTitle>
              <DialogDescription>
                Update your campaign name or remove leads.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name" className="text-sm font-semibold">
                  Campaign Name
                </Label>
                <Input
                  id="campaign-name"
                  type="text"
                  placeholder="Enter campaign name..."
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Leads ({selectedLeads.length})
                </Label>
                {selectedLeads.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No leads in this campaign.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto border rounded-md p-3">
                    {selectedLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {lead.photo_url ? (
                            <img
                              src={lead.photo_url}
                              alt={lead.name}
                              className="w-10 h-10 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full border flex items-center justify-center bg-background">
                              <UserCircle className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {lead.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {lead.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveLead(lead.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCampaign(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCampaign}
                disabled={!campaignName.trim()}
                className="bg-gradient-primary hover:opacity-90"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          open={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setCampaignToDelete(null);
          }}
          onConfirm={confirmDeleteCampaign}
          title={`Delete "${campaignToDelete?.campaignName}"?`}
          message="This will permanently remove the campaign."
          loading={deleteLoading}
        />

        {/* Leads View Modal (read-only) */}
        <Dialog open={leadsModalOpen} onOpenChange={() => setLeadsModalOpen(false)}>
          <DialogContent className="max-w-md max-h-[70vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Leads in "{currentCampaignName}"</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-2">
              {currentLeads.length === 0 ? (
                <p className="text-muted-foreground text-center">
                  No leads in this campaign.
                </p>
              ) : (
                currentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center gap-3 p-2 border rounded-md"
                  >
                    {lead.photo_url ? (
                      <img
                        src={lead.photo_url}
                        alt={lead.name}
                        className="w-10 h-10 rounded-full border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full border flex items-center justify-center bg-muted">
                        <UserCircle className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {lead.email}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Campaigns;
