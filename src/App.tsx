import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Home from "./pages/Home";
import AIAssistant from "./pages/AIAssistant";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Agents from "./pages/Agents";
import Clients from "./pages/Clients";
import Properties from "./pages/Properties";
import NotFound from "./pages/NotFound";
import SearchLeads from "./pages/SearchLeads";
import Campaigns from "./pages/Campaigns";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/assistant" element={<AIAssistant />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard/agents" element={<Agents />} />
              <Route path="/dashboard/clients" element={<Clients />} />
              <Route path="/dashboard/properties" element={<Properties />} />
              <Route path="/dashboard/search-leads" element={<SearchLeads />} />
              <Route path="/dashboard/campaigns" element={<Campaigns />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
