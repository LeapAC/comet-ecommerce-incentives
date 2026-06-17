export interface Product {
  id: number
  /** UUID from the Leap incentives.device catalog — used for live incentive lookups */
  deviceUuid: string
  name: string
  price: number
  originalPrice?: number
  image: string
  description: string
  category: "EV Charger" | "Smart Thermostat"
  badge: string
  rating: number
  reviews: number
  features: string[]
  /** EV Charger: charging rate, e.g. "11.5 kW" */
  power?: string
  /** EV Charger: connector type, e.g. "J1772" */
  connector?: string
  /** Smart Thermostat: system compatibility, e.g. "24V Systems" */
  compatibility?: string
}

export const PRODUCTS: Product[] = [
  // ── EV Chargers ──────────────────────────────────────────────────────────
  {
    id: 1,
    deviceUuid: "9c59bfff-1b52-4a76-9f27-695a90372fc2",
    name: "Tesla Wall Connector",
    price: 450,
    image: "/modern-white-ev-charger-mounted-on-garage-wall.jpg",
    description:
      "Gen 3 wall connector delivering up to 48 amps — the fastest Level 2 option for Tesla owners, now with a J1772 adapter for any EV.",
    category: "EV Charger",
    power: "11.5 kW",
    connector: "NACS + J1772",
    badge: "Best Seller",
    rating: 4.8,
    reviews: 2134,
    features: [
      "11.5 kW Level 2 Charging",
      "NACS + J1772 Adapter",
      "Wi-Fi Enabled",
      "OTA Firmware Updates",
      "Energy Monitoring",
    ],
  },
  {
    id: 2,
    deviceUuid: "b5a37870-6bbc-4a6d-8d35-9e8ad0b819d6",
    name: "Wallbox Pulsar Plus",
    price: 749,
    image: "/compact-sleek-ev-charger-for-apartments.jpg",
    description:
      "Hard-wired Level 2 charger with full OCPP 1.6 compliance — ideal for landlords, multi-family properties, and fleet energy-management deployments.",
    category: "EV Charger",
    power: "11.5 kW",
    connector: "J1772",
    badge: "OCPP Ready",
    rating: 4.7,
    reviews: 987,
    features: [
      "11.5 kW Level 2 Charging",
      "OCPP 1.6 Compliant",
      "Smart Scheduling",
      "Dynamic Load Management",
      "Energy Star Certified",
    ],
  },
  {
    id: 3,
    deviceUuid: "84130f31-f7ea-42fc-8e36-14fb9031322b",
    name: "GM Energy PowerShift e1.19",
    price: 3999,
    image: "/commercial-ev-charging-station-with-dual-ports.jpg",
    description:
      "Bidirectional residential charger for compatible GM EVs. Up to 19.2 kW charging and 9.6 kW vehicle-to-home discharge — power your house from your car.",
    category: "EV Charger",
    power: "19.2 kW",
    connector: "CCS1",
    badge: "V2H Bidirectional",
    rating: 4.6,
    reviews: 312,
    features: [
      "19.2 kW Bidirectional Charging",
      "9.6 kW Vehicle-to-Home (V2H)",
      "V2H Enablement Kit Compatible",
      "CCS1 Connector",
      "Requires Compatible GM EV",
    ],
  },
  {
    id: 4,
    deviceUuid: "7d7c0158-a699-42c9-a0e3-547d2ea04a4c",
    name: "Emporia Pro Level 2",
    price: 599,
    image: "/premium-ev-charger-with-digital-display-and-sleek-.jpg",
    description:
      "Energy Star certified Level 2 charger with real-time power monitoring, smart load balancing, and UL listing — a solid all-around home pick.",
    category: "EV Charger",
    power: "11.5 kW",
    connector: "J1772",
    badge: "Energy Star",
    rating: 4.7,
    reviews: 644,
    features: [
      "11.5 kW Level 2 Charging",
      "Energy Star Certified",
      "Real-Time Power Monitoring",
      "Smart Load Balancing",
      "UL Listed",
    ],
  },
  {
    id: 5,
    deviceUuid: "05ed9d70-dc5f-4d1d-a9a1-d60628d8076d",
    name: "EVIQO EVIPOWER Gen2",
    price: 399,
    image: "/smart-electrical-splitter-device-for-ev-charging.jpg",
    description:
      "Smart Level 2 charger with Wi-Fi and Gigabit Ethernet, adjustable 6–48 amp output, and plug-in or hardwired configurations. Best value in its class.",
    category: "EV Charger",
    power: "11.5 kW",
    connector: "J1772",
    badge: "Best Value",
    rating: 4.5,
    reviews: 421,
    features: [
      "11.5 kW Level 2 Charging",
      "Wi-Fi + Gigabit Ethernet",
      "Adjustable 6–48A Output",
      "Plug-in or Hardwired",
      "25 ft Cable Included",
    ],
  },
  // ── Smart Thermostats ─────────────────────────────────────────────────────
  {
    id: 6,
    deviceUuid: "338d9e27-9631-4437-ad03-504b392b163e",
    name: "Mysa Smart Thermostat",
    price: 129,
    image: "/thermostat-mysa.png",
    description:
      "Wi-Fi enabled 24 VAC low-voltage smart thermostat for furnaces and heat pumps. Energy Star certified with geofencing, scheduling, and energy-use reporting.",
    category: "Smart Thermostat",
    compatibility: "24 VAC Central HVAC",
    badge: "Compact",
    rating: 4.5,
    reviews: 287,
    features: [
      "Wi-Fi Enabled",
      "Geofencing",
      "Energy-Use Reporting",
      "Furnace & Heat Pump Compatible",
      "Energy Star Certified",
    ],
  },
  {
    id: 7,
    deviceUuid: "7693e843-d657-421b-b03d-2a86fd6bcfc7",
    name: "Honeywell T9",
    price: 149.99,
    image: "/thermostat-honeywell-t9.jpg",
    description:
      "Energy Star certified smart thermostat with Wi-Fi, room sensor support, and Smart Response learning. Works with Alexa, Google, and Apple HomeKit.",
    category: "Smart Thermostat",
    compatibility: "Multi-Stage HVAC",
    badge: "Energy Star",
    rating: 4.6,
    reviews: 1823,
    features: [
      "Energy Star Certified",
      "Room Sensor Compatible",
      "Smart Response Learning",
      "Geofencing",
      "7-Day Scheduling",
    ],
  },
  {
    id: 8,
    deviceUuid: "f9aa761c-ecc9-48e9-bb9f-7e27e91467a3",
    name: "Carrier Smart Thermostat",
    price: 256.44,
    image: "/thermostat-carrier.png",
    description:
      "Advanced smart thermostat with temperature, humidity, proximity, and ambient-light sensors. Controls 2-stage conventional or 3-stage heat-pump systems.",
    category: "Smart Thermostat",
    compatibility: "2H/2C + 3H/2C Heat Pump",
    badge: "Advanced Sensing",
    rating: 4.4,
    reviews: 198,
    features: [
      "Temperature + Humidity Sensors",
      "Proximity Sensing",
      "2-Stage or 3-Stage Heat Pump",
      "Carrier SmartHome App",
      "Voice Control",
    ],
  },
  {
    id: 9,
    deviceUuid: "6110d3ea-2111-4e54-912d-d8e5adacd720",
    name: "ecobee3",
    price: 199,
    image: "/thermostat-ecobee3.png",
    description:
      "ecobee's multi-room thermostat with remote room sensors, smart scheduling, and geofencing. One of the most popular smart thermostats on the market.",
    category: "Smart Thermostat",
    compatibility: "Most HVAC Systems",
    badge: "Room Sensors",
    rating: 4.6,
    reviews: 3241,
    features: [
      "Remote Room Sensors",
      "Smart Scheduling",
      "Geofencing",
      "Multi-Zone Control",
      "Alexa Built-In",
    ],
  },
  {
    id: 10,
    deviceUuid: "9f48f45c-174c-4ea8-ae1f-890a555700cc",
    name: "ecobee4",
    price: 249,
    image: "/thermostat-ecobee4.png",
    description:
      "ecobee's flagship thermostat with built-in Alexa, occupancy sensing, and Follow Me technology that tracks where you are for personalized comfort.",
    category: "Smart Thermostat",
    compatibility: "Most HVAC Systems",
    badge: "Alexa Built-In",
    rating: 4.7,
    reviews: 2891,
    features: [
      "Built-in Alexa",
      "Occupancy Sensing",
      "Room Sensor Ready",
      "Smart Recovery",
      "Follow Me Technology",
    ],
  },
  {
    id: 11,
    deviceUuid: "a124e6b8-4b38-466e-80c6-b0d30fa5a778",
    name: "Google Nest Thermostat",
    price: 99.99,
    image: "/thermostat-nest.avif",
    description:
      "Energy Star certified thermostat that learns your schedule and adjusts automatically. Simple, clean, and deeply integrated with Google Home.",
    category: "Smart Thermostat",
    compatibility: "Most 24V Systems",
    badge: "Best Value",
    rating: 4.5,
    reviews: 5672,
    features: [
      "Energy Star Certified",
      "Auto-Schedule Learning",
      "Google Assistant",
      "Eco Temperatures",
      "Energy History",
    ],
  },
  {
    id: 12,
    deviceUuid: "ded78510-085f-4931-b8b0-2df5f3f26f9d",
    name: "Google Nest Thermostat E",
    price: 169,
    image: "/thermostat-nest-e.avif",
    description:
      "Learning thermostat with a distinctive frosted display. Programs itself, shows your energy history, and works with Alexa, Google, and Apple HomeKit.",
    category: "Smart Thermostat",
    compatibility: "24V Systems",
    badge: "Popular",
    rating: 4.6,
    reviews: 4321,
    features: [
      "Frosted Display",
      "Learning Thermostat",
      "WiFi Connected",
      "Energy Star",
      "Works with Alexa & Google",
    ],
  },
]
