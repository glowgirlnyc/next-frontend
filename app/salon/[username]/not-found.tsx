import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Salon Not Found</h2>
        <p className="text-muted-foreground">
          The salon you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-lg"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
} 