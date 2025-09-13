import React from 'react';
import PublicNavbar from '@/components/layout/PublicNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, MessageCircle, Mic } from 'lucide-react';

const AIAssistant = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
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
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Click the microphone button</h4>
                    <p className="text-muted-foreground">Start a voice conversation with our AI assistant</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Ask your questions</h4>
                    <p className="text-muted-foreground">Inquire about properties, schedule viewings, or get market insights</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Get instant assistance</h4>
                    <p className="text-muted-foreground">Receive personalized recommendations and next steps</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Assistant Widget Placeholder */}
          <Card className="shadow-elevated">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="h-24 w-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mic className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">
                  Voice Assistant Coming Soon
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Our ElevenLabs-powered voice assistant will be integrated here. 
                  You'll be able to have natural conversations about real estate needs.
                </p>
                <div className="bg-muted rounded-lg p-6">
                  <p className="text-sm text-muted-foreground">
                    <strong>Integration Note:</strong> This is where the ElevenLabs 
                    Conversational AI widget will be embedded for voice interactions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sample Questions */}
          <Card className="mt-8 shadow-card">
            <CardHeader>
              <CardTitle>Sample Questions to Ask</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Property Search</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>"Show me 3-bedroom houses under $500,000"</li>
                    <li>"Find condos near downtown with parking"</li>
                    <li>"What's available in the Maple Heights area?"</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Scheduling & Support</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>"Schedule a viewing for this weekend"</li>
                    <li>"What's the market value of my home?"</li>
                    <li>"Connect me with an agent in my area"</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;