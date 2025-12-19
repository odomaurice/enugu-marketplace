
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import jwt from "jsonwebtoken";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Decode the JWT token to get fresh data
    const decoded = jwt.decode(session.user.token as string) as any;
    
    if (decoded?.user) {
      return NextResponse.json({
        loan_unit: decoded.user.loan_unit || 0,
        loan_amount_collected: decoded.user.loan_amount_collected || 0,
        salary_per_month: decoded.user.salary_per_month || 0,
        // Add other relevant fields
      });
    }
    
    return NextResponse.json({ 
      loan_unit: 0, 
      loan_amount_collected: 0 
    });
  } catch (error) {
    console.error("Error fetching loan data:", error);
    return NextResponse.json({ error: "Failed to fetch loan data" }, { status: 500 });
  }
}