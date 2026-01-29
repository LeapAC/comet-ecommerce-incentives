"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Shield, Star, Search, Filter, ShoppingCart } from "@/components/ui/lucide-icons"
import { CartDrawer } from "@/components/cart-drawer"
import { MobileNav } from "@/components/mobile-nav"
import { useCart } from "@/lib/cart-context"
import Link from "next/link"

const products = [
  {
    id: 1,
    name: "Comet Home Pro",
    price: 899,
    originalPrice: 999,
    image: "/modern-white-ev-charger-mounted-on-garage-wall.jpg",
    description: "Professional-grade home charging with smart features and weather-resistant design",
    category: "Home",
    power: "22kW",
    connector: "Type 2",
    features: ["22kW Fast Charging", "WiFi Connected", "Weather Resistant", "Smart Scheduling", "Energy Monitoring"],
    specifications: {
      "Power Output": "22kW AC",
      "Connector Type": "Type 2 (IEC 62196-2)",
      "Cable Length": "7.5m",
      Protection: "IP65",
      Connectivity: "WiFi, Bluetooth, 4G",
      Installation: "Wall Mount",
      Warranty: "3 Years",
    },
    badge: "Best Seller",
    rating: 4.9,
    reviews: 847,
    inStock: true,
  },
  {
    id: 2,
    name: "Comet Compact",
    price: 599,
    image: "/compact-sleek-ev-charger-for-apartments.jpg",
    description: "Space-saving design perfect for apartments and condos with easy installation",
    category: "Home",
    power: "11kW",
    connector: "Type 2",
    features: ["11kW Charging", "Compact Design", "Easy Installation", "LED Status Display", "Timer Function"],
    specifications: {
      "Power Output": "11kW AC",
      "Connector Type": "Type 2 (IEC 62196-2)",
      "Cable Length": "5m",
      Protection: "IP54",
      Connectivity: "WiFi, Bluetooth",
      Installation: "Wall Mount",
      Warranty: "2 Years",
    },
    badge: "Popular",
    rating: 4.7,
    reviews: 523,
    inStock: true,
  },
  {
    id: 3,
    name: "Comet Business",
    price: 1299,
    image: "/commercial-ev-charging-station-with-dual-ports.jpg",
    description: "Commercial-grade charging for businesses and fleets with dual port capability",
    category: "Commercial",
    power: "22kW",
    connector: "Dual Type 2",
    features: ["Dual Port", "Load Management", "Payment Integration", "Fleet Management", "Remote Monitoring"],
    specifications: {
      "Power Output": "22kW AC (per port)",
      "Connector Type": "2x Type 2 (IEC 62196-2)",
      "Cable Length": "7.5m each",
      Protection: "IP65",
      Connectivity: "Ethernet, WiFi, 4G",
      Installation: "Pedestal Mount",
      Warranty: "5 Years",
    },
    badge: "Commercial",
    rating: 4.8,
    reviews: 234,
    inStock: true,
  },
  {
    id: 4,
    name: "Comet Ultra",
    price: 1599,
    image: "/premium-ev-charger-with-digital-display-and-sleek-.jpg",
    description: "Ultimate charging experience with premium features and DC fast charging capability",
    category: "Premium",
    power: "50kW",
    connector: "CCS/CHAdeMO",
    features: ["50kW DC Fast", "Touch Display", "Premium Materials", "Dynamic Load Balancing", "Solar Integration"],
    specifications: {
      "Power Output": "50kW DC",
      "Connector Type": "CCS2, CHAdeMO",
      "Cable Length": "5m",
      Protection: "IP65",
      Connectivity: "Ethernet, WiFi, 4G, 5G",
      Installation: "Floor Mount",
      Warranty: "5 Years",
    },
    badge: "Premium",
    rating: 4.9,
    reviews: 156,
    inStock: true,
  },
  {
    id: 5,
    name: "Smart Splitter",
    price: 299,
    image: "/smart-electrical-splitter-device-for-ev-charging.jpg",
    description: "Intelligent power distribution for multiple devices with advanced load balancing",
    category: "Accessory",
    power: "32A",
    connector: "Universal",
    features: ["Load Balancing", "Smart Control", "Energy Monitoring", "App Control", "Safety Protection"],
    specifications: {
      "Max Current": "32A",
      Voltage: "230V AC",
      Ports: "2x Type 2 Output",
      Protection: "IP44",
      Connectivity: "WiFi, Bluetooth",
      Installation: "DIN Rail",
      Warranty: "2 Years",
    },
    badge: "Accessory",
    rating: 4.6,
    reviews: 89,
    inStock: true,
  },
]

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("popular")
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const { dispatch } = useCart()
  const { toast } = useToast()

  const addToCart = (product: (typeof products)[0]) => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      },
    })
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory =
        categoryFilter === "all" || product.category.toLowerCase() === categoryFilter.toLowerCase()
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "rating":
          return b.rating - a.rating
        case "popular":
        default:
          return b.reviews - a.reviews
      }
    })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/comet.png" alt="Comet" className="h-8 w-8" />
            <span className="text-2xl font-bold text-foreground">Comet</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/products" className="text-sm font-medium text-primary border-b-2 border-primary pb-1">
              Products
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/support"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Support
            </Link>
            <CartDrawer />
          </nav>
          <MobileNav />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-balance">EV Charging Solutions</h1>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Discover our complete range of electric vehicle chargers and accessories designed for every need
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 border-b">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="accessory">Accessory</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardHeader className="p-0">
                  <div className="relative">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-4 left-4" variant="secondary">
                      {product.badge}
                    </Badge>
                    {product.originalPrice && (
                      <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground">
                        Save ${product.originalPrice - product.price}
                      </Badge>
                    )}
                    <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <span className="text-xs font-medium">{product.rating}</span>
                        <span className="text-xs text-muted-foreground">({product.reviews})</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {product.name}
                      </CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">{product.description}</CardDescription>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        {product.power}
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        {product.connector}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {product.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="h-1.5 w-1.5 bg-primary rounded-full flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                      {product.features.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          +{product.features.length - 3} more features
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-primary">${product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProduct(selectedProduct === product.id ? null : product.id)}
                        >
                          {selectedProduct === product.id ? "Hide Details" : "Details"}
                        </Button>
                        <Button size="sm" disabled={!product.inStock} onClick={() => addToCart(product)}>
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedProduct === product.id && (
                      <div className="mt-4 pt-4 border-t space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <div>
                          <h4 className="font-semibold mb-2">All Features</h4>
                          <div className="grid grid-cols-1 gap-1">
                            {product.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="h-1.5 w-1.5 bg-primary rounded-full flex-shrink-0" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Specifications</h4>
                          <div className="space-y-2">
                            {Object.entries(product.specifications).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{key}:</span>
                                <span className="font-medium">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="space-y-4">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">No products found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setCategoryFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container text-center">
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-balance">Need Help Choosing the Right Charger?</h2>
            <p className="text-lg text-muted-foreground text-balance">
              Our experts are here to help you find the perfect EV charging solution for your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">Get Expert Advice</Button>
              <Button variant="outline" size="lg">
                Download Buying Guide
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-16">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Link href="/" className="flex items-center space-x-2">
                <img src="/comet.png" alt="Comet" className="h-6 w-6" />
                <span className="text-xl font-bold">Comet</span>
              </Link>
              <p className="text-muted-foreground">
                Leading the future of electric vehicle charging with innovative, sustainable solutions.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Products</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/products" className="block hover:text-foreground transition-colors">
                  Home Chargers
                </Link>
                <Link href="/products" className="block hover:text-foreground transition-colors">
                  Commercial
                </Link>
                <Link href="/products" className="block hover:text-foreground transition-colors">
                  Accessories
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Support</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/support" className="block hover:text-foreground transition-colors">
                  Installation
                </Link>
                <Link href="/support" className="block hover:text-foreground transition-colors">
                  Warranty
                </Link>
                <Link href="/support" className="block hover:text-foreground transition-colors">
                  Contact
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/about" className="block hover:text-foreground transition-colors">
                  About Us
                </Link>
                <Link href="/careers" className="block hover:text-foreground transition-colors">
                  Careers
                </Link>
                <Link href="/news" className="block hover:text-foreground transition-colors">
                  News
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Comet. All rights reserved. Powering the future of transportation.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
