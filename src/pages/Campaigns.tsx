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
  Mail,
  Home,
  MapPin,
  DollarSign,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";


const Campaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [leadsModalOpen, setLeadsModalOpen] = useState(false);
  const [currentLeads, setCurrentLeads] = useState<any[]>([]);
  const [currentCampaignName, setCurrentCampaignName] = useState("");

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailCampaign, setEmailCampaign] = useState<any | null>(null);
  const [selectedLeadEmails, setSelectedLeadEmails] = useState<string[]>([]);
  const [selectAllLeads, setSelectAllLeads] = useState(false);

  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [selectAllProperties, setSelectAllProperties] = useState(false);
  const [propertySearch, setPropertySearch] = useState("");

  const [sendingEmail, setSendingEmail] = useState(false);
  const [generatedEmails, setGeneratedEmails] = useState<any[]>([]);
  const [emailReviewModalOpen, setEmailReviewModalOpen] = useState(false);
  const [activeEmailIndex, setActiveEmailIndex] = useState(0);
  const [generatingEmails, setGeneratingEmails] = useState(false);

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

  const fetchProperties = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/properties");
      if (!res.ok) throw new Error("Failed to fetch properties");
      const data = await res.json();
      setProperties(data);
    } catch (err) {
      console.error("❌ Failed to fetch properties:", err);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchProperties();
  }, [user]);

  const handleOpenEmailModal = (campaign: any) => {
    setEmailCampaign(campaign);
    setSelectedLeadEmails([]);
    setSelectedPropertyIds([]);
    setPropertySearch("");
    setEmailModalOpen(true);
  };

  const handleToggleLeadSelection = (email: string) => {
    setSelectedLeadEmails((prev) =>
      prev.includes(email)
        ? prev.filter((e) => e !== email)
        : [...prev, email]
    );
  };

  const handleGenerateEmails = async () => {
    if (selectedLeadEmails.length === 0 || selectedPropertyIds.length === 0) return;
    setGeneratingEmails(true);

    try {
      const selectedLeadsFull = emailCampaign?.leads?.filter((lead: any) =>
        selectedLeadEmails.includes(lead.email)
      ) || [];

      const selectedPropertiesFull = properties.filter((prop) =>
        selectedPropertyIds.includes(prop.id || prop._id)
      );

      const payload = { users: selectedLeadsFull, properties: selectedPropertiesFull };

      const res = await fetch("http://localhost:5000/api/generate-property-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate emails");

      setGeneratedEmails(data.emails);
      setEmailModalOpen(false);
      setEmailReviewModalOpen(true);
    } catch (err) {
      console.error("❌ Error generating emails:", err);
    } finally {
      setGeneratingEmails(false);
    }
  };

  const handleToggleSelectAllLeads = () => {
    if (!emailCampaign?.leads?.length) return;
    if (selectAllLeads) {
      setSelectedLeadEmails([]);
      setSelectAllLeads(false);
    } else {
      const allEmails = emailCampaign.leads.map((lead: any) => lead.email);
      setSelectedLeadEmails(allEmails);
      setSelectAllLeads(true);
    }
  };

  const handleTogglePropertySelection = (id: string) => {
    setSelectedPropertyIds((prev) =>
      prev.includes(id)
        ? prev.filter((pid) => pid !== id)
        : [...prev, id]
    );
  };

  const handleToggleSelectAllProperties = () => {
    if (!filteredProperties.length) return;
    if (selectAllProperties) {
      setSelectedPropertyIds([]);
      setSelectAllProperties(false);
    } else {
      const allIds = filteredProperties.map((p) => p.id || p._id);
      setSelectedPropertyIds(allIds);
      setSelectAllProperties(true);
    }
  };

 const handleSendEmail = async () => {
  if (selectedLeadEmails.length === 0 || selectedPropertyIds.length === 0) return;
  setSendingEmail(true);

  try {
    // Get the full lead objects for selected emails
    const selectedLeadsFull = emailCampaign?.leads?.filter((lead: any) =>
      selectedLeadEmails.includes(lead.email)
    ) || [];

    // Get the full property objects for selected property IDs
    const selectedPropertiesFull = properties.filter((prop) =>
      selectedPropertyIds.includes(prop.id || prop._id)
    );

    // Prepare payload with users and properties
    const payload = {
      users: selectedLeadsFull,
      properties: selectedPropertiesFull, 
    };

    const res = await fetch(
      "http://localhost:5000/api/send-properties-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) throw new Error("Failed to send emails");

    console.log("✅ Emails sent successfully", payload);

    setEmailModalOpen(false);
    setSelectedLeadEmails([]);
    setSelectedPropertyIds([]);
  } catch (err) {
    console.error("❌ Failed to send emails:", err);
  } finally {
    setSendingEmail(false);
  }
};



  // 🔍 Filtered properties based on search
  const filteredProperties = properties.filter((prop) => {
    const q = propertySearch.toLowerCase();
    return (
      prop.title?.toLowerCase().includes(q) ||
      prop.community?.toLowerCase().includes(q) ||
      prop.subCommunity?.toLowerCase().includes(q)
    );
  });

  // --- Edit Campaign ---
const handleEditCampaign = (campaign: any) => {
  setEditingCampaign(campaign);
  setCampaignName(campaign.campaignName || "");
  setSelectedLeads(campaign.leads || []);
  setIsModalOpen(true);
};

const handleRemoveLead = (leadId: string) => {
  setSelectedLeads((prev) => prev.filter((lead) => lead.id !== leadId));
};

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

// --- Delete Campaign ---
const handleDeleteCampaign = (campaign: any) => {
  setCampaignToDelete(campaign);
  setDeleteModalOpen(true);
};

const confirmDeleteCampaign = async () => {
  if (!campaignToDelete) return;
  setDeleteLoading(true);
  try {
    const res = await fetch(
      `http://localhost:5000/api/campaigns/${campaignToDelete._id}`,
      { method: "DELETE" }
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

// --- Leads Modal ---
  const handleViewLeads = (leads: any[], campaignName: string) => {
    setCurrentLeads(leads);
    setCurrentCampaignName(campaignName);
    setLeadsModalOpen(true);
  };

  


  return (
    <DashboardLayout>
      <div className="space-y-6">
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
                                handleViewLeads(campaign.leads || [], campaign.campaignName)
                              }
                          >
                            {campaign.leads.length}
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
                              onClick={() => handleOpenEmailModal(campaign)}
                            >
                              <Mail className="h-4 w-4" />
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

        {/* --- Edit Modal --- */}
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
                            <p className="font-medium text-sm truncate">{lead.name}</p>
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

        {/* --- Delete Confirmation Modal --- */}
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

        {/* --- Leads View Modal --- */}
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
                      <p className="text-xs text-muted-foreground">{lead.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* --- Email Review Modal --- */}
        <Dialog open={emailReviewModalOpen} onOpenChange={setEmailReviewModalOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review and Send Emails</DialogTitle>
              <DialogDescription>
                Review and personalize the icebreaker (per user) and body (shared).
              </DialogDescription>
            </DialogHeader>

            {generatedEmails.length > 0 && (
              <div className="space-y-5 py-4">
                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activeEmailIndex === 0}
                    onClick={() => setActiveEmailIndex((i) => Math.max(0, i - 1))}
                  >
                    ← Prev
                  </Button>
                  <span className="font-medium">
                    {activeEmailIndex + 1} / {generatedEmails.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activeEmailIndex === generatedEmails.length - 1}
                    onClick={() =>
                      setActiveEmailIndex((i) =>
                        Math.min(generatedEmails.length - 1, i + 1)
                      )
                    }
                  >
                    Next →
                  </Button>
                </div>

                {/* Recipient Info */}
                <div className="border rounded-md p-4 bg-muted/30">
                  <p className="font-medium mb-1">
                    To: {generatedEmails[activeEmailIndex].email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Name: {generatedEmails[activeEmailIndex].name || "Unknown"}
                  </p>
                </div>

                {/* Editable Icebreaker Section */}
                <div className="space-y-2">
                  <Label className="font-semibold">Icebreaker</Label>
                  <ReactQuill
                    key={`icebreaker-${activeEmailIndex}`} // force rerender when user changes
                    theme="snow"
                    value={generatedEmails[activeEmailIndex].icebreaker || ""}
                    onChange={(val) =>
                      setGeneratedEmails((prev) => {
                        const updated = structuredClone(prev); // ✅ deep clone to break refs
                        updated[activeEmailIndex].icebreaker = val;
                        return updated;
                      })
                    }
                    className="min-h-[120px]"
                  />
                </div>

                {/* Shared Email Body Section */}
                <div className="space-y-2">
                  <Label className="font-semibold">Email Body</Label>
                  <ReactQuill
                    key="shared-body"
                    theme="snow"
                    value={generatedEmails[0].body || ""}
                    onChange={(val) =>
                      setGeneratedEmails((prev) =>
                        prev.map((email) => ({
                          ...email,
                          body: val, // apply same body to all
                        }))
                      )
                    }
                    className="min-h-[300px]"
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setEmailReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const res = await fetch(
                      "http://localhost:5000/api/send-generated-emails",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ emails: generatedEmails }),
                      }
                    );
                    if (!res.ok) throw new Error("Failed to send emails");
                    setEmailReviewModalOpen(false);
                    setGeneratedEmails([]);
                  } catch (err) {
                    console.error("❌ Sending error:", err);
                  }
                }}
                className="bg-gradient-primary hover:opacity-90"
              >
                Send Emails
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>




        {/* --- Email Modal --- */}
        <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
          <DialogContent className="max-w-[75vw] max-h-[75vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Send Email</DialogTitle>
              <DialogDescription>
                Select leads and properties to include in your campaign email.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-6 py-3">
              {/* Leads Section */}
              <div>
                <Label>Select Leads</Label>
                <div className="border rounded-md p-3 max-h-[400px] overflow-y-auto">
                  {emailCampaign?.leads?.length ? (
                    <>
                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={selectAllLeads}
                          onChange={handleToggleSelectAllLeads}
                          className="mr-2 cursor-pointer"
                        />
                        <span className="font-medium">Select All</span>
                      </div>
                      {emailCampaign.leads.map((lead: any) => (
                        <div
                          key={lead.id}
                          className="flex items-center py-2 border-b last:border-none"
                        >
                          <input
                            type="checkbox"
                            checked={selectedLeadEmails.includes(lead.email)}
                            onChange={() =>
                              handleToggleLeadSelection(lead.email)
                            }
                            className="mr-2 cursor-pointer"
                          />
                          <div className="flex items-center gap-2">
                            {lead.photo_url ? (
                              <img
                                src={lead.photo_url}
                                alt={lead.name}
                                className="w-8 h-8 rounded-full border"
                              />
                            ) : (
                              <UserCircle className="w-8 h-8 text-muted-foreground" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{lead.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {lead.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">
                      No leads available
                    </p>
                  )}
                </div>
              </div>

              {/* Properties Section */}
              <div>
                <Label>Select Properties</Label>
                <div className="relative mb-3">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, community..."
                    value={propertySearch}
                    onChange={(e) => setPropertySearch(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <div className="border rounded-md p-3 max-h-[400px] overflow-y-auto">
                  {filteredProperties.length ? (
                    <>
                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={selectAllProperties}
                          onChange={handleToggleSelectAllProperties}
                          className="mr-2 cursor-pointer"
                        />
                        <span className="font-medium">
                          Select All
                        </span>
                      </div>
                      {filteredProperties.map((prop) => (
                        <div
                          key={prop.id || prop._id}
                          className="flex items-center gap-3 py-2 border-b last:border-none"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPropertyIds.includes(
                              prop.id || prop._id
                            )}
                            onChange={() =>
                              handleTogglePropertySelection(prop.id || prop._id)
                            }
                            className="mr-2 cursor-pointer"
                          />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1 font-medium text-sm">
                              <Home className="h-4 w-4 text-primary" />{" "}
                              {prop.title}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" /> {prop.community}
                              {prop.subCommunity ? `, ${prop.subCommunity}` : ""}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <DollarSign className="h-3 w-3 mr-1" /> AED{" "}
                              {prop.price?.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">
                      No properties found
                    </p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEmailModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerateEmails}
                disabled={
                  selectedLeadEmails.length === 0 ||
                  selectedPropertyIds.length === 0 ||
                  generatingEmails
                }
                className="bg-gradient-primary hover:opacity-90"
              >
                {generatingEmails ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                  </>
                ) : (
                  "Generate Emails"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Campaigns;
