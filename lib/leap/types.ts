/**
 * Types for the Leap Incentives partner lookup API.
 *
 * Mirrors the contract published by the Global Connect Service (GCS) at
 * `POST /v1.1/global-connect/incentives/lookups`. See
 * `global-connect-service/src/main/resources/openapi/incentives.yaml` for the
 * source of truth. Only the fields this reference implementation consumes are
 * modelled; unused response fields are typed loosely on purpose.
 */

export type CustomerClassification =
  | "RESIDENTIAL"
  | "MULTIFAMILY"
  | "MANUFACTURED_HOME"
  | "COMMERCIAL"

export type PaymentType = "UPFRONT" | "INSTALL" | "ONGOING"

/** Request address block. All fields except `address_line_2` are required. */
export interface LeapAddress {
  address_line_1: string
  address_line_2?: string | null
  city: string
  /** Two-letter US state abbreviation. */
  state: string
  zip_code: string
  /** ISO-3166 alpha-2. Defaults to "US" server-side. */
  country_code?: string
}

/** One installation of a catalog device. */
export interface CustomerDeviceRef {
  /** Catalog `device.id` (UUID). Discover via GET /incentives/devices/search. */
  device_id: string
  /** Stable per-installation id, echoed back. Defaults to "1", "2", ... */
  partner_device_reference?: string
  /** Per-installation attributes keyed by requirement key. */
  details?: Record<string, string>
}

/** Request body for POST /v1.1/global-connect/incentives/lookups. */
export interface EligibilityRequest {
  reference_id: string
  address: LeapAddress
  customer_devices: CustomerDeviceRef[]
  customer_classification: CustomerClassification
  /** Optional utility override (bypasses geocoding). */
  eiaid?: string
  /** Per-customer attributes keyed by requirement key. */
  customer_details?: Record<string, string>
}

export interface EligibilityCheck {
  requirement: string
  status: string
  code: string
  reason: string
}

export interface DeviceTierResult {
  partner_device_reference: string
  customer_device_id: string
  status: string
  eligibility_details: EligibilityCheck[]
}

export interface MatchedTier {
  tier_name: string
  payment_type: PaymentType
  incentive_amount: number
  device_results: DeviceTierResult[]
}

export interface EligibleProgram {
  name: string
  operator_name?: string | null
  device_category?: string | null
  display_name?: string | null
  logo_url?: string | null
  terms_url?: string | null
  description?: string | null
  tiers: MatchedTier[]
}

export interface IncentiveSummary {
  /** Reserved for a future pre-install payment kind. Currently always 0. */
  upfront_amount: number
  /** One-time incentives paid at install. */
  install_amount: number
  /** Recurring incentives (per year). */
  ongoing_amount: number
}

export interface IncentiveUtility {
  eiaid: string
  name: string
  state?: string
}

export interface UtilityMatch {
  primary: IncentiveUtility | null
  possible_utilities: IncentiveUtility[]
}

export interface CustomerDeviceRefEcho {
  device_id: string
  partner_device_reference: string
  customer_device_id: string
}

/** Response body for POST /v1.1/global-connect/incentives/lookups. */
export interface EligibilityResult {
  reference_id: string
  customer_classification: CustomerClassification
  customer_devices: CustomerDeviceRefEcho[]
  connect_url: string
  incentive_summary: IncentiveSummary
  utilities: UtilityMatch
  program_details: EligibleProgram[]
  geocoding?: {
    latitude: number
    longitude: number
    formatted_address: string
  }
}

/** Typed error body the API returns on non-2xx responses. `error`/`message` are
 *  usually strings but the gateway occasionally returns a structured object. */
export interface LeapErrorResponse {
  error?: unknown
  error_code?: string
  code?: string
  message?: unknown
  details?: unknown
}
