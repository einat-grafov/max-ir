/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'MAX-IR'
const LOGO_URL = 'https://xfgxbrvqjbapmoijeshq.supabase.co/storage/v1/object/public/email-assets/maxir-logo.svg'

interface Props {
  customerName?: string
  orderNumber?: number
  total?: string
  items?: string
}

const OrderConfirmationEmail = ({ customerName, orderNumber, total, items }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Order #${orderNumber ?? ''} confirmed — ${SITE_NAME}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt={SITE_NAME} width="150" height="26" style={logo} />
        <Heading style={h1}>Order Confirmed</Heading>
        <Text style={text}>
          Hi {customerName ?? 'there'}, thank you for your order{orderNumber ? ` (#${orderNumber})` : ''}!
        </Text>
        {items && (
          <Text style={text}>
            <strong>Items:</strong><br />{items}
          </Text>
        )}
        {total && (
          <Text style={text}>
            <strong>Total:</strong> {total}
          </Text>
        )}
        <Hr style={hr} />
        <Text style={text}>
          We'll be in touch with updates on your order. If you have any questions, feel free to reply to this email.
        </Text>
        <Text style={footer}>Best regards, The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: OrderConfirmationEmail,
  subject: (data: Record<string, any>) => `Order #${data.orderNumber ?? ''} confirmed`,
  displayName: 'Order confirmation',
  previewData: { customerName: 'Acme Corp', orderNumber: 1042, total: '$2,500.00', items: 'NIR Sensor Pro × 2' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const logo = { margin: '0 0 24px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#212121', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#737373', lineHeight: '1.5', margin: '0 0 25px' }
const hr = { borderColor: '#e5e5e5', margin: '20px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
