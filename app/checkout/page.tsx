import { CommerceState } from "@/components/CommerceState";
export const metadata = { title: "Checkout" };
export default function CheckoutPage() {
  return (
    <CommerceState
      title="Checkout is not available yet"
      message="This catalogue is a preview. Prices, inventory and product options must be verified before orders can be placed."
    />
  );
}
