import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Globe, Mail, Linkedin, UserCircle, Loader2, Building2, MapPin, Briefcase } from "lucide-react";

// --- Options ---
const jobTitles = [
    "Manager",
    "Project Manager",
    "Teacher",
    "Owner",
    "Student",
    "Director",
    "Software Engineer",
    "Consultant",
    "Account Manager",
    "Engineer",
    "Professor",
    "Sales Manager",
    "Sales",
    "Partner",
    "Associate",
    "President",
    "Administrative Assistant",
    "Supervisor",
    "General Manager",
    "Realtor",
];

const managementLevels = [
    "Owner",
    "Founder",
    "C-suite",
    "Partner",
    "VP",
    "Head",
    "Director",
    "Manager",
    "Senior",
    "Entry",
    "Intern",
];

const industries = [
    "Information Technology & Services",
    "Construction",
    "Marketing & Advertising",
    "Real Estate",
    "Health, Wellness & Fitness",
    "Management Consulting",
    "Computer Software",
    "Internet",
    "Retail",
    "Financial Services",
    "Consumer Services",
    "Hospital & Health Care",
    "Automotive",
    "Restaurants",
    "Education Management",
    "Food & Beverages",
    "Design",
    "Hospitality",
    "Accounting",
    "Events Services",
];

const predefinedLocations = [
    "United States",
    "Americas",
    "North America",
    "EMEA",
    "Dallas/Fort Worth Area",
    "Greater Houston Area",
    "Europe",
    "European Union",
    "Germany",
    "Miami/Fort Lauderdale Area",
    "California, US",
    "India",
    "United Kingdom",
    "Greater Denver Area",
    "San Francisco Bay Area",
    "Greater Los Angeles Area",
    "Greater Philadelphia Area",
    "Russia",
    "Texas, US",
    "Greater New York City Area",
];

const industryMap: Record<string, string> = {
  "information technology & services": "5567cd4773696439b10b0000",
  "construction": "5567cd4773696439dd350000",
  "marketing & advertising": "5567cd467369644d39040000",
  "real estate": "5567cd477369645401010000",
  "health, wellness & fitness": "5567cddb7369644d250c0000",
  "management consulting": "5567cdd47369643dbf260000",
  "computer software": "5567cd4e7369643b70010000",
  "internet": "5567cd4d736964397e020000",
  "retail": "5567ced173696450cb580000",
  "financial services": "5567cdd67369643e64020000",
  "consumer services": "5567d1127261697f2b1d0000",
  "hospital & health care": "5567cdde73696439812c0000",
  "automotive": "5567cdf27369644cfd800000",
  "restaurants": "5567e0e0736964198de70700",
  "education management": "5567ce9e736964540d540000",
  "food & beverages": "5567ce1e7369643b806a0000",
  "design": "5567cdbc73696439d90b0000",
  "hospitality": "5567ce9d7369643bc19c0000",
  "accounting": "5567ce1f7369643b78570000",
  "events services": "5567cd8e7369645409450000",
};


