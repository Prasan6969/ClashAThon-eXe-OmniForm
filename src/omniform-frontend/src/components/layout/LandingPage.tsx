import { SignInButton } from "@clerk/clerk-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export const LandingPage = () => (
  <div className="min-h-screen bg-white">
    <header className="px-6 py-6 sm:px-10">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-[0.2em] text-sand-500">
            Omniform
          </p>
          <h1 className="text-2xl font-semibold text-sand-950 sm:text-3xl">
            End the data tax
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <SignInButton>
            <Button size="sm">Sign in</Button>
          </SignInButton>
        </div>
      </nav>
    </header>

    <main className="px-6 pb-16 sm:px-10">
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.4em] text-sand-500">
            Creative Clash 2026
          </p>
          <h2 className="text-4xl font-semibold text-sand-950 sm:text-5xl">
            One profile. Every form. Zero retyping.
          </h2>
          <p className="text-base text-sand-700 sm:text-lg">
            Omniform keeps your core details secure and ready. Sign in once and
            reuse your profile whenever you need to submit a form.
          </p>
          <div className="flex flex-wrap gap-3">
            <SignInButton>
              <Button size="lg">Start filling</Button>
            </SignInButton>
            <Button variant="secondary" size="lg">
              See how it works
            </Button>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-sand-500">
            <span>Secure by design</span>
            <span>Role-based access</span>
            <span>Built for banks, clinics, campuses</span>
          </div>
        </div>
        <div className="grid gap-4">
          <Card className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-sand-500">
              Live forms
            </p>
            <p className="text-xl font-semibold text-sand-950">
              Organizations publish, users fill
            </p>
            <p className="text-sm text-sand-500">
              Drag-and-drop form builder for admins, clean review flow for
              organizations.
            </p>
          </Card>
          <Card className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-sand-500">
              Autofill intelligence
            </p>
            <p className="text-xl font-semibold text-sand-950">
              Tags map to your profile
            </p>
            <p className="text-sm text-sand-500">
              Each field is tagged to your saved info, with prompts to save
              missing details.
            </p>
          </Card>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-6xl">
        <Card className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-sand-500">
              Ready to stop retyping?
            </p>
            <h3 className="text-2xl font-semibold text-sand-950">
              Sign in and build your profile once.
            </h3>
          </div>
          <SignInButton>
            <Button size="lg">Get started</Button>
          </SignInButton>
        </Card>
      </section>
    </main>
  </div>
);
