import { getOrders } from "@/app/actions/admin-orders";
import { getDolarValue } from "@/app/actions/config";
import { OrdersClient } from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await getOrders();
  const dolarValue = await getDolarValue();

  return <OrdersClient orders={orders} dolarValue={dolarValue} />;
}
