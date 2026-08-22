import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    cookieStore.delete("gt_user_id");

    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
      expires: new Date(0),
    });
    
    response.cookies.set("gt_user_id", "", {
      maxAge: 0,
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (err) {
    console.error("API logout error:", err);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
