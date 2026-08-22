"use server";

import { prisma } from "../lib/db";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_for_hackathon"
);

async function setAuthCookie(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function registerUser(data: any) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { error: "A user with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        city: data.city,
        country: data.country,
        additionalInfo: data.additionalInfo,
        password: hashedPassword,
        photoUrl: data.photoUrl,
      },
    });

    await setAuthCookie(newUser.id);

    return { success: true, user: { id: newUser.id, email: newUser.email, firstName: newUser.firstName } };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "An error occurred during registration. Please try again." };
  }
}

export async function loginUser(data: any) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: data.username }, // Using email as username
    });

    if (!user) {
      return { error: "Invalid username or password." };
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) {
      return { error: "Invalid username or password." };
    }

    await setAuthCookie(user.id);

    return { success: true, user: { id: user.id, email: user.email, firstName: user.firstName } };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "An error occurred during login. Please try again." };
  }
}
