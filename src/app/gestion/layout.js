import { requerirAdministrador } from "@/lib/auth/requerir-admin";

export default async function PanelAdminLayout({ children }) {
  await requerirAdministrador();
  return children;
}
