"use client";

import Link from "next/link";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { CheckCircle, Clock, Coins, Shield, TrendingUp, Users } from "lucide-react";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const features = [
    {
      icon: Shield,
      title: "Blockchain Secured",
      description: "Smart contracts ensure transparent and secure transactions",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join trusted groups and build wealth together",
    },
    {
      icon: TrendingUp,
      title: "Guaranteed Returns",
      description: "Predictable payouts with competitive interest rates",
    },
    {
      icon: Clock,
      title: "Flexible Duration",
      description: "Choose from 3 to 60 month investment periods",
    },
  ];

  const benefits = [
    "No hidden fees or charges",
    "Automated smart contract execution",
    "Transparent blockchain records",
    "Multi-signature security",
    "Instant payout distribution",
    "Community governance",
  ];

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                The Future of <span className="text-primary block">Community Finance</span>
              </h1>
              <p className="text-xl text-base-content/70 mb-8 leading-relaxed">
                Join blockchain-powered chitty funds that combine traditional savings with modern security. Create or
                join trusted investment circles and grow your wealth together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/browse">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent border border-border hover:opacity-90"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Browse Chitties
                  </Button>
                </Link>
                <Link href="/create">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:text-accent-content"
                  >
                    <Coins className="w-5 h-5 mr-2" />
                    Create Chitty
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose ChittyChain?</h2>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              Experience the perfect blend of traditional chitty funds with blockchain innovation
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-base-200 border border-border shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105"
              >
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary-content" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base-content/70 text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">Simple steps to start your chitty journey</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["Create or Join", "Contribute Monthly", "Receive Payouts"].map((title, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent border border-border rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary-content">{index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">{title}</h3>
                <p className="text-base-content/70">
                  {
                    [
                      "Create your own chitty pool or browse and join existing ones that match your investment goals",
                      "Make regular monthly contributions to the shared pool through secure smart contracts",
                      "Get your turn to receive the full pool amount plus interest, distributed automatically",
                    ][index]
                  }
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Platform Benefits</h2>
              <p className="text-xl text-base-content/70">
                Everything you need for secure and profitable chitty investments
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0" />
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-base-200">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-base-content/70 mb-8 max-w-2xl mx-auto">
            Join thousands of users already building wealth through our secure blockchain chitty platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent border border-border hover:opacity-90"
              >
                Explore Chitties
              </Button>
            </Link>
            <Link href="/create">
              <Button
                size="lg"
                variant="outline"
                className="border-accent text-accent hover:bg-accent hover:text-accent-content"
              >
                Start Your Chitty
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
