import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export async function POST(request: Request) {
    const { username, password } = await request.json();

    if (username === "admin123" && password === "admin@123") {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "7d" });
        return NextResponse.json({ token });
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
