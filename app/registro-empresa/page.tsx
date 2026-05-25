import { APP_ROUTES } from "@/src/constants/routes";
import { redirect } from "next/navigation";

export default function RegistroEmpresaPage() {
  redirect(APP_ROUTES.homeApp);
}
