// ============================================================
// FILE: api/highlights.js
// Place in your api/ folder (same place as marketplace.js)
// ============================================================

import { client } from '../sanity';

/**
 * Fetch all placement companies
 * @param {string} search - optional company name search
 */
export async function fetchPlacementCompanies(search = '') {
  try {
    let query;
    if (search && search.trim().length > 0) {
      // Sanity doesn't support *search* well, so we fetch all and filter client-side
      query = `*[_type == "placement"] | order(year desc, companyName asc) {
        _id, companyName, sector, year, package, students,
        "logoUrl": logo.asset->url
      }`;
      const all = await client.fetch(query);
      const lower = search.toLowerCase();
      return all.filter(c =>
        c.companyName?.toLowerCase().includes(lower) ||
        c.sector?.toLowerCase().includes(lower)
      );
    }
    query = `*[_type == "placement"] | order(year desc, companyName asc) {
      _id, companyName, sector, year, package, students,
      "logoUrl": logo.asset->url
    }`;
    return await client.fetch(query);
  } catch (err) {
    console.error('fetchPlacementCompanies error:', err);
    return [];
  }
}

/**
 * Fetch all internship companies
 * @param {string} search - optional company name search
 */
export async function fetchInternshipCompanies(search = '') {
  try {
    let query;
    if (search && search.trim().length > 0) {
      query = `*[_type == "internship"] | order(year desc, companyName asc) {
        _id, companyName, sector, year, stipend, duration, students,
        "logoUrl": logo.asset->url
      }`;
      const all = await client.fetch(query);
      const lower = search.toLowerCase();
      return all.filter(c =>
        c.companyName?.toLowerCase().includes(lower) ||
        c.sector?.toLowerCase().includes(lower)
      );
    }
    query = `*[_type == "internship"] | order(year desc, companyName asc) {
      _id, companyName, sector, year, stipend, duration, students,
      "logoUrl": logo.asset->url
    }`;
    return await client.fetch(query);
  } catch (err) {
    console.error('fetchInternshipCompanies error:', err);
    return [];
  }
}
