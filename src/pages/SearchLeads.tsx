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
import { X } from "lucide-react";

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

const SearchLeads = () => {
    const [selectedJobTitles, setSelectedJobTitles] = useState<string[]>([]);
    const [excludedTitles, setExcludedTitles] = useState<string[]>([]);
    const [includeSimilarTitles, setIncludeSimilarTitles] = useState(false);
    const [managementLevel, setManagementLevel] = useState("");
    const [locations, setLocations] = useState<string[]>([]);
    const [locationInput, setLocationInput] = useState("");
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

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

    const handleAddLocation = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && locationInput.trim()) {
            e.preventDefault();
            const val = locationInput.trim();
            if (!locations.some((l) => l.toLowerCase() === val.toLowerCase())) {
                setLocations((prev) => [...prev, val]);
            }
            setLocationInput("");
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
        setManagementLevel("");
        setLocations([]);
        setLocationInput("");
        setSelectedIndustries([]);
    };

    const handleSearchLeads = () => {
        const payload = {
            includeTitles: selectedJobTitles,
            excludeTitles: excludedTitles,
            includeSimilar: includeSimilarTitles,
            managementLevel,
            locations,
            industries: selectedIndustries,
        };
        console.log("Searching leads with filters:", payload);
        // Wire to your API here
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
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                            {/* Job Title (1–4) */}
                            <div className="md:col-span-4 space-y-2">
                                <Label className="text-sm font-medium">Job Title</Label>
                                <Select onValueChange={handleAddJobTitle}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select job titles..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jobTitles.map((title) => (
                                            <SelectItem key={title} value={title}>{title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {/* chips */}
                                {selectedJobTitles.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {selectedJobTitles.map((title) => (
                                            <Badge key={title} variant="secondary" className="px-3 py-1 text-sm">
                                                {title}
                                                <button aria-label={`Remove ${title}`} onClick={() => handleRemoveJobTitle(title)} className="ml-2 hover:text-destructive">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Exclude Titles (5–8) */}
                            <div className="md:col-span-4 space-y-2">
                                <Label className="text-sm font-medium">Exclude Titles</Label>
                                <Select onValueChange={handleAddExcludedTitle}>
                                    <SelectTrigger className="w-full">
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
                                            <Badge key={title} variant="destructive" className="px-3 py-1 text-sm">
                                                {title}
                                                <button aria-label={`Remove ${title}`} onClick={() => handleRemoveExcludedTitle(title)} className="ml-2 hover:text-white">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Management Level (9–12) */}
                            <div className="md:col-span-4 space-y-2">
                                <Label className="text-sm font-medium">Management Level</Label>
                                <Select value={managementLevel} onValueChange={setManagementLevel}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select management level..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {managementLevels.map((level) => (
                                            <SelectItem key={level} value={level}>{level}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Include similar (under Job Title: 1–4) */}
                            <div className="md:col-span-4 flex items-center gap-2">
                                <Checkbox
                                    id="similar-titles"
                                    checked={includeSimilarTitles}
                                    onCheckedChange={(checked) => setIncludeSimilarTitles(!!checked)}
                                />
                                <Label htmlFor="similar-titles" className="text-sm font-normal cursor-pointer">
                                    Include people with similar titles
                                </Label>
                            </div>

                            {/* Location (5–8) */}
                            <div className="md:col-span-4 space-y-2">
                                <Label className="text-sm font-medium">Location</Label>
                                <div className="flex gap-2">
                                    {/* Search Input */}
                                    <Input
                                        type="text"
                                        placeholder="Search locations..."
                                        value={locationInput}
                                        onChange={(e) => setLocationInput(e.target.value)}
                                        className="flex-1"
                                    />
                                    
                                    {/* Dropdown with filtered results */}
                                    <Select 
                                        onValueChange={(value) => {
                                            if (!locations.some((l) => l.toLowerCase() === value.toLowerCase())) {
                                                setLocations((prev) => [...prev, value]);
                                            }
                                            setLocationInput(""); // Clear search after selection
                                        }}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Or select..." />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                            
                                            {/* Add custom location option if search doesn't match */}
                                            {locationInput && 
                                             !predefinedLocations.some(loc => 
                                                loc.toLowerCase().includes(locationInput.toLowerCase())
                                             ) && (
                                                <SelectItem value={locationInput.trim()}>
                                                    ➕ Add "{locationInput.trim()}"
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            
                                {locations.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {locations.map((loc) => (
                                            <Badge key={loc} variant="outline" className="px-3 py-1 text-sm">
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

                            {/* Industry (9–12) */}
                            <div className="md:col-span-4 space-y-2">
                                <Label className="text-sm font-medium">Industry</Label>
                                <Select onValueChange={handleAddIndustry}>
                                    <SelectTrigger className="w-full">
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
                                            <Badge key={industry} variant="secondary" className="px-3 py-1 text-sm">
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
                                Search Leads
                            </Button>
                            <Button onClick={handleClearFilters} variant="outline">
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Placeholder for results grid (to mirror Properties list area) */}
                <Card className="shadow-card">
                    <CardContent className="p-12 text-center text-muted-foreground">
                        Your filtered leads will appear here once you connect the search API.
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default SearchLeads;
