import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '@/components/layout/PublicNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Bot, 
  Users, 
  Building2, 
  TrendingUp, 
  Phone, 
  Mail, 
  MapPin,
  Star,
  CheckCircle
} from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Your Trusted Real Estate Partner
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Experience seamless property management with our innovative AI-powered platform. 
            We connect buyers, sellers, and agents for exceptional real estate experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/assistant">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90">
                <Bot className="mr-2 h-5 w-5" />
                Try AI Assistant
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">
                <Phone className="mr-2 h-5 w-5" />
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose RealtyCo?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We leverage cutting-edge technology and personalized service to deliver 
              outstanding results for all your real estate needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Expert Agents</h3>
                <p className="text-muted-foreground">
                  Our experienced agents provide personalized guidance throughout 
                  your real estate journey.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Premium Properties</h3>
                <p className="text-muted-foreground">
                  Access exclusive listings and premium properties across 
                  the most desirable locations.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Market Insights</h3>
                <p className="text-muted-foreground">
                  Stay informed with real-time market data and trends to make 
                  confident investment decisions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Meet Your AI Real Estate Assistant
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Our advanced AI assistant is available 24/7 to help you with property searches, 
                schedule viewings, answer questions, and guide you through every step of your 
                real estate journey.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">Instant Property Search</h4>
                    <p className="text-muted-foreground">Find properties matching your criteria instantly</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">Schedule Viewings</h4>
                    <p className="text-muted-foreground">Book property viewings at your convenience</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">Market Analysis</h4>
                    <p className="text-muted-foreground">Get detailed market insights and property valuations</p>
                  </div>
                </div>
              </div>

              <Link to="/assistant">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90">
                  <Bot className="mr-2 h-5 w-5" />
                  Start Conversation
                </Button>
              </Link>
            </div>

            <div className="lg:pl-8">
              <Card className="shadow-elevated">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
                      <Bot className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">AI Assistant</h4>
                      <p className="text-sm text-muted-foreground">Online now</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-secondary p-3 rounded-lg">
                      <p className="text-sm text-foreground">
                        "Hello! I'm here to help you find your perfect property. 
                        Would you like to start with a search or schedule a viewing?"
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-xs">
                        <p className="text-sm">
                          "I'm looking for a 3-bedroom house under $500k"
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-foreground">RealtyCo</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Your trusted partner in real estate, powered by innovation and 
                driven by exceptional service.
              </p>
              <div className="flex space-x-4">
                <Star className="h-5 w-5 text-warning" />
                <Star className="h-5 w-5 text-warning" />
                <Star className="h-5 w-5 text-warning" />
                <Star className="h-5 w-5 text-warning" />
                <Star className="h-5 w-5 text-warning" />
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact Info</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">(555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">info@realtyco.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">123 Main St, City, State 12345</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link to="/assistant" className="block text-muted-foreground hover:text-primary transition-colors">
                  AI Assistant
                </Link>
                <Link to="/contact" className="block text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
                <Link to="/login" className="block text-muted-foreground hover:text-primary transition-colors">
                  Agent Login
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground">
              © 2024 RealtyCo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;