import { getServerUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getServerUser();
  return NextResponse.json(user);
}