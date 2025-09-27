"use client";

import ChittySchemeCard from "@/components/ChittySchemeCard";
import JoinChittyCard from "@/components/JoinChittyCard";
import { Button } from "@/components/ui/button";
import { ArrowBigLeft } from "lucide-react";
import { useState } from "react";

const Browse = () => {
    const chitties = [{
        chitty_name: "Dream Home Fund",
        owner: "0xAbC123...456",
        totalCycles: 12,
        monthly_amount: 5000,
        contribute_amount: 1000,
    },
    {
        chitty_name: "Vacation Club",
        owner: "0x9fD234...789",
        totalCycles: 6,
        monthly_amount: 3000,
        contribute_amount: 1500,
    },
    {
        chitty_name: "Emergency Safety Net",
        owner: "0x7eE987...321",
        totalCycles: 24,
        monthly_amount: 2000,
        contribute_amount: 500,
    },
    {
        chitty_name: "Education Savings",
        owner: "0x5AaB44...222",
        totalCycles: 18,
        monthly_amount: 7000,
        contribute_amount: 2000,
    },
  ];

  const [selectedChitty, setSelectedChitty] = useState<string | null>(null);


  return (
    <div className="container mx-auto px-4 py-8">
      {!selectedChitty ? (
        <div>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Browse Chitties
            </h1>
            <p className="text-muted-foreground text-lg">
              Join active chitty pools and grow your investments with the community
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {chitties.map((chitty, idx) => (
              <JoinChittyCard
                key={idx}
                {...chitty}
                onCardClick={() => setSelectedChitty(chitty.chitty_name)}
                onJoinClick={() => alert(`Joined ${chitty.chitty_name}`)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex">
          <Button
            onClick={() => setSelectedChitty(null)}
            className="mb-6 px-4 py-2 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-600 transition"
          >
            <ArrowBigLeft className="w-5 h-5 mr-2"/> Back to Chitties
          </Button>
          
          <ChittySchemeCard />
        </div>
      )}
    </div>
  );
};

export default Browse;