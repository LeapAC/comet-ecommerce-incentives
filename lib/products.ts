export interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  description: string
  category: string
  power: string
  connector: string
  badge: string
  rating: number
  reviews: number
  features: string[]
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Comet Home Pro",
    price: 899,
    originalPrice: 999,
    image: "/modern-white-ev-charger-mounted-on-garage-wall.jpg",
    description: "Professional-grade home charging with smart features and weather-resistant design.",
    category: "Home",
    power: "22kW",
    connector: "Type 2",
    badge: "Best Seller",
    rating: 4.9,
    reviews: 847,
    features: ["22kW Fast Charging", "WiFi Connected", "Weather Resistant", "Smart Scheduling", "Energy Monitoring"],
  },
  {
    id: 2,
    name: "Comet Compact",
    price: 599,
    image: "/compact-sleek-ev-charger-for-apartments.jpg",
    description: "Space-saving design perfect for apartments and condos with easy installation.",
    category: "Home",
    power: "11kW",
    connector: "Type 2",
    badge: "Popular",
    rating: 4.7,
    reviews: 523,
    features: ["11kW Charging", "Compact Design", "Easy Installation", "LED Status Display", "Timer Function"],
  },
  {
    id: 3,
    name: "Comet Business",
    price: 1299,
    image: "/commercial-ev-charging-station-with-dual-ports.jpg",
    description: "Commercial-grade charging for businesses and fleets with dual port capability.",
    category: "Commercial",
    power: "22kW",
    connector: "Dual Type 2",
    badge: "Commercial",
    rating: 4.8,
    reviews: 234,
    features: ["Dual Port", "Load Management", "Payment Integration", "Fleet Management", "Remote Monitoring"],
  },
  {
    id: 4,
    name: "Comet Ultra",
    price: 1599,
    image: "/premium-ev-charger-with-digital-display-and-sleek-.jpg",
    description: "Ultimate charging experience with premium features and DC fast charging capability.",
    category: "Premium",
    power: "50kW",
    connector: "CCS/CHAdeMO",
    badge: "Premium",
    rating: 4.9,
    reviews: 156,
    features: ["50kW DC Fast", "Touch Display", "Premium Materials", "Dynamic Load Balancing", "Solar Integration"],
  },
  {
    id: 5,
    name: "Smart Splitter",
    price: 299,
    image: "/smart-electrical-splitter-device-for-ev-charging.jpg",
    description: "Intelligent power distribution for multiple devices with advanced load balancing.",
    category: "Accessory",
    power: "32A",
    connector: "Universal",
    badge: "Accessory",
    rating: 4.6,
    reviews: 89,
    features: ["Load Balancing", "Smart Control", "Energy Monitoring", "App Control", "Safety Protection"],
  },
]
