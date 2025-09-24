import React, { useState, useEffect } from "react";
import { Client } from "@/data/mockData";
import { useData } from "@/contexts/DataContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ClientFormProps {
  client?: Client | null;
  open: boolean;
  onClose: () => void;
}

// Supported country codes (with + and without, so both cases are caught)
const COUNTRY_CODES = [
  "+971",
  "+966",
  "+974",
  "+968",
  "+973",
  "+965",
  "971",
  "966",
  "974",
  "968",
  "973",
  "965",
];

const ClientForm: React.FC<ClientFormProps> = ({ client, open, onClose }) => {
  const { agents } = useData();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    preferredContactMethod: "",
    preferredLanguage: "",
    budgetRange: "",
    locationEmirate: "",
    locationArea: "",
    purpose: "",
    timeSpan: "",
    preApprovalStatus: "",
    specificRequirements: "",
    tier: "Cold",
    assignedAgents: [] as string[],
    interestedProperties: [] as string[],
  });

  // Normalize phone numbers consistently
  const normalizePhoneNumber = (value: string): string => {
    let normalized = value.trim();

    // Check if number already starts with a known country code
    const existingCode = COUNTRY_CODES.find((code) =>
      normalized.startsWith(code)
    );

    if (existingCode) {
      normalized = normalized.slice(existingCode.length);
    }

    // Always prefix with UAE (+971) and remove leading zeros
    return `+971${normalized.replace(/^0+/, "")}`;
  };

  // Populate form when editing
  useEffect(() => {
    if (client) {
      setFormData({
        fullName: client.fullName || "",
        email: client.email || "",
        phoneNumber: normalizePhoneNumber(client.phoneNumber || ""),
        preferredContactMethod: client.preferredContactMethod || "",
        preferredLanguage: client.preferredLanguage || "",
        budgetRange: client.budgetRange || "",
        locationEmirate: client.locationEmirate || "",
        locationArea: client.locationArea || "",
        purpose: client.purpose || "",
        timeSpan: client.timeSpan || "",
        preApprovalStatus: client.preApprovalStatus || "",
        specificRequirements: client.specificRequirements?.join(", ") || "",
        tier: client.tier || "Cold",
        assignedAgents: client.assignedAgents || [],
        interestedProperties: client.interestedProperties || [],
      });
    } else {
      setFormData({
        fullName: "",
        email: "",
        phoneNumber: "+971", // default prefix
        preferredContactMethod: "",
        preferredLanguage: "",
        budgetRange: "",
        locationEmirate: "",
        locationArea: "",
        purpose: "",
        timeSpan: "",
        preApprovalStatus: "",
        specificRequirements: "",
        tier: "Cold",
        assignedAgents: [],
        interestedProperties: [],
      });
    }
  }, [client, open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      if (field === "phoneNumber") {
        return { ...prev, phoneNumber: normalizePhoneNumber(value) };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const apiUrl = client
        ? `http://localhost:5000/api/clients/${client.id}`
        : "http://localhost:5000/api/clients";
      const method = client ? "PUT" : "POST";

      // Convert specificRequirements back into array
      const payload = {
        ...formData,
        specificRequirements: formData.specificRequirements
          ? formData.specificRequirements.split(",").map((s) => s.trim())
          : [],
      };

      const response = await fetch(apiUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save client");

      onClose();
    } catch (err) {
      console.error("Error saving client:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full">
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "Add New Client"}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-3 gap-4 space-y-0"
        >
          {/* Full Name */}
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              type="tel"
              placeholder="+971501234567"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              required
            />
          </div>

          {/* Preferred Contact */}
          <div className="space-y-2">
            <Label>Preferred Contact</Label>
            <Select
              value={formData.preferredContactMethod}
              onValueChange={(v) => handleChange("preferredContactMethod", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="Phone">Phone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preferred Language */}
          <div className="space-y-2">
            <Label>Preferred Language</Label>
            <Input
              value={formData.preferredLanguage}
              onChange={(e) =>
                handleChange("preferredLanguage", e.target.value)
              }
            />
          </div>

          {/* Budget Range */}
          <div className="space-y-2">
            <Label>Budget Range</Label>
            <Input
              placeholder="AED 10000000"
              value={formData.budgetRange}
              onChange={(e) => handleChange("budgetRange", e.target.value)}
            />
          </div>

          {/* Location (Emirate) */}
          <div className="space-y-2">
            <Label>Location (Emirate)</Label>
            <Select
              value={formData.locationEmirate}
              onValueChange={(v) => handleChange("locationEmirate", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select emirate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dubai">Dubai</SelectItem>
                <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
                <SelectItem value="Sharjah">Sharjah</SelectItem>
                <SelectItem value="Ajman">Ajman</SelectItem>
                <SelectItem value="Umm Al Quwain">Umm Al Quwain</SelectItem>
                <SelectItem value="Ras Al Khaimah">Ras Al Khaimah</SelectItem>
                <SelectItem value="Fujairah">Fujairah</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location (Area) */}
          <div className="space-y-2">
            <Label>Location (Area)</Label>
            <Input
              value={formData.locationArea}
              onChange={(e) => handleChange("locationArea", e.target.value)}
            />
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label>Purpose</Label>
            <Select
              value={formData.purpose}
              onValueChange={(v) => handleChange("purpose", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Buy">Buy</SelectItem>
                <SelectItem value="Rent">Rent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Span */}
          <div className="space-y-2">
            <Label>Time Span</Label>
            <Select
              value={formData.timeSpan}
              onValueChange={(v) => handleChange("timeSpan", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time span" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Immediately">Immediately</SelectItem>
                <SelectItem value="0-3 months">0-3 months</SelectItem>
                <SelectItem value="3-6 months">3-6 months</SelectItem>
                <SelectItem value="6-12 months">6-12 months</SelectItem>
                <SelectItem value="12+ months">12+ months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pre-Approval Status */}
          <div className="space-y-2">
            <Label>Pre-Approval Status</Label>
            <Input
              placeholder="e.g., Pre-Approved, Not Pre-Approved, Cash Buyer"
              value={formData.preApprovalStatus}
              onChange={(e) => handleChange("preApprovalStatus", e.target.value)}
            />
          </div>

          {/* Tier */}
          <div className="space-y-2">
            <Label>Tier</Label>
            <Select
              value={formData.tier}
              onValueChange={(v) => handleChange("tier", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hot">Hot</SelectItem>
                <SelectItem value="Warm">Warm</SelectItem>
                <SelectItem value="Cold">Cold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Specific Requirements */}
          <div className="space-y-2 col-span-3">
            <Label>Specific Requirements</Label>
            <Textarea
              placeholder="Enter specific requirements, separated by commas"
              value={formData.specificRequirements}
              onChange={(e) =>
                handleChange("specificRequirements", e.target.value)
              }
              rows={4}
            />
          </div>


          {/* Buttons */}
          <div className="col-span-3 flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-primary hover:opacity-90"
            >
              {client ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientForm;
