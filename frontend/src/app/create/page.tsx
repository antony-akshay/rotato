"use client";

import { useState } from "react";
import CreateChittyForm from "@/components/CreateChittyForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalculatorIcon } from "@heroicons/react/24/outline";

const CreatePage = () => {
  const [formData, setFormData] = useState({
    schemeName: "",
    monthlyAmount: "",
    totalCycles: "",
    maxMembers: "",
  });

  const calculateTotalPool = () => {
    const amount = parseFloat(formData.monthlyAmount) || 0;
    const members = parseInt(formData.maxMembers) || 0;
    return amount * members;
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Chitty Scheme</h1>
        <p className="text-secondary-foreground">
          Set up your chit fund with custom parameters and invite members to join
        </p>
      </div>

      {/* Form + Summary */}
      <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Form */}
        <div className="flex-1">
          <CreateChittyForm formData={formData} setFormData={setFormData} />
        </div>

        {/* Summary */}
        <div className="flex-1 space-y-6">
          <Card className="border border-secondary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalculatorIcon className="w-5 h-5 text-accent" />
                Scheme Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground">
              <div className="flex justify-between">
                <span>Monthly Contribution</span>
                <span>₹{formData.monthlyAmount || "0"}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Pool Value</span>
                <span>₹{calculateTotalPool()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Cycles</span>
                <span>{formData.totalCycles || "0"}</span>
              </div>
              <div className="flex justify-between">
                <span>Max Members</span>
                <span>{formData.maxMembers || "0"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
