import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, listId } = await req.json();

    if (!title || !listId) {
      return NextResponse.json(
        { error: "Title and listId are required" },
        { status: 400 }
      );
    }

    const lastCard = await db.card.findFirst({
      where: { listId },
      orderBy: { position: "desc" },
    });

    const card = await db.card.create({
      data: {
        title,
        listId,
        userId: session.user.id,
        position: lastCard ? lastCard.position + 1 : 0,
      },
      include: {
        labels: true,
        checklists: { include: { items: true } },
      },
    });

    return NextResponse.json(card, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
