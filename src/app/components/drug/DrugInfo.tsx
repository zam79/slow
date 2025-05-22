"use client";

import { useState } from "react";
import { Drug } from "@/lib/types";

interface DrugInfoProps {
  drug: Drug;
}

const ExpandableSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left bg-gradient-to-r from-blue-800 to-orange-400 text-white px-4 py-3 rounded-lg font-semibold flex justify-between items-center transition-all duration-300 hover:from-blue-900 hover:to-orange-500 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-30 shadow-sm"
      >
        {title}
        <span className="text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div className="mt-2 p-4 bg-gray-50 rounded-lg text-gray-700 text-sm leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
};

export default function DrugInfo({ drug }: DrugInfoProps) {
  return (
    <div className="font-inter">
      {/* Hero Card with Drug Name */}
      <div className="max-w-[800px] mx-auto bg-gradient-to-br from-blue-800 to-orange-400 rounded-[16px] p-6 text-center text-white relative shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:-translate-y-1 flex justify-center items-center min-h-[120px] z-10">
        <div className="absolute inset-0 bg-black bg-opacity-15 rounded-[16px] z-0"></div>
        <h1 className="text-3xl md:text-4xl font-bold relative z-10 text-shadow">
          {drug.name}
        </h1>
      </div>

      {/* Main Content Container */}
      <div className="bg-white rounded-[16px] shadow-[0_8px_24px_rgba(0,0,0,0.1)] max-w-[800px] mx-auto my-4 p-8">
        {/* Trade Name */}
        {drug.trade_name && (
          <p className="mb-4 text-xl text-gray-500 font-light">
            {drug.trade_name}
          </p>
        )}

        {/* Overview */}
        <p className="mb-6 text-gray-700 leading-relaxed">{drug.overview}</p>

        {/* Expandable Sections */}
        <ExpandableSection title="Dosing">
          <p>{drug.dosing}</p>
        </ExpandableSection>

        <ExpandableSection title="Pharmacokinetics">
          <p>{drug.pharmacokinetics}</p>
        </ExpandableSection>

        <ExpandableSection title="Pharmacodynamics">
          <p>{drug.pharmacodynamics}</p>
        </ExpandableSection>

        <ExpandableSection title="Clinical Considerations">
          <p>{drug.clinical_practical_considerations}</p>
        </ExpandableSection>

        {drug.is_emergency && (
          <ExpandableSection title="Emergency Use">
            <p>Yes</p>
          </ExpandableSection>
        )}

        {drug.url && (
          <ExpandableSection title="More Info">
            <a
              href={drug.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-blue-800 to-orange-400 text-white px-4 py-2 rounded-lg font-medium no-underline transition-all duration-200 hover:text-teal-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              External Link
            </a>
          </ExpandableSection>
        )}
      </div>
    </div>
  );
}
