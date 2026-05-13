"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

import { authFetch } from "@/components/dashboard/auth";

type AppBookmark = {
  name: string;
  url: string;
  category: string;
  image?: string;
  icon?: string;
  synced?: boolean;
};

const CATEGORY_ORDER = ["Ops", "Apps"];

function appFallbackIcon(app: AppBookmark) {
  return app.icon || app.name.trim().slice(0, 1).toUpperCase() || "•";
}

function compareCategories(left: string, right: string) {
  const leftIndex = CATEGORY_ORDER.indexOf(left);
  const rightIndex = CATEGORY_ORDER.indexOf(right);

  if (leftIndex !== -1 || rightIndex !== -1) {
    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  }

  return left.localeCompare(right);
}

function AppIcon({ app }: { app: AppBookmark }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (app.image && !imageFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={app.image}
        alt=""
        className="h-12 w-12 object-contain transition-transform group-hover:scale-105 sm:h-14 sm:w-14"
        aria-hidden="true"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center text-2xl font-semibold leading-none text-zinc-700 transition-transform group-hover:scale-105 dark:text-zinc-200 sm:h-14 sm:w-14 sm:text-3xl">
      {appFallbackIcon(app)}
    </div>
  );
}

function AppGrid({ apps }: { apps: AppBookmark[] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900/80 dark:shadow-none">
      <div className="grid grid-cols-3 gap-x-6 gap-y-8 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {apps.map((app) => (
          <a
            key={`${app.name}-${app.url}`}
            href={app.url}
            target="_blank"
            rel="noreferrer"
            title={app.url}
            className="group flex min-w-0 flex-col items-center gap-2.5 rounded-2xl px-2 py-3 text-center transition-colors hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60"
          >
            <div className="relative">
              <AppIcon app={app} />
              {app.synced ? (
                <div
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-emerald-300 bg-emerald-600 text-white shadow-sm shadow-emerald-900/15 dark:border-emerald-300/60 dark:bg-emerald-400 dark:text-emerald-950"
                  title="Synced"
                  aria-label="Synced"
                >
                  <RefreshCw size={13} strokeWidth={2.4} />
                </div>
              ) : null}
            </div>
            <div className="max-w-full truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">{app.name}</div>
          </a>
        ))}
      </div>
    </div>
  );
}

export function AppsPage() {
  const [apps, setApps] = useState<AppBookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    authFetch("/api/apps")
      .then((data) => {
        if (!cancelled) setApps(Array.isArray(data.apps) ? data.apps : []);
      })
      .catch((error) => {
        console.warn("Failed to load dashboard apps", error);
        if (!cancelled) setApps([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const grouped = new Map<string, AppBookmark[]>();
    for (const app of apps) {
      const category = app.category.trim() || "Apps";
      grouped.set(category, [...(grouped.get(category) || []), app]);
    }
    return Array.from(grouped.entries())
      .sort(([left], [right]) => compareCategories(left, right))
      .map(([category, categoryApps]) => ({ category, apps: categoryApps }));
  }, [apps]);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-400 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900/80 dark:text-zinc-500 dark:shadow-none">
          Loading apps...
        </div>
      ) : apps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900/80 dark:shadow-none">
          <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No apps yet</div>
          <div className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">Add local bookmarks in dashboard/apps.local.json.</div>
        </div>
      ) : (
        categories.map(({ category, apps: categoryApps }) => (
          <section key={category}>
            <h2 className="mb-3 text-lg font-semibold text-zinc-800 dark:text-zinc-200">{category}</h2>
            <AppGrid apps={categoryApps} />
          </section>
        ))
      )}
    </div>
  );
}
