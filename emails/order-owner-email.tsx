import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";
import { formatMoney } from "@/lib/utils";
import type { OrderItem } from "@/lib/types";

export interface OrderOwnerEmailProps {
  orderId: string;
  countryCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  city: string;
  notes?: string | null;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
}

/**
 * Internal fulfilment email — the full order, optimised for the owner to act
 * on: who, where, what, and how to reach the customer.
 */
export function OrderOwnerEmail({
  orderId,
  countryCode,
  customerName,
  customerPhone,
  customerEmail,
  address,
  city,
  notes,
  items,
  subtotal,
  delivery,
}: OrderOwnerEmailProps) {
  const fmt = (n: number) => formatMoney(n, countryCode);
  const ref = orderId.slice(0, 8).toUpperCase();
  const total = subtotal + delivery;

  return (
    <Html>
      <Head />
      <Preview>{`New order ${ref} — ${customerName} (${city})`}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>New order · {ref}</Heading>
          <Text style={muted}>
            {countryCode.toUpperCase()} · order id {orderId}
          </Text>

          <Section style={card}>
            <Text style={sectionTitle}>Customer</Text>
            <Text style={line}>
              <b>{customerName}</b>
            </Text>
            <Text style={line}>Phone: {customerPhone}</Text>
            <Text style={line}>Email: {customerEmail}</Text>
            <Text style={line}>
              {address}, {city}
            </Text>
            {notes ? <Text style={line}>Notes: {notes}</Text> : null}
          </Section>

          <Section style={card}>
            <Text style={sectionTitle}>Items</Text>
            {items.map((item) => (
              <Row key={item.productId} style={itemRow}>
                <Column>
                  <Text style={line}>
                    {item.name} × {item.qty}
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={line}>{fmt(item.price * item.qty)}</Text>
                </Column>
              </Row>
            ))}
            <Hr style={hr} />
            <Row>
              <Column>
                <Text style={line}>Subtotal</Text>
              </Column>
              <Column align="right">
                <Text style={line}>{fmt(subtotal)}</Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={line}>Delivery</Text>
              </Column>
              <Column align="right">
                <Text style={line}>{fmt(delivery)}</Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={totalLabel}>Total</Text>
              </Column>
              <Column align="right">
                <Text style={totalValue}>{fmt(total)}</Text>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default OrderOwnerEmail;

const body = { backgroundColor: "#f5f5f4", fontFamily: "Arial, sans-serif" };
const container = { margin: "0 auto", padding: "24px", maxWidth: "560px" };
const h1 = { fontSize: "22px", margin: "0 0 4px" };
const muted = { color: "#78716c", fontSize: "12px", margin: "0 0 16px" };
const card = {
  backgroundColor: "#ffffff",
  border: "1px solid #e7e5e4",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "16px",
};
const sectionTitle = {
  fontSize: "11px",
  letterSpacing: "0.05em",
  textTransform: "uppercase" as const,
  color: "#78716c",
  margin: "0 0 8px",
};
const line = { fontSize: "14px", margin: "2px 0", color: "#1c1917" };
const itemRow = { margin: "0" };
const hr = { borderColor: "#e7e5e4", margin: "12px 0" };
const totalLabel = { fontSize: "14px", fontWeight: 700, margin: 0 };
const totalValue = { fontSize: "16px", fontWeight: 700, margin: 0 };
