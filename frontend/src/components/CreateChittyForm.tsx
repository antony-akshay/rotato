"use client";

import React, { useState } from "react";
import {
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  AdjustmentsVerticalIcon as TargetIcon,
} from "@heroicons/react/24/outline";

interface FormData {
  schemeName: string;
  monthlyAmount: string;
  totalCycles: string;
  maxMembers: string;
}

interface CreateChittyFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const CreateChittyForm: React.FC<CreateChittyFormProps> = ({ formData, setFormData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setSubmitSuccess(true);
      setFormData({
        schemeName: "",
        monthlyAmount: "",
        totalCycles: "",
        maxMembers: "",
      });
      setIsSubmitting(false);
      setTimeout(() => setSubmitSuccess(false), 2000);
    }, 1000);
  };

  return (
    <div className="rounded-lg shadow-lg border bg-gray-800 border-gray-700 p-6 space-y-6">
      {/* Scheme Name */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-200">Scheme Name *</label>
        <input
          type="text"
          name="schemeName"
          value={formData.schemeName}
          onChange={handleInputChange}
          placeholder="e.g., Monthly Savings Circle"
          className="w-full px-4 py-3 rounded-lg border bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-200 focus:outline-none"
        />
      </div>

      {/* Monthly Amount */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-200">
          Monthly Contribution Amount (₹) *
        </label>
        <div className="relative">
          <CurrencyDollarIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="number"
            name="monthlyAmount"
            value={formData.monthlyAmount}
            onChange={handleInputChange}
            placeholder="1000"
            className="w-full pl-12 pr-4 py-3 rounded-lg border bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-200 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Cycles */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-200">Total Cycles *</label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              name="totalCycles"
              value={formData.totalCycles}
              onChange={handleInputChange}
              placeholder="12"
              className="w-full pl-12 pr-4 py-3 rounded-lg border bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-200 focus:outline-none"
            />
          </div>
        </div>

        {/* Max Members */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-200">Maximum Members *</label>
          <div className="relative">
            <UserGroupIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              name="maxMembers"
              value={formData.maxMembers}
              onChange={handleInputChange}
              placeholder="10"
              className="w-full pl-12 pr-4 py-3 rounded-lg border bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-200 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            isSubmitting
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : submitSuccess
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white hover:shadow-lg transform hover:-translate-y-0.5"
          }`}
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : submitSuccess ? (
            <>
              <CheckCircleIcon className="w-5 h-5" />
              Scheme Created Successfully!
            </>
          ) : (
            <>
              <TargetIcon className="w-5 h-5" />
              Create Chitty Scheme
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateChittyForm;
