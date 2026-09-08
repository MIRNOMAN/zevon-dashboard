import { redirect } from "next/navigation";

export default function CreateProductRedirectPage() {
  redirect("/dashboard/products?new=1");
}
