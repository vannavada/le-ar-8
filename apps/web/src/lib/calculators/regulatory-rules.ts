/**
 * ⚠️  VERIFY / UPDATE BEFORE GOING LIVE
 *
 * Every constant in this file encodes a tax or regulatory rule that CHANGES
 * over time. The site owner MUST verify each value against current official
 * sources before publishing calculators that depend on them.
 *
 * Each constant carries:
 *   - The numeric/boolean value
 *   - SOURCE: the authoritative document or agency
 *   - AS OF: the year/budget the value was last confirmed
 *   - CHECK: what to look for when verifying
 *
 * Key references:
 *   - IRS Publications: pub.irs.gov (updated each tax year)
 *   - IRS Rev. Proc. 2023-34: 2024 inflation-adjusted amounts
 *   - India Finance Act 2024 / Union Budget 2024-25 (effective AY 2025-26)
 *   - RBI FEMA Master Direction FEMA.13(R)/2016-RB (updated periodically)
 *   - India-US DTAA (1989, signed; 1990, in force; check for protocols)
 *   - Income Tax Act 1961, Section 195 (TDS for NRIs), Section 56(2)(x) (gifts)
 */

// ── NRI Repatriation (FEMA / Income Tax Act) ──────────────────────────────────

/** Annual repatriation limit from NRO accounts per financial year.
 *  SOURCE: RBI FEMA.13(R)/2016-RB, Schedule III, Para 1(ii).
 *  AS OF: 2024. CHECK: rbi.org.in → FEMA → Master Directions → FEMA 13(R). */
export const NRO_REPATRIATION_LIMIT_USD = 1_000_000;

/** TDS rate on interest income credited to NRO accounts for non-resident Indians.
 *  SOURCE: Income Tax Act, Section 195; as of FY 2024-25.
 *  NOTE: India-US DTAA Article 11 may reduce this to 15% on "interest" — verify
 *  with a CA whether a DTAA benefit claim (Form 10F + Tax Residency Certificate)
 *  is applicable. Default assumes no treaty benefit claimed.
 *  AS OF: FY 2024-25. CHECK: incometaxindia.gov.in → TDS rates for NRIs. */
export const NRO_INTEREST_TDS_PCT = 30;

/** India-US DTAA reduced rate on interest income (Article 11).
 *  SOURCE: India-US DTAA, Article 11; as of 2024.
 *  AS OF: Treaty 1989; CHECK: latest protocol at incometaxindia.gov.in → DTAA. */
export const DTAA_US_INDIA_INTEREST_REDUCED_PCT = 15;

/** Long-term capital gains (LTCG) tax rate on listed equity shares / equity MFs
 *  held > 12 months. Effective after Finance Act 2024 (Budget 2024).
 *  SOURCE: Finance Act 2024; effective July 23, 2024.
 *  AS OF: AY 2025-26. CHECK: incometaxindia.gov.in or Finance Act. */
export const LTCG_EQUITY_INDIA_PCT = 12.5;

/** Annual LTCG exemption on listed equity / equity MF gains (per financial year).
 *  SOURCE: Finance Act 2024 (raised from ₹1,00,000 to ₹1,25,000 effective July 23, 2024).
 *  AS OF: AY 2025-26. CHECK: Finance Act for the current year. */
export const LTCG_EQUITY_EXEMPTION_INR = 125_000; // ₹1.25 lakh

/** Short-term capital gains (STCG) tax rate on listed equity shares / equity MFs
 *  held ≤ 12 months. Effective after Finance Act 2024.
 *  SOURCE: Finance Act 2024; effective July 23, 2024.
 *  AS OF: AY 2025-26. CHECK: Finance Act. Previous rate was 15%. */
export const STCG_EQUITY_INDIA_PCT = 20;

/** LTCG rate on immovable property (held > 2 years), without indexation.
 *  Finance Act 2024 removed mandatory indexation for all properties. For
 *  properties acquired BEFORE July 23, 2024, a grandfathered 20%-with-indexation
 *  option may still be available — consult a CA.
 *  SOURCE: Finance Act 2024; effective July 23, 2024.
 *  AS OF: AY 2025-26. CHECK: Finance Act; especially for property acquired pre-2024. */
export const LTCG_REALTY_INDIA_PCT = 12.5;

/** TDS rate on dividends paid to NRIs on Indian equity (Section 195).
 *  SOURCE: Income Tax Act, Section 195; as of FY 2024-25.
 *  NOTE: DTAA Article 10 may reduce dividend TDS — verify with CA.
 *  AS OF: FY 2024-25. CHECK: incometaxindia.gov.in. */
export const DIVIDEND_TDS_NRI_PCT = 20;

/** Health and Education Cess applied on top of all India income tax.
 *  SOURCE: Finance Act 2018 onwards; as of FY 2024-25.
 *  AS OF: 2024. CHECK: Budget documents. */
export const INDIA_CESS_PCT = 4;

// ── US Gift Tax / Remittance (IRS) ───────────────────────────────────────────

/** Annual gift tax exclusion per recipient for US citizens/residents (non-spouse).
 *  Any gift above this amount in a calendar year reduces the lifetime exemption.
 *  SOURCE: IRS Rev. Proc. 2023-34 (for calendar year 2024).
 *  AS OF: 2024. CHECK: IRS.gov → "gift tax annual exclusion" each year — this
 *  amount is inflation-indexed and rises periodically. Was $17,000 in 2023. */
export const US_ANNUAL_GIFT_EXCLUSION_USD = 18_000;

