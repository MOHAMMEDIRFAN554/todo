import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Todo from "@/models/Todo";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

async function verifyToken(request: Request) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    const token = authHeader.split(" ")[1];
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const decoded = await verifyToken(request);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await request.json();
    await dbConnect();
    const todo = await Todo.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json(todo);
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const decoded = await verifyToken(request);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    await Todo.findByIdAndDelete(id);
    return NextResponse.json({ message: "Todo deleted" });
}
