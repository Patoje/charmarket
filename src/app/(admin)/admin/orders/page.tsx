import { getOrders } from "@/app/actions/admin-orders";
import { OrdersClient } from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await getOrders();

  return <OrdersClient orders={orders} />;
}
