import React, { useEffect, useMemo, useState } from "react";
import { PanelsTopLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  MapPin,
  Building2,
  Check,
  List,
  Grid3X3,
  Search,
  CheckCircle2,
  XCircle,
  Info,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type StreamProperty = {
  _id: string;
  title: string;
  community: string;
  subCommunity?: string;
  price: number;
  status?: string;
  assignedAgent: string;
  cover_photo?: string;
  emirate: string;
  amenities: string[];
  type?: string;
};

type StreamEnvelope = {
  Properties: StreamProperty[];
  SessionId: string;
  Details?: Record<string, any>;
};

interface PropertiesListProps {
  visitorSessionId: string;
}

// 🔧 Replace with your real n8n webhook URL
const N8N_WEBHOOK_URL =
  "https://n8n.inlogic.ae/webhook-test/9c3f62e6-c0cf-4b50-aafc-b212925fd8bb";

type Notice =
  | { kind: "success"; msg: string }
  | { kind: "error"; msg: string }
  | { kind: "info"; msg: string }
  | null;

const PropertiesList: React.FC<PropertiesListProps> = ({ visitorSessionId }) => {
  // Raw SSE envelope (kept intact)
  const [rawEnvelope, setRawEnvelope] = useState<StreamEnvelope | null>(null);
  const [outerModalOpen, setOuterModalOpen] = useState(false);

  // UI state
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [chosenDates, setChosenDates] = useState<Record<string, string>>({});
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectMode, setSelectMode] = useState(false);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] =
    useState<"newest" | "price_asc" | "price_desc">("newest");
  const [modalOpen, setModalOpen] = useState(false);
  const [focused, setFocused] = useState<StreamProperty | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [submissionComplete, setSubmissionComplete] = useState(false);


  const handleDateChange = (agentId: string, date: string) => {
  setChosenDates((prev) => ({ ...prev, [agentId]: date }));
};


  // --- SSE hookup: parse ARRAY payload and match SessionId ---
  useEffect(() => {
    const evtSource = new EventSource(
      "https://real-estate-prototype.onrender.com/stream"
    );

    evtSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const envelopes: StreamEnvelope[] = Array.isArray(parsed) ? parsed : [parsed];

        // Only pick envelope matching current visitorSessionId
        const matched = envelopes.find((e) => e.SessionId === visitorSessionId);

        if (matched) {
          setRawEnvelope(matched);
          setOuterModalOpen(false);
          // small delay so the dialog re-mounts cleanly
          setTimeout(() => setOuterModalOpen(true), 80);

          // If properties are empty, show an info notice
          if (!matched.Properties || matched.Properties.length === 0) {
            setNotice({
              kind: "info",
              msg: "Your details have been sent to an agent. You’ll see properties here as soon as they’re shared.",
            });
          } else {
            setNotice(null); // clear old info if we now have results
          }
        }
        // else do nothing → no matching session, no properties shown
      } catch (err) {
        console.error("SSE parse error", err);
      }
    };

    return () => evtSource.close();
  }, [visitorSessionId]);


  // Derive list for UI (we keep raw untouched; only map _id→id for React keys)
  const propertiesForUI = useMemo(() => {
    if (!rawEnvelope?.Properties) return [];
    return rawEnvelope.Properties.map((p) => ({
      ...p,
      id: p._id, // for selection and React keys
    }));
  }, [rawEnvelope]);

  // Search + sort
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = propertiesForUI.filter((p) => {
      if (!q) return true;
      const hay = `${p.title} ${p.community} ${p.subCommunity ?? ""} ${
        p.emirate
      } ${p.type ?? ""}`.toLowerCase();
      return hay.includes(q);
    });

    switch (sortBy) {
      case "price_asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      default:
        // newest -> keep stream order
        break;
    }
    return list;
  }, [propertiesForUI, query, sortBy]);

  // If we never got an envelope yet, don’t render anything
  if (!rawEnvelope) return null;

  const selectedRaw: StreamProperty[] = rawEnvelope.Properties?.filter((p) =>
    selectedPropertyIds.includes(p._id)
  ) ?? [];

  const uniqueAgents = new Set(selectedRaw.map((p) => p.assignedAgent)).size;

  const togglePropertySelection = (id: string) => {
    setSelectedPropertyIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Build and send EXACT payload (no mock/defaults)
  const handleRequestMeeting = async () => {
    if (selectedRaw.length === 0) {
      setNotice({ kind: "error", msg: "Select at least one property first." });
      return;
    }
    

    // Validate that all agents have a date selected
    const agentIds = Array.from(new Set(selectedRaw.map((p) => p.assignedAgent)));
    for (const agentId of agentIds) {
      if (!chosenDates[agentId]) {
        setNotice({ kind: "error", msg: "Please choose a date for each agent." });
        return;
      }
    }

    // Convert all dates to DD-MM-YYYY
    const ChosenDates: Record<string, string> = {};
    for (const [agentId, yyyyMmDd] of Object.entries(chosenDates)) {
      const [yyyy, mm, dd] = yyyyMmDd.split("-");
      ChosenDates[agentId] = `${dd}-${mm}-${yyyy}`;
    }


    const payload = [
      {
        InterestedProperties: selectedRaw, // exact objects from stream
        ChosenDates,
        SessionId: rawEnvelope.SessionId, // from stream
        Details: rawEnvelope.Details ?? {}, // from stream (no defaults)
      },
    ];

    try {
      setSubmitting(true);
      setNotice({
        kind: "info",
        msg: "Sending your request to the agent…",
      });

      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Webhook error:", text);
        setNotice({
          kind: "error",
          msg:
            "Couldn’t send your meeting request. Please try again.",
        });
        return;
      }

     setNotice({
      kind: "success",
      msg: "Request sent! An agent will follow up with you shortly.",
    });

    // Reset selection state only
    setSelectMode(false);
    setSelectedPropertyIds([]);
    setChosenDates({});

    // Mark that submission finished
    setSubmissionComplete(true);


    } catch (err) {
      console.error(err);
      setNotice({
        kind: "error",
        msg: "Network error. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Inline notice banner
  const NoticeBar = ({ notice }: { notice: Notice }) => {
    if (!notice) return null;
    const base =
      "mx-5 mb-3 mt-3 rounded-lg border p-3 text-sm flex items-start gap-2";
    if (notice.kind === "success") {
      return (
        <div className={`${base} border-green-200 bg-green-50 text-green-800`}>
          <CheckCircle2 className="h-4 w-4 mt-0.5" />
          <div className="flex-1">{notice.msg}</div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setNotice(null)}
            className="h-7"
          >
            Dismiss
          </Button>
        </div>
      );
    }
    if (notice.kind === "error") {
      return (
        <div className={`${base} border-red-200 bg-red-50 text-red-800`}>
          <XCircle className="h-4 w-4 mt-0.5" />
          <div className="flex-1">{notice.msg}</div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setNotice(null)}
            className="h-7"
          >
            Dismiss
          </Button>
        </div>
      );
    }
    // info
    return (
      <div className={`${base} border-blue-200 bg-blue-50 text-blue-800`}>
        <Info className="h-4 w-4 mt-0.5" />
        <div className="flex-1">{notice.msg}</div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setNotice(null)}
          className="h-7"
        >
          Dismiss
        </Button>
      </div>
    );
  };

  return (
  <>
    {/* Outer Modal */}
    <Dialog
      open={outerModalOpen}
      onOpenChange={(open) => {
        setOuterModalOpen(open);
        if (!open && submissionComplete) {
          // User closed after submission → reset everything
          sessionStorage.removeItem("visitorSessionId");
          setRawEnvelope(null);
          setSubmissionComplete(false); // reset flag
        }
      }}
    >
      <DialogContent className="max-w-6xl max-h-[88vh] p-0 overflow-hidden rounded-2xl border shadow-2xl">
        {/* Sticky toolbar */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/70 border-b">
          <DialogHeader className="px-5 pt-5 pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-extrabold tracking-tight">
                  Available Properties
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""} •{" "}
                  {selectMode
                    ? `${selectedPropertyIds.length} selected`
                    : " Select properties to request a meeting"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, area, type..."
                    className="pl-8 w-56"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                <select
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="newest">Sort: Newest</option>
                  <option value="price_asc">Sort: Price (Low → High)</option>
                  <option value="price_desc">Sort: Price (High → Low)</option>
                </select>

                <div className="flex items-center rounded-md border overflow-hidden">
                  <Button
                    variant="secondary"
                    className="h-9 rounded-none"
                    onClick={() => setView("grid")}
                    title="Grid view"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-9 rounded-none"
                    onClick={() => setView("list")}
                    title="List view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant={selectMode ? "secondary" : "default"}
                  onClick={() => {
                    setSelectMode((s) => !s);
                    if (selectMode) setSelectedPropertyIds([]);
                  }}
                >
                  {selectMode ? "Cancel Selection" : "Select"}
                </Button>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Inline notice bar */}
        <NoticeBar notice={notice} />

        {/* Content area */}
        <div className="px-5 pb-5 pt-2 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex items-center gap-2 rounded-lg border bg-card px-4 py-3 shadow-sm">
                <Info className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-muted-foreground">
                  {rawEnvelope.Properties?.length
                    ? "No matches for your search. Try adjusting filters."
                    : "Your details have been sent to an agent. You’ll see properties here as soon as they’re shared."}
                </span>
              </div>
              <p className="text-lg font-semibold">No properties to show</p>
              <p className="text-sm text-muted-foreground">
                Refine your search or check back soon.
              </p>
            </div>
          ) : view === "grid" ? (
            // Centered, responsive grid that expands as more cards arrive
            <div className="flex w-full justify-center">
              <div className="w-full max-w-5xl">
                <div className="grid gap-6 justify-center [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
                  {filtered.map((prop) => {
                    const isSelected = selectedPropertyIds.includes(prop.id);
                    return (
                      <div
                        key={prop.id}
                        className={`group relative w-full max-w-[380px] mx-auto overflow-hidden rounded-xl border bg-card shadow-sm transition hover:shadow-xl ${
                          isSelected ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() =>
                          selectMode
                            ? togglePropertySelection(prop.id)
                            : (setFocused(prop as any), setModalOpen(true))
                        }
                      >
                        {/* Image */}
                        <div className="relative">
                          <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
                            {prop.cover_photo ? (
                              <img
                                src={prop.cover_photo}
                                alt={prop.title}
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                No image
                              </div>
                            )}
                          </div>

                          {/* Top-left badges */}
                          <div className="absolute left-3 top-3 flex gap-2">
                            {prop.type && (
                              <Badge className="backdrop-blur bg-white/80 text-foreground">
                                {prop.type}
                              </Badge>
                            )}
                            {prop.status && (
                              <Badge variant="secondary" className="backdrop-blur">
                                {prop.status}
                              </Badge>
                            )}
                          </div>

                          {/* Top-right selection dot */}
                          {selectMode && (
                            <div className="absolute right-3 top-3">
                              <div
                                className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                                  isSelected
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "border-white/80 bg-white/80"
                                }`}
                              >
                                {isSelected && <Check className="h-4 w-4" />}
                              </div>
                            </div>
                          )}

                          {/* Bottom gradient */}
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="pointer-events-none absolute bottom-3 left-3 text-white drop-shadow">
                            <p className="text-xs opacity-90">
                              {prop.community}
                              {prop.subCommunity ? ` · ${prop.subCommunity}` : ""} · {prop.emirate}
                            </p>
                            <h3 className="text-base font-semibold line-clamp-1">
                              {prop.title}
                            </h3>
                          </div>
                        </div>

                        {/* Body */}
                        <div className="p-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-base font-semibold text-foreground">
                              AED {prop.price.toLocaleString()}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {prop.amenities?.slice(0, 3).map((a) => (
                              <Badge key={a} variant="outline" className="text-xs">
                                {a}
                              </Badge>
                            ))}
                            {prop.amenities && prop.amenities.length > 3 && (
                              <Badge variant="secondary" className="text-xs opacity-80">
                                +{prop.amenities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            // List view
            <div className="space-y-4">
              {filtered.map((prop) => {
                const isSelected = selectedPropertyIds.includes(prop.id);
                return (
                  <div
                    key={prop.id}
                    className={`flex gap-4 rounded-xl border bg-card p-3 shadow-sm transition hover:shadow-lg ${
                      isSelected ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() =>
                      selectMode
                        ? togglePropertySelection(prop.id)
                        : (setFocused(prop as any), setModalOpen(true))
                    }
                  >
                    <div className="h-28 w-40 overflow-hidden rounded-lg bg-muted">
                      {prop.cover_photo ? (
                        <img
                          src={prop.cover_photo}
                          alt={prop.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{prop.title}</h3>
                        {prop.type && <Badge variant="outline">{prop.type}</Badge>}
                        {prop.status && <Badge variant="secondary">{prop.status}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {prop.community}
                        {prop.subCommunity ? ` · ${prop.subCommunity}` : ""} · {prop.emirate}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">
                          AED {prop.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {prop.amenities?.slice(0, 4).map((a) => (
                          <Badge key={a} variant="outline" className="text-xs">
                            {a}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {selectMode && (
                      <div className="flex items-start pt-1">
                        <div
                          className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground"
                          }`}
                        >
                          {isSelected && <Check className="h-4 w-4" />}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Selection bar */}
          {selectMode && selectedPropertyIds.length > 0 && (
            <div className="sticky bottom-3 mt-6 rounded-xl border bg-background/80 backdrop-blur p-3 shadow-lg">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-3 w-full">
                  <p className="text-sm">
                    Selected <b>{selectedPropertyIds.length}</b> properties •{" "}
                    <b>{uniqueAgents}</b> {uniqueAgents === 1 ? "agent" : "agents"}
                  </p>
                  <div className="flex flex-row flex-wrap gap-3 -mt-1">
                    {Array.from(new Set(selectedRaw.map((p) => p.assignedAgent))).map(
                      (agentId) => (
                        <Input
                          key={agentId}
                          type="date"
                          value={chosenDates[agentId] ?? ""}
                          onChange={(e) => handleDateChange(agentId, e.target.value)}
                          className="h-9 w-44"
                        />
                      )
                    )}
                  </div>
                  <Button onClick={handleRequestMeeting} disabled={submitting} className="mt-2">
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Sending…
                      </>
                    ) : (
                      "Request Meetings"
                    )}
                  </Button>
                </div>

              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>

    {/* Reopen FAB (outside the Dialog so it renders when closed) */}
    {!outerModalOpen && rawEnvelope?.Properties?.length > 0 && (
      <div className="fixed bottom-5 right-5 z-50">
        <Button
          onClick={() => setOuterModalOpen(true)}
          className="shadow-lg h-11 px-4 rounded-full"
          aria-label="Reopen Available Properties"
          title="Reopen Available Properties"
        >
          <PanelsTopLeft className="h-4 w-4 mr-2" />
          Open Properties ({rawEnvelope.Properties.length})
        </Button>
      </div>
    )}

    {/* Property Detail Modal */}
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-lg rounded-2xl shadow-2xl">
        {focused && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {focused.title}
              </DialogTitle>
            </DialogHeader>

            {focused.cover_photo && (
              <img
                src={focused.cover_photo}
                alt={focused.title}
                className="w-full h-72 object-cover rounded-lg mb-6"
              />
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-4">
                <div className="flex items-center text-muted-foreground">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  <span className="font-semibold text-foreground">
                    AED {focused.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  <span>
                    {focused.community}
                    {focused.subCommunity ? ` - ${focused.subCommunity}` : ""} ({focused.emirate})
                  </span>
                </div>
                {focused.type && (
                  <div className="flex items-center text-muted-foreground">
                    <Building2 className="h-5 w-5 mr-2 text-purple-600" />
                    <span>{focused.type}</span>
                  </div>
                )}
              </div>

              {/* Right column */}
              <div>
                {focused.amenities?.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-foreground mb-2">
                      Amenities
                    </h4>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
                      {focused.amenities.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  </>
);

};

export default PropertiesList;
