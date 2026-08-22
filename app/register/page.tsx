import type { Metadata } from "next";
import RegisterScreen from "../components/RegisterScreen";

export const metadata: Metadata = {
  title: "GT - Globe Trotter | User Registration",
  description: "Create an account for GT - Globe Trotter and join our member network.",
};

export default function RegisterPage() {
  return <RegisterScreen />;
}
