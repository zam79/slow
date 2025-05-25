"use client";

import { Suspense, useState, useCallback } from "react";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ClientSearch from "./components/search/ClientSearch";
import SearchWrapper from "./components/search/SearchWrapper";
import { Drug } from "@/lib/types";

export default function Home() {
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  const handleDrugSelect = useCallback((drug: Drug | null) => {
    setSelectedDrug(drug);
    setResetTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-inter">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-6 py-8 w-full sm:px-4 sm:py-6 z-auto">
        <section className="bg-gradient-hero rounded-2xl px-6 py-12 text-center text-white relative shadow-2xl transition-all duration-300 ease-in-out z-[5] hero-overlay hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] sm:px-4 sm:py-8 sm:rounded-xl">
          <h1 className="text-4xl font-bold mb-4 leading-tight relative z-10 shadow-[0_2px_4px_rgba(0,0,0,0.3)] sm:text-3xl xs:text-2xl">
            Drugs in Anesthesia and Critical Care
          </h1>
          <Suspense
            fallback={
              <div className="px-4 py-4 text-gray-500 text-sm text-center">
                Loading search...
              </div>
            }
          >
            <ClientSearch
              onDrugSelect={handleDrugSelect}
              resetTrigger={resetTrigger}
            />
          </Suspense>
        </section>
        <section className="mt-8 w-full flex justify-center z-0 sm:mt-6">
          <Suspense
            fallback={
              <div className="px-4 py-4 text-gray-500 text-sm text-center">
                Loading drug info...
              </div>
            }
          >
            <SearchWrapper selectedDrug={selectedDrug} />
          </Suspense>
        </section>
      </main>
      <Footer />
    </div>
  );
}
