import React, { useEffect, useState } from 'react';
import PublicNavbar from '@/components/layout/PublicNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, MessageCircle } from 'lucide-react';
import PropertiesList from '../components/modals/PropertiesList'; 

// 🔹 Utility to get or create a secure session ID (using sessionStorage)
function getOrCreateSessionId(): string {
  const key = 'visitorSessionId';
  let sessionId = sessionStorage.getItem(key);

  if (!sessionId) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      sessionId = crypto.randomUUID();
    } else {
      // fallback if randomUUID is unavailable
      sessionId = 'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
    sessionStorage.setItem(key, sessionId);
  }

  return sessionId;
}

const AIAssistant = () => {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // 1. Generate / retrieve session ID
    const id = getOrCreateSessionId();
    setSessionId(id);

    // 2. Inject ElevenLabs script once
    const scriptId = 'elevenlabs-convai-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-13 px">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-gradient-primary rounded-full flex items-center justify-center shadow-elevated">
                <Bot className="h-10 w-10 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              AI Real Estate Assistant
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Talk to our AI assistant to book property viewings, ask about listings,
              or get personalized real estate advice. Available 24/7 to help you.
            </p>
          </div>

          {/* Instructions */}
          <Card className="mb-8 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="mr-2 h-5 w-5 text-primary" />
                How to Get Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4 list-decimal list-inside">
                <li>Click the microphone button to start a conversation</li>
                <li>Ask about properties, schedule viewings, or get advice</li>
                <li>Receive personalized recommendations instantly</li>
              </ol>
            </CardContent>
          </Card>

          {/* Sample Questions */}
          <Card className="mt-8 shadow-card">
            <CardHeader>
              <CardTitle>Sample Questions to Ask</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-foreground">Property Search</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>"Show me 3-bedroom houses under $500,000"</li>
                    <li>"Find condos near downtown with parking"</li>
                    <li>"What's available in the Maple Heights area?"</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Scheduling & Support</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>"Schedule a viewing for this weekend"</li>
                    <li>"What's the market value of my home?"</li>
                    <li>"Connect me with an agent in my area"</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Assistant Widget */}
          <Card className="mt-8 max-w-[1000px] mx-auto z-0">
            <CardContent className="p-0">      
              <div className="w-full flex justify-center">
                {sessionId && (
                  <elevenlabs-convai
                    agent-id="agent_5401k30w692me5yb1yqjgevzabp2"
                    style={{
                      position: "relative",
                      width: "100%",
                      maxWidth: "1000px",
                      height: "550px",
                      zIndex: 20,
                    }}
                    dynamic-variables={JSON.stringify({ sessionId })}
                  />
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
