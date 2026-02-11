import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  ArrowRight,
  Sparkles,
  MapPin,
  RefreshCw,
  Bot,
  Bell,
  BarChart3,
  Twitter,
  Linkedin,
  Github,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-body">
      {/* Header */}
      <header className="w-full border-b border-[#E8E8E8]">
        <div className="flex items-center justify-between px-16 py-5">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-12">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/logo.svg"
                alt="Trackable"
                width={32}
                height={32}
                className="shrink-0"
              />
              <span className="font-heading text-xl font-semibold text-[#0D0D0D]">
                Trackable
              </span>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-8">
              <Link
                href="#features"
                className="text-sm font-medium text-[#7A7A7A] hover:text-[#0D0D0D] transition-colors"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium text-[#7A7A7A] hover:text-[#0D0D0D] transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium text-[#7A7A7A] hover:text-[#0D0D0D] transition-colors"
              >
                About
              </Link>
            </nav>
          </div>

          {/* Right: Login + CTA */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[#7A7A7A] hover:text-[#0D0D0D] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/app"
              className="flex items-center gap-2 rounded bg-[#3B82F6] px-5 py-2.5 text-[13px] font-medium text-white hover:bg-[#2563EB] transition-colors"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center px-16 py-20">
        {/* Hero Content */}
        <div className="flex w-[800px] flex-col items-center gap-6">
          {/* Badge */}
          <div className="flex items-center gap-2 rounded-full bg-[#EFF6FF] px-4 py-2">
            <Sparkles className="h-3.5 w-3.5 text-[#3B82F6]" />
            <span className="text-[13px] font-medium text-[#3B82F6]">
              AI-Powered Shopping Agent
            </span>
          </div>

          {/* Headline */}
          <h1 className="w-[800px] text-center font-heading text-[56px] font-bold leading-tight text-[#0D0D0D]">
            Never miss a return deadline again
          </h1>

          {/* Subline */}
          <p className="w-[640px] text-center text-lg text-[#7A7A7A]">
            Trackable is your personal AI agent that manages everything after
            checkout. Track orders, monitor return windows, and get proactive
            recommendations — all automatically from your email.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-4">
            <Link
              href="/app"
              className="flex items-center gap-2 rounded bg-[#3B82F6] px-5 py-2.5 text-[15px] font-medium text-white hover:bg-[#2563EB] transition-colors"
            >
              <Mail className="h-4 w-4" />
              Connect Gmail to Start
            </Link>
            <Link
              href="#how-it-works"
              className="flex items-center gap-2 rounded border border-[#E8E8E8] bg-white px-5 py-2.5 text-[15px] font-medium text-[#0D0D0D] hover:bg-[#FAFAFA] transition-colors"
            >
              See How It Works
              <ArrowRight className="h-4 w-4 text-[#7A7A7A]" />
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-12 rounded-xl shadow-[0_24px_64px_-12px_rgba(0,0,0,0.08)]">
          <Image
            src="/hero-dashboard.svg"
            alt="Trackable Dashboard showing return tracking and order management"
            width={1000}
            height={560}
            priority
            className="rounded-xl border border-[#E8E8E8] bg-white"
          />
        </div>

        {/* Trust Section */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <p className="text-[13px] text-[#B0B0B0]">
            Post-purchase is broken for consumers
          </p>
          <div className="flex items-center gap-10">
            <span className="font-heading text-lg font-semibold text-[#B0B0B0]">
              20-30%
            </span>
            <span className="font-heading text-lg font-semibold text-[#B0B0B0]">
              40%+
            </span>
            <span className="font-heading text-lg font-semibold text-[#B0B0B0]">
              $B+
            </span>
            <span className="font-heading text-lg font-semibold text-[#B0B0B0]">
              Lost
            </span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full bg-[#FAFAFA] px-16 py-20">
        <div className="flex flex-col items-center gap-12">
          {/* Header */}
          <div className="flex w-[600px] flex-col items-center gap-4">
            <span className="text-xs font-semibold tracking-[1.5px] text-[#3B82F6]">
              HOW IT WORKS
            </span>
            <h2 className="text-center font-heading text-[40px] font-bold text-[#0D0D0D]">
              Get started in seconds
            </h2>
            <p className="text-center text-base text-[#7A7A7A]">
              Your agent handles the rest
            </p>
          </div>

          {/* Steps */}
          <div className="flex w-full gap-8">
            {/* Step 1 */}
            <div className="flex flex-1 flex-col gap-5 rounded-xl border border-[#E8E8E8] bg-white p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF]">
                <span className="font-heading text-xl font-bold text-[#3B82F6]">
                  1
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-heading text-xl font-semibold text-[#0D0D0D]">
                  Connect Gmail
                </h3>
                <p className="text-sm text-[#7A7A7A]">
                  Securely connect your Gmail account. We only read order-related
                  emails — no write permissions, ever.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-1 flex-col gap-5 rounded-xl border border-[#E8E8E8] bg-white p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF]">
                <span className="font-heading text-xl font-bold text-[#3B82F6]">
                  2
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-heading text-xl font-semibold text-[#0D0D0D]">
                  Agent Discovers Orders
                </h3>
                <p className="text-sm text-[#7A7A7A]">
                  Your AI agent automatically finds and organizes all your
                  purchases. No manual entry required.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-1 flex-col gap-5 rounded-xl border border-[#E8E8E8] bg-white p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF]">
                <span className="font-heading text-xl font-bold text-[#3B82F6]">
                  3
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-heading text-xl font-semibold text-[#0D0D0D]">
                  Get Proactive Help
                </h3>
                <p className="text-sm text-[#7A7A7A]">
                  Receive alerts before return windows close, track shipments, and
                  get guidance when you need it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full px-16 py-20">
        <div className="flex flex-col items-center gap-12">
          {/* Header */}
          <div className="flex w-[600px] flex-col items-center gap-4">
            <span className="text-xs font-semibold tracking-[1.5px] text-[#3B82F6]">
              AGENT CAPABILITIES
            </span>
            <h2 className="text-center font-heading text-[40px] font-bold text-[#0D0D0D]">
              Your AI agent that works for you
            </h2>
            <p className="text-center text-base text-[#7A7A7A]">
              Trackable is not a dashboard — it&apos;s an intelligent agent that
              proactively manages your post-purchase experience.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="flex w-full flex-col gap-6">
            {/* Row 1 */}
            <div className="flex gap-6">
              {/* Feature 1 */}
              <div className="flex flex-1 flex-col gap-4 rounded-xl bg-[#FAFAFA] p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#EFF6FF]">
                  <MapPin className="h-6 w-6 text-[#3B82F6]" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-[#0D0D0D]">
                  Automatic Order Detection
                </h3>
                <p className="text-sm text-[#7A7A7A]">
                  Connect your Gmail and watch as your agent discovers and
                  organizes all your orders. No manual entry required.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-1 flex-col gap-4 rounded-xl bg-[#FAFAFA] p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#ECFDF5]">
                  <RefreshCw className="h-6 w-6 text-[#10B981]" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-[#0D0D0D]">
                  Return Window Tracking
                </h3>
                <p className="text-sm text-[#7A7A7A]">
                  Never miss a return deadline. Your agent monitors every purchase
                  and alerts you before windows close.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-1 flex-col gap-4 rounded-xl bg-[#FAFAFA] p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F5F3FF]">
                  <Bot className="h-6 w-6 text-[#8B5CF6]" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-[#0D0D0D]">
                  Natural Language Chat
                </h3>
                <p className="text-sm text-[#7A7A7A]">
                  Just ask. &quot;Can I still return this?&quot; or &quot;What
                  orders are arriving this week?&quot; Your agent understands.
                </p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex gap-6">
              {/* Feature 4 */}
              <div className="flex flex-1 flex-col gap-4 rounded-xl bg-[#FAFAFA] p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FEF3C7]">
                  <Bell className="h-6 w-6 text-[#F59E0B]" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-[#0D0D0D]">
                  Proactive Alerts
                </h3>
                <p className="text-sm text-[#7A7A7A]">
                  Get notified about deliveries, return deadlines, and refund
                  status. Your agent watches so you don&apos;t have to.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="flex flex-1 flex-col gap-4 rounded-xl bg-[#FAFAFA] p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#EFF6FF]">
                  <BarChart3 className="h-6 w-6 text-[#3B82F6]" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-[#0D0D0D]">
                  Policy Interpreter
                </h3>
                <p className="text-sm text-[#7A7A7A]">
                  Your agent reads return policies so you don&apos;t have to. Get
                  clear guidance on eligibility and next steps.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="flex flex-1 flex-col gap-4 rounded-xl bg-[#FAFAFA] p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#ECFDF5]">
                  <Mail className="h-6 w-6 text-[#10B981]" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-[#0D0D0D]">
                  Gmail Integration
                </h3>
                <p className="text-sm text-[#7A7A7A]">
                  Securely connect your inbox. We only read order-related emails —
                  no write access, no data selling, ever.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="w-full bg-[#0D0D0D] px-16 py-20">
        <div className="flex flex-col items-center gap-16">
          {/* Stats Row */}
          <div className="flex items-center justify-center gap-16">
            <div className="flex flex-col items-center gap-1">
              <span className="font-heading text-5xl font-bold text-white">
                20-30%
              </span>
              <span className="text-sm text-[#B0B0B0]">Average return rate</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-heading text-5xl font-bold text-white">
                40%+
              </span>
              <span className="text-sm text-[#B0B0B0]">In apparel returns</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-heading text-5xl font-bold text-white">
                $B+
              </span>
              <span className="text-sm text-[#B0B0B0]">
                Lost to missed deadlines
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-heading text-5xl font-bold text-white">
                100%
              </span>
              <span className="text-sm text-[#B0B0B0]">Free to use</span>
            </div>
          </div>

          {/* Testimonials */}
          <div className="flex w-full gap-6">
            {/* Testimonial 1 */}
            <div className="flex flex-1 flex-col gap-5 rounded-xl bg-[#1A1A1A] p-8">
              <p className="text-base text-white">
                &quot;I ordered three shoe sizes to find the right fit for my
                daughter. Trackable reminded me 3 days before the return window
                closed — saving me $120 on the two pairs that didn&apos;t
                fit.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3B82F6]">
                  <span className="text-sm font-semibold text-white">SK</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-white">
                    Monica R.
                  </span>
                  <span className="text-[13px] text-[#B0B0B0]">
                    Working Parent
                  </span>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="flex flex-1 flex-col gap-5 rounded-xl bg-[#1A1A1A] p-8">
              <p className="text-base text-white">
                &quot;I wanted to exchange my laptop but couldn&apos;t find clear
                instructions anywhere. Trackable&apos;s agent explained the policy
                and told me exactly what to do. Hours of research saved.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10B981]">
                  <span className="text-sm font-semibold text-white">MJ</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-white">
                    John T.
                  </span>
                  <span className="text-[13px] text-[#B0B0B0]">
                    College Student
                  </span>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="flex flex-1 flex-col gap-5 rounded-xl bg-[#1A1A1A] p-8">
              <p className="text-base text-white">
                &quot;Finally something that just works. Connected my Gmail, and
                within minutes I could see all my orders organized with return
                deadlines highlighted. Game changer.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8B5CF6]">
                  <span className="text-sm font-semibold text-white">EL</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-white">
                    Sarah K.
                  </span>
                  <span className="text-[13px] text-[#B0B0B0]">
                    Online Shopper
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="w-full bg-[#EFF6FF] px-16 py-24">
        <div className="flex flex-col items-center gap-8">
          <div className="flex w-[700px] flex-col items-center gap-6">
            <h2 className="text-center font-heading text-[40px] font-bold text-[#0D0D0D]">
              Stop losing money on missed returns
            </h2>
            <p className="text-center text-lg text-[#7A7A7A]">
              Join smart shoppers who let their AI agent handle post-purchase
              chaos. Free to use, no credit card required.
            </p>
            <Link
              href="/app"
              className="flex items-center gap-2 rounded bg-[#3B82F6] px-7 py-3.5 text-base font-medium text-white hover:bg-[#2563EB] transition-colors"
            >
              <Mail className="h-4 w-4" />
              Get Started with Gmail
            </Link>
            <p className="text-sm text-[#7A7A7A]">
              Free forever &bull; Privacy-first &bull; Your data stays yours
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#FAFAFA] px-16 py-16">
        <div className="flex flex-col gap-12">
          {/* Footer Top */}
          <div className="flex justify-between">
            {/* Brand */}
            <div className="flex w-[300px] flex-col gap-4">
              <Link href="/" className="flex items-center gap-2.5">
                <Image
                  src="/logo.svg"
                  alt="Trackable"
                  width={28}
                  height={28}
                  className="shrink-0"
                />
                <span className="font-heading text-lg font-semibold text-[#0D0D0D]">
                  Trackable
                </span>
              </Link>
              <p className="w-[280px] text-sm text-[#7A7A7A]">
                Your personal AI agent for post-purchase. Track orders, never miss
                returns, get proactive help.
              </p>
            </div>

            {/* Links */}
            <div className="flex gap-16">
              {/* Product */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-semibold tracking-[0.5px] text-[#0D0D0D]">
                  Product
                </span>
                <div className="flex flex-col gap-2.5">
                  <Link
                    href="#features"
                    className="text-sm text-[#7A7A7A] hover:text-[#0D0D0D] transition-colors"
                  >
                    Features
                  </Link>
                  <Link
                    href="#pricing"
                    className="text-sm text-[#7A7A7A] hover:text-[#0D0D0D] transition-colors"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="#"
                    className="text-sm text-[#7A7A7A] hover:text-[#0D0D0D] transition-colors"
                  >
                    Integrations
                  </Link>
                  <Link
                    href="#"
                    className="text-sm text-[#7A7A7A] hover:text-[#0D0D0D] transition-colors"
                  >
                    API
                  </Link>
                </div>
              </div>

              {/* Company */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-semibold tracking-[0.5px] text-[#0D0D0D]">
                  Company
                </span>
                <div className="flex flex-col gap-2.5">
                  <Link
                    href="#about"
                    className="text-sm text-[#7A7A7A] hover:text-[#0D0D0D] transition-colors"
                  >
                    About
                  </Link>
                  <Link
                    href="#"
                    className="text-sm text-[#7A7A7A] hover:text-[#0D0D0D] transition-colors"
                  >
                    Blog
                  </Link>
                  <Link
                    href="#"
                    className="text-sm text-[#7A7A7A] hover:text-[#0D0D0D] transition-colors"
                  >
                    Careers
                  </Link>
                  <Link
                    href="#"
                    className="text-sm text-[#7A7A7A] hover:text-[#0D0D0D] transition-colors"
                  >
                    Contact
                  </Link>
                </div>
              </div>

              {/* Legal */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-semibold tracking-[0.5px] text-[#0D0D0D]">
                  Legal
                </span>
                <div className="flex flex-col gap-2.5">
                  <Link
                    href="#"
                    className="text-sm text-[#7A7A7A] hover:text-[#0D0D0D] transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="#"
                    className="text-sm text-[#7A7A7A] hover:text-[#0D0D0D] transition-colors"
                  >
                    Terms of Service
                  </Link>
                  <Link
                    href="#"
                    className="text-sm text-[#7A7A7A] hover:text-[#0D0D0D] transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="flex items-center justify-between border-t border-[#E8E8E8] pt-6">
            <span className="text-[13px] text-[#7A7A7A]">
              &copy; 2026 Trackable. All rights reserved.
            </span>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-[#7A7A7A] hover:text-[#0D0D0D] transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-[#7A7A7A] hover:text-[#0D0D0D] transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-[#7A7A7A] hover:text-[#0D0D0D] transition-colors">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