const SearchLeads = () => {
    const [selectedJobTitles, setSelectedJobTitles] = useState<string[]>([]);
    const [excludedTitles, setExcludedTitles] = useState<string[]>([]);
    const [includeSimilarTitles, setIncludeSimilarTitles] = useState(true);
    const [selectedManagementLevels, setSelectedManagementLevels] = useState<string[]>([]);
    const [locations, setLocations] = useState<string[]>([]);
    const [locationInput, setLocationInput] = useState("");
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // --- Handlers ---
    const handleAddJobTitle = (title: string) => {
        if (!selectedJobTitles.includes(title)) {
            setSelectedJobTitles((prev) => [...prev, title]);
        }
    };
    const handleRemoveJobTitle = (title: string) => {
        setSelectedJobTitles((prev) => prev.filter((t) => t !== title));
    };

    const handleAddExcludedTitle = (title: string) => {
        if (!excludedTitles.includes(title)) {
            setExcludedTitles((prev) => [...prev, title]);
        }
    };
    const handleRemoveExcludedTitle = (title: string) => {
        setExcludedTitles((prev) => prev.filter((t) => t !== title));
    };

    const handleAddManagementLevel = (level: string) => {
        if (!selectedManagementLevels.includes(level)) {
            setSelectedManagementLevels((prev) => [...prev, level]);
        }
    };
    const handleRemoveManagementLevel = (level: string) => {
        setSelectedManagementLevels((prev) => prev.filter((l) => l !== level));
    };

    const handleAddLocation = (location: string) => {
        const trimmed = location.trim();
        if (trimmed && !locations.some((l) => l.toLowerCase() === trimmed.toLowerCase())) {
            setLocations((prev) => [...prev, trimmed]);
        }
    };
    const handleRemoveLocation = (loc: string) => {
        setLocations((prev) => prev.filter((l) => l !== loc));
    };

    const handleAddIndustry = (industry: string) => {
        if (!selectedIndustries.includes(industry)) {
            setSelectedIndustries((prev) => [...prev, industry]);
        }
    };
    const handleRemoveIndustry = (industry: string) => {
        setSelectedIndustries((prev) => prev.filter((i) => i !== industry));
    };

    const handleClearFilters = () => {
        setSelectedJobTitles([]);
        setExcludedTitles([]);
        setIncludeSimilarTitles(false);
        setSelectedManagementLevels([]);
        setLocations([]);
        setLocationInput("");
        setSelectedIndustries([]);
    };

    const handleSearchLeads = async () => {
        setLoading(true);
        setLeads([]);
        
        let url = "https://app.apollo.io/#/people?page=1&sortByField=recommendations_score&sortAscending=false&contactEmailStatusV2[]=verified";

        // --- Job Titles ---
        selectedJobTitles.forEach((title) => {
            url += `&personTitles[]=${encodeURIComponent(title)}`;
        });

        // --- Excluded Titles ---
        excludedTitles.forEach((title) => {
            url += `&personTitlesNot[]=${encodeURIComponent(title)}`;
        });

        // --- Similar Titles ---
        if (!includeSimilarTitles) {
            url += `&includeSimilarTitles=false`;
        }

        // --- Management Levels ---
        selectedManagementLevels.forEach((level) => {
            url += `&personSeniorities[]=${encodeURIComponent(level.toLowerCase())}`;
        });

        // --- Locations ---
        locations.forEach((loc) => {
            url += `&personLocations[]=${encodeURIComponent(loc)}`;
        });

        // --- Industries ---
        selectedIndustries.forEach((industry) => {
            const id = industryMap[industry.toLowerCase()];
            if (id) url += `&organizationIndustryTagIds[]=${id}`;
        });

        console.log("Generated Apollo.io URL:", url);

         try {
            const response = await fetch("http://localhost:5000/api/search-leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();
            console.log("✅ Leads from backend:", data);

            if (data.success && data.leads) {
                setLeads(data.leads);
            }
            } catch (err) {
            console.error("❌ Error fetching leads:", err);
            } finally {
            setLoading(false);
        }
    };


    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header (matches Properties page tone) */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Search Leads</h1>
                        <p className="text-muted-foreground">
                            Build a precise people search using titles, seniority, location, and industry.
                        </p>
                    </div>
                    <div className="hidden md:block">
                        {/* Reserved for future quick actions or help */}
                    </div>
                </div>

                {/* Filter Bar Card */}
                <Card className="shadow-card hover:shadow-elevated transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl">Filter Criteria</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* FILTER GRID WITH CLEAN ALIGNMENT */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Job Title */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold">Job Title</Label>
                                <Select onValueChange={handleAddJobTitle}>
                                    <SelectTrigger className="w-full h-11">
                                        <SelectValue placeholder="Select job titles..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jobTitles.map((title) => (
                                            <SelectItem key={title} value={title}>{title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedJobTitles.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {selectedJobTitles.map((title) => (
                                            <Badge key={title} variant="secondary" className="px-3 py-1.5 text-sm">
                                                {title}
                                                <button aria-label={`Remove ${title}`} onClick={() => handleRemoveJobTitle(title)} className="ml-2 hover:text-destructive">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 pt-1">
                                    <Checkbox
                                        id="similar-titles"
                                        checked={includeSimilarTitles}
                                        onCheckedChange={(checked) => setIncludeSimilarTitles(!!checked)}
                                    />
                                    <Label htmlFor="similar-titles" className="text-sm font-normal cursor-pointer text-muted-foreground">
                                        Include people with similar titles
                                    </Label>
                                </div>
                            </div>

                            {/* Exclude Titles */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold">Exclude Titles</Label>
                                <Select onValueChange={handleAddExcludedTitle}>
                                    <SelectTrigger className="w-full h-11">
                                        <SelectValue placeholder="Select titles to exclude..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jobTitles.map((title) => (
                                            <SelectItem key={title} value={title}>{title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {excludedTitles.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {excludedTitles.map((title) => (
                                            <Badge key={title} variant="destructive" className="px-3 py-1.5 text-sm">
                                                {title}
                                                <button aria-label={`Remove ${title}`} onClick={() => handleRemoveExcludedTitle(title)} className="ml-2 hover:text-white">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Management Level */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold">Management Level</Label>
                                <Select onValueChange={handleAddManagementLevel}>
                                    <SelectTrigger className="w-full h-11">
                                        <SelectValue placeholder="Select management levels..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {managementLevels.map((level) => (
                                            <SelectItem key={level} value={level}>{level}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedManagementLevels.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {selectedManagementLevels.map((level) => (
                                            <Badge key={level} variant="secondary" className="px-3 py-1.5 text-sm">
                                                {level}
                                                <button aria-label={`Remove ${level}`} onClick={() => handleRemoveManagementLevel(level)} className="ml-2 hover:text-destructive">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Location */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold">Location</Label>
                                <Select 
                                    value=""
                                    onValueChange={(value) => {
                                        handleAddLocation(value);
                                        setLocationInput("");
                                    }}
                                >
                                    <SelectTrigger className="w-full h-11">
                                        <SelectValue placeholder="Search or select locations..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="px-2 pb-2 sticky top-0 bg-background z-10">
                                            <Input
                                                type="text"
                                                placeholder="Type to search..."
                                                value={locationInput}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    setLocationInput(e.target.value);
                                                }}
                                                onKeyDown={(e) => {
                                                    e.stopPropagation();
                                                    if (e.key === 'Enter' && locationInput.trim()) {
                                                        e.preventDefault();
                                                        handleAddLocation(locationInput);
                                                        setLocationInput("");
                                                    }
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                onFocus={(e) => e.stopPropagation()}
                                                className="h-9"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="max-h-[200px] overflow-y-auto">
                                            {predefinedLocations
                                                .filter((loc) =>
                                                    locationInput
                                                        ? loc.toLowerCase().includes(locationInput.toLowerCase())
                                                        : true
                                                )
                                                .map((loc) => (
                                                    <SelectItem key={loc} value={loc}>
                                                        {loc}
                                                    </SelectItem>
                                                ))}
                                            
                                            {locationInput && 
                                             !predefinedLocations.some(loc => 
                                                loc.toLowerCase() === locationInput.toLowerCase()
                                             ) && (
                                                <SelectItem value={locationInput.trim()}>
                                                    ➕ Add "{locationInput.trim()}"
                                                </SelectItem>
                                            )}
                                        </div>
                                    </SelectContent>
                                </Select>
                                {locations.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {locations.map((loc) => (
                                            <Badge key={loc} variant="outline" className="px-3 py-1.5 text-sm">
                                                {loc}
                                                <button 
                                                    aria-label={`Remove ${loc}`} 
                                                    onClick={() => handleRemoveLocation(loc)} 
                                                    className="ml-2 hover:text-destructive"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Industry */}
                            <div className="space-y-3 lg:col-span-2">
                                <Label className="text-sm font-semibold">Industry</Label>
                                <Select onValueChange={handleAddIndustry}>
                                    <SelectTrigger className="w-full h-11">
                                        <SelectValue placeholder="Select industries..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {industries.map((industry) => (
                                            <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedIndustries.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {selectedIndustries.map((industry) => (
                                            <Badge key={industry} variant="secondary" className="px-3 py-1.5 text-sm">
                                                {industry}
                                                <button aria-label={`Remove ${industry}`} onClick={() => handleRemoveIndustry(industry)} className="ml-2 hover:text-destructive">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>


                        {/* Actions aligned like the Properties CTA */}
                        <div className="flex flex-col md:flex-row gap-4 justify-end pt-2">
                            <Button
                                onClick={handleSearchLeads}
                                className="bg-gradient-primary hover:opacity-90"
                            >
                                Search
                            </Button>
                            <Button onClick={handleClearFilters} variant="outline">
                                Clear
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Placeholder for results grid (to mirror Properties list area) */}
                <Card className="shadow-card">
                    <CardHeader>
                        <CardTitle className="text-2xl">
                        {loading
                            ? "Loading leads..."
                            : leads.length
                            ? `Results (${leads.filter((lead) => lead.email).length})`
                            : "Search Results"}
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                            <p className="text-lg font-medium text-muted-foreground">Please wait...</p>
                        </div>
                        ) : leads.length === 0 ? (
                        <div className="text-center text-muted-foreground py-12">
                            Your filtered leads will appear here once you run a search.
                        </div>
                        ) : leads.filter((lead) => lead.email).length === 0 ? (
                        <div className="text-center text-muted-foreground py-12">
                            No leads with verified emails found for your filters.
                        </div>
                        ) : (
                        <div className="grid grid-cols-1 gap-4">
                             {leads
                            .filter((lead) => lead.email) // 👈 Only show leads that have an email
                            .map((lead) => (
                            <Card
                                key={lead.id}
                                className="shadow-sm hover:shadow-md transition-all duration-200 border"
                            >
                                <CardContent className="p-6">
                                <div className="flex gap-5">
                                    {/* Profile Photo */}
                                    <div className="flex-shrink-0">
                                    {lead.photo_url ? (
                                        <img
                                        src={lead.photo_url}
                                        alt={lead.name}
                                        className="w-20 h-20 rounded-full object-cover border-2 border-border"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full border-2 border-border flex items-center justify-center bg-muted">
                                        <UserCircle className="w-12 h-12 text-muted-foreground" />
                                        </div>
                                    )}
                                    </div>

                                    {/* Main Info */}
                                    <div className="flex-1 min-w-0">
                                    {/* Name & Title */}
                                    <div className="mb-3">
                                        <h3 className="text-xl font-semibold text-foreground mb-1">
                                        {lead.name}
                                        </h3>
                                        {lead.title && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Briefcase className="w-4 h-4 flex-shrink-0" />
                                            <span>{lead.title}</span>
                                        </div>
                                        )}
                                    </div>

                                    {/* Company */}
                                    {lead.organization?.name && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                        <Building2 className="w-4 h-4 flex-shrink-0" />
                                        <span className="font-medium">{lead.organization.name}</span>
                                        {lead.organization.industry && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                                            {lead.organization.industry}
                                            </span>
                                        )}
                                        </div>
                                    )}

                                    {/* Location */}
                                    {(lead.city || lead.state || lead.country) && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                        <span>
                                            {[lead.city, lead.state, lead.country]
                                            .filter(Boolean)
                                            .join(", ")}
                                        </span>
                                        </div>
                                    )}

                                    {/* Contact Info & Links */}
                                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t">
                                    {lead.email ? (
                                        <a
                                        href={`mailto:${lead.email}`}
                                        className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                                        >
                                        <Mail className="w-4 h-4" />
                                        {lead.email}
                                        </a>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-sm text-destructive">
                                        <X className="w-4 h-4" />
                                        <span>Email not available</span>
                                        </div>
                                    )}

                                    {lead.linkedin_url && (
                                        <a
                                        href={lead.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                                        >
                                        <Linkedin className="w-4 h-4" />
                                        LinkedIn
                                        </a>
                                    )}

                                    {lead.organization?.website_url && (
                                        <a
                                        href={lead.organization.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                                        >
                                        <Globe className="w-4 h-4 text-blue-600" />
                                        Company Website
                                        </a>
                                    )}
                                    </div>

                                    </div>
                                </div>
                                </CardContent>
                            </Card>
                            ))}
                        </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </DashboardLayout>
    );
};

export default SearchLeads;