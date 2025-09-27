import React from "react";
import { Users, Calendar, DollarSign, Target, Clock, User } from "lucide-react";

const ChittySchemeCard = () => {
  const chittyData = {
    schemeId: 1,
    organizer: "0x1234...5678",
    schemeName: "Monthly Savings Circle",
    monthlyAmount: 1000,
    totalCycles: 12,
    currentCycle: 3,
    maxMembers: 10,
    members: [
      "0xabcd...1234",
      "0xefgh...5678",
      "0xijkl...9012",
      "0xmnop...3456",
      "0xqrst...7890",
    ],
    isActive: true,
    createdAt: "2024-01-15",
    lastCycleStart: "2024-03-01",
  };

  const contributions = [
    { member: "0xabcd...1234", month: "January", contributions: 1000 },
    { member: "0xefgh...5678", month: "January", contributions: 1000 },
    { member: "0xijkl...9012", month: "February", contributions: 1000 },
    { member: "0xmnop...3456", month: "February", contributions: 1000 },
    { member: "0xqrst...7890", month: "March", contributions: 1000 },
  ];

  return (
    <div className="mt-16 max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <h2 className="text-2xl font-bold text-gray-800">
          {chittyData.schemeName}
        </h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            chittyData.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {chittyData.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Main Details Card */}
      <div className="bg-green-50 rounded-lg p-6 mb-6 border border-green-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-600">Monthly Amount</p>
              <p className="font-semibold text-gray-800">
                ₹{chittyData.monthlyAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-600">Current Cycle</p>
              <p className="font-semibold text-gray-800">
                {chittyData.currentCycle}/{chittyData.totalCycles}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-600">Members</p>
              <p className="font-semibold text-gray-800">
                {chittyData.members.length}/{chittyData.maxMembers}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-600">Organizer</p>
              <p className="font-semibold text-gray-800">
                {chittyData.organizer}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-600">Created At</p>
              <p className="font-semibold text-gray-800">
                {chittyData.createdAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-600">Last Cycle Start</p>
              <p className="font-semibold text-gray-800">
                {chittyData.lastCycleStart}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contributions Table */}
      <div className="bg-green-50 rounded-lg p-6 border border-green-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Contributions
        </h3>

        {contributions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-green-200 bg-green-100">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Member
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Month
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Contributions
                  </th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((c, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-green-100 hover:bg-green-100/40"
                  >
                    <td className="py-3 px-4 text-gray-800">{c.member}</td>
                    <td className="py-3 px-4 text-gray-600">{c.month}</td>
                    <td className="py-3 px-4 font-semibold text-gray-800">
                      ₹{c.contributions.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No contributions recorded yet</p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Scheme Progress
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(
              (chittyData.currentCycle / chittyData.totalCycles) * 100
            )}
            % Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-300 ease-in-out"
            style={{
              width: `${
                (chittyData.currentCycle / chittyData.totalCycles) * 100
              }%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ChittySchemeCard;
