import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Leaf, Shield, Wifi, ArrowRight, Star } from "@/components/ui/lucide-icons"
import { CartDrawer } from "@/components/cart-drawer"
import { MobileNav } from "@/components/mobile-nav"
import Link from "next/link"

export default function HomePage() {
  const products = [
    {
      id: 1,
      name: "Comet Home Pro",
      price: "$899",
      image: "/modern-white-ev-charger-mounted-on-garage-wall.jpg",
      description: "Professional-grade home charging with smart features",
      features: ["22kW Fast Charging", "WiFi Connected", "Weather Resistant"],
      badge: "Best Seller",
    },
    {
      id: 2,
      name: "Comet Compact",
      price: "$599",
      image: "/compact-sleek-ev-charger-for-apartments.jpg",
      description: "Space-saving design perfect for apartments and condos",
      features: ["11kW Charging", "Compact Design", "Easy Installation"],
      badge: "Popular",
    },
    {
      id: 3,
      name: "Comet Business",
      price: "$1,299",
      image: "/commercial-ev-charging-station-with-dual-ports.jpg",
      description: "Commercial-grade charging for businesses and fleets",
      features: ["Dual Port", "Load Management", "Payment Integration"],
      badge: "Commercial",
    },
    {
      id: 4,
      name: "Comet Ultra",
      price: "$1,599",
      image: "/premium-ev-charger-with-digital-display-and-sleek-.jpg",
      description: "Ultimate charging experience with premium features",
      features: ["50kW DC Fast", "Touch Display", "Premium Materials"],
      badge: "Premium",
    },
    {
      id: 5,
      name: "Smart Splitter",
      price: "$299",
      image: "/smart-electrical-splitter-device-for-ev-charging.jpg",
      description: "Intelligent power distribution for multiple devices",
      features: ["Load Balancing", "Smart Control", "Energy Monitoring"],
      badge: "Accessory",
    },
  ]

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
            <Link
              href="/products"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
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
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <Leaf className="h-3 w-3 mr-1" />
                  Sustainable Charging
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-balance leading-tight">
                  Power Your Future with <span className="text-primary">Smart EV Charging</span>
                </h1>
                <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                  Experience the next generation of electric vehicle charging with Comet's innovative, eco-friendly
                  solutions designed for modern homes and businesses.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8" asChild>
                  <Link href="/products">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                  Learn More
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">4.9/5 from 2,000+ reviews</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="/modern-ev-charger-in-use-with-electric-car-chargin.jpg"
                alt="Comet EV Charger in use"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-lg border">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Fast Charging</p>
                    <p className="text-sm text-muted-foreground">Up to 50kW DC</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Why Choose Comet?</h2>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Advanced technology meets sustainable design for the ultimate charging experience
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Charge your EV up to 10x faster than standard outlets with our advanced charging technology
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wifi className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Smart Connected</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Monitor and control your charging remotely with our intuitive mobile app and WiFi connectivity
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Built to Last</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Weather-resistant design with premium materials ensures reliable performance for years to come
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-20">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Our Product Range</h2>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              From compact home chargers to commercial solutions, find the perfect fit for your needs
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.slice(0, 3).map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div className="relative">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-4 left-4" variant="secondary">
                      {product.badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <CardTitle className="text-xl">{product.name}</CardTitle>
                      <CardDescription className="mt-2">{product.description}</CardDescription>
                    </div>
                    <div className="space-y-2">
                      {product.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <span className="text-2xl font-bold text-primary">{product.price}</span>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/products">Learn More</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link href="/products">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
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
