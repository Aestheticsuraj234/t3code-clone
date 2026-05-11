import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex max-w-3xl flex-1 flex-col items-center justify-between gap-12 bg-white px-8 py-24 sm:items-start dark:bg-black sm:px-16">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs font-semibold text-3xl text-black leading-10 tracking-tight dark:text-zinc-50">
            You&apos;re signed in — this route is protected by the app proxy.
          </h1>
          <p className="max-w-md text-lg text-zinc-600 leading-8 dark:text-zinc-400">
            Public routes are configured in{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm">src/lib/auth-routes.ts</code>
            . Adjust the list as you add marketing pages or other open paths.
          </p>
        </div>
        <div className="flex flex-col gap-4 font-medium text-base sm:flex-row">
          <Link
            className="flex h-12 w-full items-center justify-center rounded-full border border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </Link>
        </div>
      </main>
    </div>
  );
}
