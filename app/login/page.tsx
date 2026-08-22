import type { Metadata } from "next";
import LoginScreen from "../components/LoginScreen";

export const metadata: Metadata = {
  title: "GT - Globe Trotter | Account Login",
  description: "Sign in to access your GT - Globe Trotter account and member portal.",
};

export default function LoginPage() {
  return <LoginScreen />;
}
