import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <h1 className="font-cormorant text-6xl font-light text-ink-800">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">Page not found</p>
      <Link
        href="/"
        className="mt-8 text-sm text-seal underline underline-offset-4 hover:text-seal/80"
      >
        Back to home
      </Link>
    </div>
  );
}
