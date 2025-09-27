import React, { useState } from "react";
import ChitChainManager from "../../../hardhat/artifacts/contracts/rotato.sol/ChitChainManager.json";
import { AlertCircle, Calendar, CheckCircle, DollarSign, Target, Users } from "lucide-react";
import { useWriteContract } from "wagmi";

const CreateChittyForm = () => {
  const [formData, setFormData] = useState({
    schemeName: "",
    monthlyAmount: "",
    totalCycles: "",
    maxMembers: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { writeContractAsync, isPending, isError, error, data } = useWriteContract();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if ((errors as any)[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.schemeName.trim()) {
      newErrors.schemeName = "Scheme name is required";
    }
    if (!formData.monthlyAmount || parseFloat(formData.monthlyAmount) <= 0) {
      newErrors.monthlyAmount = "Monthly amount must be greater than 0";
    }
    if (!formData.totalCycles || parseInt(formData.totalCycles) <= 0) {
      newErrors.totalCycles = "Total cycles is required";
    }
    if (!formData.maxMembers || parseInt(formData.maxMembers) <= 0) {
      newErrors.maxMembers = "Maximum members is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      const contractAbi = ChitChainManager.abi;

      setSubmitSuccess(true);

      const tx = await writeContractAsync({
        address: contractAddress,
        abi: contractAbi,
        functionName: "createScheme",
        args: [
          formData.schemeName,
          BigInt(formData.monthlyAmount),
          BigInt(formData.totalCycles),
          BigInt(formData.maxMembers),
        ],
        value: 0n, // if scheme requires deposit
      });

      console.log("Tx sent:", tx);

      setTimeout(() => {
        setFormData({
          schemeName: "",
          monthlyAmount: "",
          totalCycles: "",
          maxMembers: "",
        });
        setSubmitSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Transaction failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotalPool = () => {
    const amount = parseFloat(formData.monthlyAmount) || 0;
    const members = parseInt(formData.maxMembers) || 0;
    return amount * members;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Create New Chitty Scheme</h1>
          <p className="mt-2 text-gray-300">Set up your chit fund with custom parameters and invite members to join</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="rounded-lg shadow-lg border bg-gray-800 border-gray-700">
              <div className="p-6 space-y-6">
                {/* Scheme Name */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-200">Scheme Name *</label>
                  <input
                    type="text"
                    name="schemeName"
                    value={formData.schemeName}
                    onChange={handleInputChange}
                    placeholder="e.g., Monthly Savings Circle"
                    className={`w-full px-4 py-3 rounded-lg border bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-200 focus:outline-none ${
                      (errors as any).schemeName ? "border-red-500" : ""
                    }`}
                  />
                  {(errors as any).schemeName && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {(errors as any).schemeName}
                    </p>
                  )}
                </div>

                {/* Monthly Amount */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-200">
                    Monthly Contribution Amount (₹) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="monthlyAmount"
                      value={formData.monthlyAmount}
                      onChange={handleInputChange}
                      placeholder="1000"
                      min="100"
                      className={`w-full pl-12 pr-4 py-3 rounded-lg border bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-200 focus:outline-none ${
                        (errors as any).monthlyAmount ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Total Cycles */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-200">Total Cycles *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="totalCycles"
                        value={formData.totalCycles}
                        onChange={handleInputChange}
                        placeholder="12"
                        min="2"
                        max="60"
                        className={`w-full pl-12 pr-4 py-3 rounded-lg border bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-200 focus:outline-none ${
                          (errors as any).totalCycles ? "border-red-500" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Max Members */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-200">Maximum Members *</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="maxMembers"
                        value={formData.maxMembers}
                        onChange={handleInputChange}
                        placeholder="10"
                        min="2"
                        max="100"
                        className={`w-full pl-12 pr-4 py-3 rounded-lg border bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-200 focus:outline-none ${
                          (errors as any).maxMembers ? "border-red-500" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || isPending}
                    className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      isSubmitting
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : submitSuccess
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-green-600 hover:bg-green-700 text-white hover:shadow-lg transform hover:-translate-y-0.5"
                    }`}
                  >
                    {isSubmitting || isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Creating Scheme...
                      </>
                    ) : submitSuccess ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Scheme Created Successfully!
                      </>
                    ) : (
                      <>
                        <Target className="w-5 h-5" />
                        Create Chitty Scheme
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <div className="rounded-lg shadow-lg border bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">Scheme Preview</h3>
              <div className="space-y-2 text-gray-300">
                <p>
                  <strong>Name:</strong> {formData.schemeName || "N/A"}
                </p>
                <p>
                  <strong>Monthly Amount:</strong> ₹{formData.monthlyAmount || "0"}
                </p>
                <p>
                  <strong>Total Cycles:</strong> {formData.totalCycles || "0"}
                </p>
                <p>
                  <strong>Max Members:</strong> {formData.maxMembers || "0"}
                </p>
                <p>
                  <strong>Pool per Cycle:</strong> ₹{calculateTotalPool()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChittyForm;
