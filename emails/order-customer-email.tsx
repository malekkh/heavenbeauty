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

export interface OrderCustomerEmailProps {
  orderId: string;
  countryCode: string;
  customerName: string;
  address: string;
  city: string;
  phone: string;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
}

/**
 * Branded confirmation for the customer: reassures them the order landed and
 * that Heaven Beauty will follow up on WhatsApp to confirm delivery.
 */
export function OrderCustomerEmail({
  orderId,
  countryCode,
  customerName,
  address,
  city,
  phone,
  items,
  subtotal,
  delivery,
}: OrderCustomerEmailProps) {
  const fmt = (n: number) => formatMoney(n, countryCode);
  const ref = orderId.slice(0, 8).toUpperCase();
  const total = subtotal + delivery;

  return (
    <Html>
      <Head />
      <Preview>{`Thanks ${customerName}! Your Heaven Beauty order ${ref} is in.`}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={brand}>Heaven Beauty</Heading>
          <Heading style={h1}>Thank you for your order 🤍</Heading>
          <Text style={intro}>
            Hi {customerName}, we&apos;ve received your order. Our team will
            reach out on WhatsApp shortly to confirm the details and delivery.
          </Text>
          <Text style={refLine}>
            Order reference: <b>{ref}</b>
          </Text>

          <Section style={card}>
            <Text style={sectionTitle}>Your items</Text>
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

          <Section style={card}>
            <Text style={sectionTitle}>Delivery details</Text>
            <Text style={line}>{customerName}</Text>
            <Text style={line}>
              {address}, {city}
            </Text>
            <Text style={line}>{phone}</Text>
          </Section>

          <Text style={footer}>
            Payment and final delivery are arranged over WhatsApp. If anything
            looks off, just reply to our WhatsApp message.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default OrderCustomerEmail;

const body = { backgroundColor: "#f5f5f4", fontFamily: "Arial, sans-serif" };
const container = { margin: "0 auto", padding: "24px", maxWidth: "560px" };
const brand = {
  fontSize: "18px",
  color: "#c2571a",
  margin: "0 0 16px",
  letterSpacing: "0.02em",
};
const h1 = { fontSize: "22px", margin: "0 0 8px", color: "#1c1917" };
const intro = { fontSize: "14px", color: "#44403c", margin: "0 0 8px" };
const refLine = { fontSize: "14px", color: "#1c1917", margin: "0 0 16px" };
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
const footer = { fontSize: "12px", color: "#78716c", margin: "8px 0 0" };
