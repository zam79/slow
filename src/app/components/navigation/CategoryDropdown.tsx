"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import navStyles from "./nav.module.css";
import { Drug } from "@/lib/types";

interface CategoryDropdownProps {
  categories: string[];
  initialCategory: string;
  initialDrugs: Drug[];
  allDrugs: { [key: string]: Drug[] };
}

function CategoryDropdownComponent({
  categories,
  initialCategory,
  initialDrugs,
  allDrugs,
}: CategoryDropdownProps) {
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [openSubCategory, setOpenSubCategory] = useState<string | null>(null);
  const [categoryDrugs] = useState<{ [key: string]: Drug[] }>({
    [initialCategory]: initialDrugs,
    ...allDrugs,
  });
  const navRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const drugRefs = useRef<{ [key: string]: HTMLLIElement | null }>({});
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
        setOpenSubCategory(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const debounceNavigation = useCallback(
    (slug: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        router.push(`/drug/${encodeURIComponent(slug)}`);
      }, 300);
    },
    [router]
  );

  const toggleCategoryMenu = useCallback(() => {
    setIsCategoryMenuOpen((prev) => !prev);
    setOpenSubCategory(null);
    if (!isCategoryMenuOpen && categories[0]) {
      requestAnimationFrame(() => {
        categoryRefs.current[categories[0]]?.focus();
      });
    }
  }, [isCategoryMenuOpen, categories]);

  const toggleSubCategory = useCallback(
    (category: string, focusFirstDrug: boolean = false) => {
      setOpenSubCategory(openSubCategory === category ? null : category);
      if (focusFirstDrug && categoryDrugs[category]?.[0]) {
        requestAnimationFrame(() => {
          drugRefs.current[
            `${category}-${categoryDrugs[category][0].id}`
          ]?.focus();
        });
      }
    },
    [openSubCategory, categoryDrugs]
  );

  const selectDrug = useCallback(
    (drug: Drug) => {
      setIsCategoryMenuOpen(false);
      setOpenSubCategory(null);
      const slug = drug.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      debounceNavigation(slug);
    },
    [debounceNavigation]
  );

  const handleCategoryKeyDown = useCallback(
    (e: React.KeyboardEvent, category: string, index: number) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = (index + 1) % categories.length;
        categoryRefs.current[categories[nextIndex]]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = (index - 1 + categories.length) % categories.length;
        categoryRefs.current[categories[prevIndex]]?.focus();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleSubCategory(category, true);
      } else if (e.key === "Escape") {
        setIsCategoryMenuOpen(false);
        setOpenSubCategory(null);
      }
    },
    [categories, toggleSubCategory]
  );

  const handleDrugKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      category: string,
      drug: Drug,
      drugIndex: number
    ) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex =
          (drugIndex + 1) % (categoryDrugs[category]?.length || 1);
        drugRefs.current[
          `${category}-${categoryDrugs[category][nextIndex].id}`
        ]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex =
          (drugIndex - 1 + categoryDrugs[category].length) %
          (categoryDrugs[category]?.length || 1);
        drugRefs.current[
          `${category}-${categoryDrugs[category][prevIndex].id}`
        ]?.focus();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectDrug(drug);
      } else if (e.key === "Escape") {
        setOpenSubCategory(null);
        categoryRefs.current[category]?.focus();
      }
    },
    [categoryDrugs, selectDrug]
  );

  return (
    <div className={navStyles.categoryWrapper} ref={navRef}>
      <button
        className={navStyles.mainButton}
        onClick={toggleCategoryMenu}
        aria-expanded={isCategoryMenuOpen}
        aria-controls="categories-menu"
      >
        Drug Categories
        <span className={navStyles.arrow}>
          {isCategoryMenuOpen ? "▲" : "▼"}
        </span>
      </button>
      {isCategoryMenuOpen && (
        <ul id="categories-menu" className={navStyles.categoryList} role="menu">
          {categories.map((category, index) => (
            <li key={category} className={navStyles.categoryItem}>
              <button
                ref={(el) => {
                  categoryRefs.current[category] = el;
                  return undefined;
                }}
                className={navStyles.categoryButton}
                onClick={() => toggleSubCategory(category, true)}
                onMouseEnter={() => toggleSubCategory(category)}
                onKeyDown={(e) => handleCategoryKeyDown(e, category, index)}
                aria-expanded={openSubCategory === category}
                aria-controls={`drugs-${category}`}
              >
                {category}
                <span className={navStyles.arrow}>
                  {openSubCategory === category ? "▲" : "▼"}
                </span>
              </button>
              {openSubCategory === category && (
                <ul
                  id={`drugs-${category}`}
                  className={navStyles.drugList}
                  role="menu"
                  aria-label={`${category} drugs`}
                >
                  {categoryDrugs[category]?.length > 0 ? (
                    categoryDrugs[category].map((drug, drugIndex) => (
                      <li
                        key={drug.id}
                        ref={(el) => {
                          drugRefs.current[`${category}-${drug.id}`] = el;
                          return undefined;
                        }}
                        className={navStyles.drugItem}
                        role="menuitem"
                        tabIndex={0}
                        onClick={() => selectDrug(drug)}
                        onKeyDown={(e) =>
                          handleDrugKeyDown(e, category, drug, drugIndex)
                        }
                      >
                        {drug.name}
                      </li>
                    ))
                  ) : (
                    <li className={navStyles.noResults}>
                      <div className={navStyles.skeletonLoader}>
                        <div className={navStyles.skeletonItem} />
                        <div className={navStyles.skeletonItem} />
                        <div className={navStyles.skeletonItem} />
                      </div>
                    </li>
                  )}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default memo(CategoryDropdownComponent);
