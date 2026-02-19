"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  if (!user) return null;

  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "";
  const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      {avatar && (
        <img
          src={avatar}
          alt={name}
          className="h-7 w-7 rounded-full"
          referrerPolicy="no-referrer"
        />
      )}
      <span className="text-sm font-medium hidden sm:inline max-w-[120px] truncate">
        {name}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
