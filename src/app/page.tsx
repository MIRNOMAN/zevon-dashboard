"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAuthenticated, selectIsAuthInitialized } from "@/redux/features/authSlice";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsAuthInitialized);

  useEffect(() => {
    if (!isInitialized) return;

    if (isAuthenticated) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, isInitialized, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
      <div className="flex items-center gap-3 text-amber-400 font-medium">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading ZEVON Platform...</span>
      </div>
    </div>
  );
}
