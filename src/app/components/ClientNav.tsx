// src/app/components/ClientNav.tsx
"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Drug } from "@/lib/types";
import navStyles from "./nav.module.css";

const CategoryDropdown = dynamic(() => import("./CategoryDropdown"), {
  ssr: false,
  loading: () => <div>Loading categories...</div>,
});

interface ClientNavProps {
  categories: string[];
  initialCategory: string;
  initialDrugs: Drug[];
  allDrugs: { [key: string]: Drug[] };
}

export default function ClientNav({
  categories,
  initialCategory,
  initialDrugs,
  allDrugs,
}: ClientNavProps) {
  return (
    <nav className={navStyles.nav} aria-label="Drug categories navigation">
      <div className={navStyles.categoryWrapper}>
        <Suspense fallback={<div>Loading categories...</div>}>
          <CategoryDropdown
            categories={categories}
            initialCategory={initialCategory}
            initialDrugs={initialDrugs}
            allDrugs={allDrugs}
          />
        </Suspense>
      </div>
    </nav>
  );
}
