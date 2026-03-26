import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lists, cards } = await req.json();

    // Update list positions
    if (lists) {
      for (const list of lists) {
        await db.list.update({
          where: { id: list.id },
          data: { position: list.position },
        });
      }
    }

    // Update card positions and list assignments
    if (cards) {
      for (const card of cards) {
        await db.card.update({
          where: { id: card.id },
          data: { position: card.position, listId: card.listId },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
