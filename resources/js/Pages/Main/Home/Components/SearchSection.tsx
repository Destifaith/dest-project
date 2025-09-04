import React, { useState } from "react";

const SearchSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState("accommodation");

  const tabs = [
    { id: "accommodation", label: "Accommodation" },
    { id: "food", label: "Food & Drinks" },
    { id: "entertainment", label: "Entertainment" },
    { id: "fitness", label: "Fitness & Health" },
    { id: "jobs", label: "Jobs" },
    { id: "car", label: "Car Rental" },
  ];

  const renderForm = () => {
    switch (activeTab) {
      case "accommodation":
        return (
          <>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Your Destination</label>
              <input type="text" placeholder="Enter Destination" className="input-box" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Check In/Out</label>
              <input type="text" placeholder="Check-In Date - Check-Out Date" className="input-box" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Guests & Rooms</label>
              <input type="text" placeholder="1 Room - 2 Guests" className="input-box" />
            </div>
          </>
        );
      case "food":
        return (
          <>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Location</label>
              <input type="text" placeholder="City or Area" className="input-box" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Cuisine / Type</label>
              <input type="text" placeholder="E.g. Italian, Pub, Café" className="input-box" />
            </div>
          </>
        );
      case "entertainment":
        return (
          <>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Event Type</label>
              <input type="text" placeholder="Concert, Beach, Excursion" className="input-box" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Date</label>
              <input type="text" placeholder="Select Date" className="input-box" />
            </div>
          </>
        );
      case "fitness":
        return (
          <>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Service</label>
              <input type="text" placeholder="Spa, Gym, Wellness" className="input-box" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Preferred Date</label>
              <input type="text" placeholder="Choose Date" className="input-box" />
            </div>
          </>
        );
      case "jobs":
        return (
          <>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Job Title</label>
              <input type="text" placeholder="Waiter, Chef, Manager" className="input-box" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Location</label>
              <input type="text" placeholder="Enter City / Area" className="input-box" />
            </div>
          </>
        );
      case "car":
        return (
          <>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Pick-up Location</label>
              <input type="text" placeholder="Enter Pick-up City" className="input-box" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Drop-off Location</label>
              <input type="text" placeholder="Enter Drop-off City" className="input-box" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Pick-up Date</label>
              <input type="text" placeholder="Select Date" className="input-box" />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative -mt-20 z-40 px-4">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden max-w-6xl mx-auto">
        {/* Tabs */}
        <div className="flex flex-wrap border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 md:px-6 py-3 text-sm md:text-base font-medium transition ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 border-b-2 border-blue-600"
                  : "bg-gray-100 text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 items-end">
          {renderForm()}

          {/* Search Button */}
          <div className="flex">
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md flex justify-center items-center">
              Search Now ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Input Box Style
const inputBoxClass = "w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";
export default SearchSection;
