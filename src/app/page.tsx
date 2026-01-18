import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Mail,
  Clock,
  RotateCcw,
  Sparkles,
  Shield,
  Bell,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Truck,
  CalendarClock,
  Bot,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">Trackable</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="#privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/app">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container relative mx-auto max-w-6xl px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              AI-Powered Shopping Agent
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Never miss a return deadline{" "}
              <span className="text-primary">again</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Trackable is your personal AI agent that manages everything after
              checkout. Track orders, monitor return windows, and get proactive
              recommendations — all automatically from your email.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/app">
                  <Mail className="mr-2 h-5 w-5" />
                  Connect Gmail to Start
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                asChild
              >
                <Link href="#how-it-works">
                  See How It Works
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Free to use. No credit card required.
            </p>
          </div>

          {/* Hero Stats */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">20-30%</p>
              <p className="text-sm text-muted-foreground">
                Average return rate
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">40%+</p>
              <p className="text-sm text-muted-foreground">
                In apparel returns
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">$B+</p>
              <p className="text-sm text-muted-foreground">
                Lost to missed deadlines
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="border-y bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
              Post-purchase is broken
            </h2>
            <p className="mb-12 text-muted-foreground">
              Managing orders after checkout is frustrating, time-consuming, and
              full of missed opportunities.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Mail,
                title: "Inbox chaos",
                desc: "Digging through emails to find order confirmations and receipts",
              },
              {
                icon: Truck,
                title: "Tracking madness",
                desc: "Jumping between FedEx, UPS, USPS, and merchant portals",
              },
              {
                icon: Clock,
                title: "Missed deadlines",
                desc: "Forgetting return windows and losing money on unwanted items",
              },
              {
                icon: RotateCcw,
                title: "Policy confusion",
                desc: "Return vs exchange? Free returns? Buried in policy pages",
              },
              {
                icon: MessageSquare,
                title: "Support friction",
                desc: "Hours wasted just trying to understand next steps",
              },
              {
                icon: CalendarClock,
                title: "Manual tracking",
                desc: "Calendars, spreadsheets, sticky notes — none of it works",
              },
            ].map((item, i) => (
              <Card key={i} className="bg-background">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                    <item.icon className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Bot className="mr-1.5 h-3.5 w-3.5" />
              Agent Capabilities
            </Badge>
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
              Your AI agent that works for you
            </h2>
            <p className="text-muted-foreground">
              Trackable is not a dashboard — it's an intelligent agent that
              proactively manages your post-purchase experience.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Feature 1 - Order Awareness */}
            <Card className="overflow-hidden">
              <CardContent className="py-6 bg-gradient-to-br from-primary/10 to-primary/5">
                <div className="p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-1.5 text-lg font-semibold">
                    Automatic Order Detection
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Connect your Gmail and watch as your agent discovers and
                    organizes all your orders. No manual entry required.
                  </p>
                  <ul className="space-y-1.5">
                    {[
                      "Parses order confirmations automatically",
                      "Tracks shipments across all carriers",
                      "Organizes by merchant and status",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 - Proactive Alerts */}
            <Card className="overflow-hidden">
              <CardContent className="py-6 bg-gradient-to-br from-status-alert/10 to-status-alert/5">
                <div className="p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-status-alert/10">
                    <Bell className="h-5 w-5 text-status-alert" />
                  </div>
                  <h3 className="mb-1.5 text-lg font-semibold">
                    Proactive Interventions
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Your agent watches deadlines and alerts you before it's too
                    late. Never miss a return window again.
                  </p>
                  <ul className="space-y-1.5">
                    {[
                      "Return window countdown alerts",
                      "Delivery confirmation notifications",
                      "Refund status monitoring",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-status-alert" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 - Policy Understanding */}
            <Card className="overflow-hidden">
              <CardContent className="p-6 bg-gradient-to-br from-status-return/10 to-status-return/5">
                <div className="p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-status-return/10">
                    <RotateCcw className="h-5 w-5 text-status-return" />
                  </div>
                  <h3 className="mb-1.5 text-lg font-semibold">
                    Return & Exchange Planning
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Your agent reads and interprets return policies so you don't
                    have to. Get clear recommendations.
                  </p>
                  <ul className="space-y-1.5">
                    {[
                      "Policy interpretation & eligibility",
                      "Deadline tracking & reminders",
                      "Step-by-step return guidance",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-status-return" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Feature 4 - Natural Language */}
            <Card className="overflow-hidden">
              <CardContent className="p-6 bg-gradient-to-br from-status-delivered/10 to-status-delivered/5">
                <div className="p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-status-delivered/10">
                    <MessageSquare className="h-5 w-5 text-status-delivered" />
                  </div>
                  <h3 className="mb-1.5 text-lg font-semibold">
                    Natural Language Interface
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Just ask. Your agent understands natural language and can
                    help with any post-purchase question.
                  </p>
                  <ul className="space-y-1.5">
                    {[
                      '"Can I still return this?"',
                      '"Start an exchange for a smaller size"',
                      '"What orders are arriving this week?"',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-status-delivered" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="border-y bg-muted/30 py-16 md:py-24"
      >
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
              How Trackable Works
            </h2>
            <p className="text-muted-foreground">
              Get started in seconds. Your agent handles the rest.
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Connect Gmail",
                  desc: "Securely connect your Gmail account. We only read order-related emails.",
                  icon: Mail,
                },
                {
                  step: "2",
                  title: "Agent Discovers Orders",
                  desc: "Your AI agent automatically finds and organizes all your purchases.",
                  icon: Sparkles,
                },
                {
                  step: "3",
                  title: "Get Proactive Help",
                  desc: "Receive alerts, recommendations, and guidance before deadlines hit.",
                  icon: Bell,
                },
              ].map((item, i) => (
                <div key={i} className="relative text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <item.icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                  {i < 2 && (
                    <div className="absolute right-0 top-8 hidden h-0.5 w-full translate-x-1/2 bg-border md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases / Scenarios */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
              Built for busy shoppers
            </h2>
            <p className="text-muted-foreground">
              Whether you're a busy parent, student, or online shopping
              enthusiast.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-6">
                <div className="mb-4">
                  <Badge variant="outline">Working Parent</Badge>
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  Monica's shoe dilemma
                </h3>
                <p className="mb-4 text-muted-foreground">
                  Monica ordered three shoe sizes to find the right fit for her
                  daughter. With Trackable, she got a reminder 3 days before the
                  return window closed — saving her $120 on the two pairs that
                  didn't fit.
                </p>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  Return window reminder saved $120
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-6">
                <div className="mb-4">
                  <Badge variant="outline">College Student</Badge>
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  John's laptop exchange
                </h3>
                <p className="mb-4 text-muted-foreground">
                  John wanted to exchange his laptop for a different model but
                  couldn't find clear instructions. Trackable's agent explained
                  the policy and prepared everything he needed to start the
                  exchange.
                </p>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  Hours of research saved
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy & Trust Section */}
      <section id="privacy" className="border-y bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Shield className="mr-1.5 h-3.5 w-3.5" />
              Privacy First
            </Badge>
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
              Your data stays yours
            </h2>
            <p className="text-muted-foreground">
              Trust is not just a feature — it's foundational to everything we
              build.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {[
              {
                icon: Shield,
                title: "Minimal Gmail access",
                desc: "We only request read access to order-related emails. No write permissions, ever.",
              },
              {
                icon: CheckCircle2,
                title: "No data selling",
                desc: "Your email data is never sold, shared, or used for advertising. Period.",
              },
              {
                icon: RotateCcw,
                title: "Full control",
                desc: "Disconnect Gmail and delete all your data anytime. No questions asked.",
              },
              {
                icon: Package,
                title: "Purpose-limited",
                desc: "Data is used exclusively for post-purchase management. Nothing else.",
              },
            ].map((item, i) => (
              <Card key={i}>
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-primary to-primary/80 p-8 text-center text-primary-foreground md:p-12">
                <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
                  Stop losing money on missed returns
                </h2>
                <p className="mx-auto mb-8 max-w-xl opacity-90">
                  Join thousands of smart shoppers who let their AI agent handle
                  post-purchase chaos. Free to use, no credit card required.
                </p>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/app">
                    <Mail className="mr-2 h-5 w-5" />
                    Get Started with Gmail
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Package className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">Trackable</span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <Link
                href="#features"
                className="hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="hover:text-foreground transition-colors"
              >
                How it Works
              </Link>
              <Link
                href="#privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/app"
                className="hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            </nav>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Trackable. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
