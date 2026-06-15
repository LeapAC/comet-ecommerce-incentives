// Maps a 5-digit US ZIP code to its two-letter state abbreviation.
// Used to satisfy the Global Connect API's required `address.state` field
// when the storefront only collects a ZIP. The geocoder on the Leap side
// does the precise territory lookup; this just needs to be a valid state.
const RANGES: [number, number, string][] = [
  [0,      599,   "CT"], // 00xxx–00599 (partial NE block)
  [600,    988,   "PR"],
  [1000,   2799,  "MA"],
  [2800,   2999,  "RI"],
  [3000,   3899,  "NH"],
  [3900,   4999,  "ME"],
  [5000,   5999,  "VT"],
  [6000,   6999,  "CT"],
  [7000,   8999,  "NJ"],
  [10000,  14999, "NY"],
  [15000,  19699, "PA"],
  [19700,  19999, "DE"],
  [20000,  20599, "DC"],
  [20600,  21999, "MD"],
  [22000,  24699, "VA"],
  [24700,  26999, "WV"],
  [27000,  28999, "NC"],
  [29000,  29999, "SC"],
  [30000,  31999, "GA"],
  [32000,  34999, "FL"],
  [35000,  36999, "AL"],
  [37000,  38599, "TN"],
  [38600,  39999, "MS"],
  [40000,  42799, "KY"],
  [43000,  45999, "OH"],
  [46000,  47999, "IN"],
  [48000,  49999, "MI"],
  [50000,  52999, "IA"],
  [53000,  54999, "WI"],
  [55000,  56799, "MN"],
  [57000,  57999, "SD"],
  [58000,  58999, "ND"],
  [59000,  59999, "MT"],
  [60000,  62999, "IL"],
  [63000,  65999, "MO"],
  [66000,  67999, "KS"],
  [68000,  69999, "NE"],
  [70000,  71599, "LA"],
  [71600,  72999, "AR"],
  [73000,  74999, "OK"],
  [75000,  79999, "TX"],
  [80000,  81999, "CO"],
  [82000,  83199, "WY"],
  [83200,  83999, "ID"],
  [84000,  84999, "UT"],
  [85000,  86999, "AZ"],
  [87000,  88499, "NM"],
  [88500,  88999, "TX"],
  [89000,  89999, "NV"],
  [90000,  96199, "CA"],
  [96700,  96799, "HI"],
  [97000,  97999, "OR"],
  [98000,  99499, "WA"],
  [99500,  99999, "AK"],
]

export function zipToState(zip: string): string {
  const n = parseInt(zip, 10)
  if (isNaN(n)) return "CA"
  for (const [lo, hi, state] of RANGES) {
    if (n >= lo && n <= hi) return state
  }
  return "CA"
}
