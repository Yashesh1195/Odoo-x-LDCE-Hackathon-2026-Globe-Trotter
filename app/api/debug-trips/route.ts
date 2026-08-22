import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function GET() {
  try {
    const count = await prisma.trip.count();
    const trips = await prisma.trip.findMany({ take: 10 });
    return NextResponse.json({ count, trips });
  } catch (error) {
    return NextResponse.json({ error: String(error) });
  }
}
