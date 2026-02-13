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

export async function GET(request: Request) {
    const decoded = await verifyToken(request);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const todos = await Todo.find({}).sort({ createdAt: -1 });
    return NextResponse.json(todos);
}

export async function POST(request: Request) {
    const decoded = await verifyToken(request);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await request.json();
    await dbConnect();
    const todo = await Todo.create(data);
    return NextResponse.json(todo);
}
