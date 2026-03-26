"use client";

import { Layout, LogOut, Plus } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateBoardModal } from "@/components/modals/create-board-modal";

export function Navbar() {
  const { data: session } = useSession();
  const [showCreateBoard, setShowCreateBoard] = useState(false);

  return (
    <>
      <nav className="h-14 bg-white/90 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/boards" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Layout className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">
                Taskflow
              </span>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateBoard(true)}
            >
              <Plus className="w-4 h-4" />
              Create
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {session?.user && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-foreground hidden sm:block">
                  {session.user.name}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-muted hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-surface-hover cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <CreateBoardModal
        isOpen={showCreateBoard}
        onClose={() => setShowCreateBoard(false)}
      />
    </>
  );
}
