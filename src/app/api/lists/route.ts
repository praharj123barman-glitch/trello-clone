import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, boardId } = await req.json();

    if (!title || !boardId) {
      return NextResponse.json(
        { error: "Title and boardId are required" },
        { status: 400 }
      );
    }

    // Verify board ownership
    const board = await db.board.findUnique({
      where: { id: boardId, userId: session.user.id },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Get the highest position
    const lastList = await db.list.findFirst({
      where: { boardId },
      orderBy: { position: "desc" },
    });

    const list = await db.list.create({
      data: {
        title,
        boardId,
        position: lastList ? lastList.position + 1 : 0,
      },
      include: {
        cards: true,
      },
    });

    return NextResponse.json(list, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
