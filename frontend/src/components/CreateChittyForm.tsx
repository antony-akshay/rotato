"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  AdjustmentsVerticalIcon as TargetIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ChitChainManagerABI } from "@/contracts/ChitChainManage";

interface FormData {
  schemeName: string;
  monthlyAmount: string;
  totalCycles: string;
  maxMembers: string;
}

interface CreateChittyFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSchemeCreated?: (schemeId: bigint) => void; // Callback for parent component
}

const CONTRACT_ADDRESS = "0x9B4e05a10D6D4779d7c37B6e17AA9633a45BC99E";

const CreateChittyForm: React.FC<CreateChittyFormProps> = ({ 
  formData, 
  setFormData,
  onSchemeCreated 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { 
    writeContract, 
    data: hash,
    isPending: isWriting,
    error: writeError 
  } = useWriteContract();

  // Wait for transaction confirmation
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: confirmError 
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Reset states when component mounts
  useEffect(() => {
    setError(null);
    setIsSubmitting(false);
    setSubmitSuccess(false);
  }, []);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      setSubmitSuccess(true);
      setFormData({
        schemeName: "",
        monthlyAmount: "",
        totalCycles: "",
        maxMembers: "",
      });
      setError(null);
      
      // Reset success message after 3 seconds
      const timer = setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isConfirmed, setFormData]);

  // Handle errors
  useEffect(() => {
    if (writeError) {
      setError(writeError.message || "Failed to create scheme");
      setIsSubmitting(false);
    }
    if (confirmError) {
      setError(confirmError.message || "Transaction failed");
      setIsSubmitting(false);
    }
  }, [writeError, confirmError]);

  // Update submitting state based on transaction status
  useEffect(() => {
    setIsSubmitting(isWriting || isConfirming);
  }, [isWriting, isConfirming]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.schemeName.trim()) {
      setError("Scheme name is required");
      return;
    }
    if (!formData.monthlyAmount || BigInt(formData.monthlyAmount || "0") <= 0) {
      setError("Monthly amount must be greater than 0");
      return;
    }
    if (!formData.totalCycles || BigInt(formData.totalCycles || "0") <= 0) {
      setError("Total cycles must be greater than 0");
      return;
    }
    if (!formData.maxMembers || BigInt(formData.maxMembers || "0") < 2) {
      setError("Maximum members must be at least 2");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const monthlyAmount = BigInt(formData.monthlyAmount);
      const totalCycles = BigInt(formData.totalCycles);
      const maxMembers = BigInt(formData.maxMembers);

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ChitChainManagerABI,
        functionName: "createScheme",
        args: [formData.schemeName, monthlyAmount, totalCycles, maxMembers],
      });

    } catch (error) {
      console.error("Error creating scheme:", error);
      setError("Failed to submit transaction");
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.schemeName.trim() && 
                     formData.monthlyAmount && 
                     formData.totalCycles && 
                     formData.maxMembers;

  return (
    <div className="rounded-lg shadow-lg border bg-gray-800 border-gray-700 p-6 space-y-6">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300">
          <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Success Message */}
      {submitSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-900/50 border border-green-700 rounded-lg text-green-300">
          <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">Chitty scheme created successfully!</span>
        </div>
      )}

      {/* Scheme Name */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-200">Scheme Name *</label>
        <input
          type="text"
          name="schemeName"
          value={formData.schemeName}
          onChange={handleInputChange}
          placeholder="e.g., Monthly Savings Circle"
          disabled={isSubmitting}
          className="w-full px-4 py-3 rounded-lg border bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Monthly Amount */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-200">
          Monthly Contribution Amount (ETH) *
        </label>
        <div className="relative">
          <CurrencyDollarIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="number"
            name="monthlyAmount"
            value={formData.monthlyAmount}
            onChange={handleInputChange}
            placeholder="1000"
            disabled={isSubmitting}
            min="1"
            className="w-full pl-12 pr-4 py-3 rounded-lg border bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={isSubmitting}
              min="1"
              max="60"
              className="w-full pl-12 pr-4 py-3 rounded-lg border bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={isSubmitting}
              min="2"
              max="100"
              className="w-full pl-12 pr-4 py-3 rounded-lg border bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Transaction Status */}
      {(isWriting || isConfirming) && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span>
              {isWriting ? "Waiting for wallet confirmation..." : "Waiting for blockchain confirmation..."}
            </span>
          </div>
          {hash && (
            <div className="text-xs text-gray-400 break-all">
              Transaction: {hash}
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !isFormValid}
          className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            isSubmitting
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : submitSuccess
              ? "bg-green-600 text-white"
              : !isFormValid
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white hover:shadow-lg transform hover:-translate-y-0.5"
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              {isWriting ? "Confirming..." : "Processing..."}
            </>
          ) : submitSuccess ? (
            <>
              <CheckCircleIcon className="w-5 h-5" />
              Scheme Created!
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