/** Higher annual exclusion for gifts to a non-US-citizen spouse (Section 2523(i)).
 *  Inflation-adjusted annually by IRS.
 *  SOURCE: IRS Rev. Proc. 2023-34 (for calendar year 2024).
 *  AS OF: 2024. CHECK: IRS.gov → search "gifts to non-citizen spouse". */
export const US_ANNUAL_GIFT_EXCLUSION_NON_CITIZEN_SPOUSE_USD = 185_000;

/** Federal lifetime gift and estate tax exemption (unified credit equivalent).
 *  ⚠️  TCJA SUNSET: This high exemption is scheduled to be roughly HALVED in 2026
 *  when the Tax Cuts and Jobs Act provisions expire (unless Congress extends them).
 *  Planning around this threshold is time-sensitive.
 *  SOURCE: IRS Rev. Proc. 2023-34 (for calendar year 2024).
 *  AS OF: 2024. CHECK: IRS.gov each year; CRITICALLY re-check after 2025 budget. */
export const US_LIFETIME_GIFT_ESTATE_EXEMPTION_USD = 13_610_000;

/** IRS Form 3520 reporting threshold — US persons who receive gifts from
 *  foreign individuals totalling more than this in a calendar year must file
 *  Form 3520. (This applies to the RECIPIENT, not the sender.)
 *  SOURCE: IRS Form 3520 instructions; IRC Section 6039F.
 *  AS OF: 2024. CHECK: IRS Form 3520 instructions for current threshold. */
export const US_FOREIGN_GIFT_REPORTING_THRESHOLD_USD = 100_000;

/** India income tax threshold above which a gift received from a non-relative
 *  is treated as "income from other sources" and taxed at slab rates.
 *  Gifts from "relatives" (as defined in Sec 56(2)(x)) are FULLY EXEMPT regardless
 *  of amount. Relatives include: spouse, siblings, parents, children, grandparents,
 *  grandchildren, and their spouses, and one's own spouse's siblings.
 *  SOURCE: Income Tax Act 1961, Section 56(2)(x); as of AY 2025-26.
 *  AS OF: FY 2024-25. CHECK: incometaxindia.gov.in. */
export const INDIA_GIFT_TAXABLE_THRESHOLD_INR = 50_000;

/** Whether the TCJA lifetime exemption is scheduled to sunset (halve) after 2025.
 *  This is a planning flag, not a calculated value.
 *  SOURCE: TCJA Section 11061; IRC 2010(c)(3). */
export const TCJA_SUNSET_WARNING = true;

// ── Dual-Tax-Residency Estimator (India new tax regime + US brackets) ─────────

/** India new tax regime slabs for individual taxpayers — FY 2024-25 (AY 2025-26).
 *  ⚠️  NRIs are NOT eligible for the Section 87A rebate (zero tax up to ₹7L income)
 *  that applies to resident individuals.
 *  ⚠️  NRIs must use the old regime for certain incomes; this table approximates
 *  salary / business income under the new regime. Capital gains use separate rates.
 *  SOURCE: Finance Act 2024; CBDT Circular.
 *  AS OF: AY 2025-26 (FY 2024-25). CHECK: incometaxindia.gov.in every budget. */
export const INDIA_NEW_REGIME_SLABS_INR = [
  { upTo: 300_000,   rate: 0 },
  { upTo: 700_000,   rate: 5 },
  { upTo: 1_000_000, rate: 10 },
  { upTo: 1_200_000, rate: 15 },
  { upTo: 1_500_000, rate: 20 },
  { upTo: Infinity,  rate: 30 },
] as const;

/** US federal income tax brackets — tax year 2024, Single filers.
 *  SOURCE: IRS Rev. Proc. 2023-34 (for tax year 2024).
 *  AS OF: 2024. CHECK: IRS Rev. Proc. published each November for the next year. */
export const US_BRACKETS_SINGLE_2024_USD = [
  { upTo: 11_600,  rate: 10 },
  { upTo: 47_150,  rate: 12 },
  { upTo: 100_525, rate: 22 },
  { upTo: 191_950, rate: 24 },
  { upTo: 243_725, rate: 32 },
  { upTo: 609_350, rate: 35 },
  { upTo: Infinity, rate: 37 },
] as const;

/** US federal income tax brackets — tax year 2024, Married Filing Jointly.
 *  SOURCE: IRS Rev. Proc. 2023-34.
 *  AS OF: 2024. CHECK: same as above. */
export const US_BRACKETS_MFJ_2024_USD = [
  { upTo: 23_200,  rate: 10 },
  { upTo: 94_300,  rate: 12 },
  { upTo: 201_050, rate: 22 },
  { upTo: 383_900, rate: 24 },
  { upTo: 487_450, rate: 32 },
  { upTo: 731_200, rate: 35 },
  { upTo: Infinity, rate: 37 },
] as const;

/** US standard deduction for Single filers, tax year 2024.
 *  SOURCE: IRS Rev. Proc. 2023-34.
 *  AS OF: 2024. CHECK: IRS publication each year. */
export const US_STANDARD_DEDUCTION_SINGLE_2024_USD = 14_600;

/** US standard deduction for Married Filing Jointly, tax year 2024.
 *  SOURCE: IRS Rev. Proc. 2023-34.
 *  AS OF: 2024. CHECK: IRS publication each year. */
export const US_STANDARD_DEDUCTION_MFJ_2024_USD = 29_200;

/** Foreign Earned Income Exclusion (FEIE) for tax year 2024.
 *  US citizens / qualifying residents living abroad may exclude this amount of
 *  foreign-earned income from US taxation via Form 2555.
 *  SOURCE: IRS Rev. Proc. 2023-34.
 *  AS OF: 2024. CHECK: IRS.gov → "foreign earned income exclusion" each year. */
export const US_FEIE_2024_USD = 126_500;
