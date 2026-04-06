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
  subject?: string
  customMessage?: string
}

const InvoiceEmail = ({ customerName, subject, customMessage }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{subject ?? 'Your invoice'} — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt={SITE_NAME} width="150" height="26" style={logo} />
        <Text style={tagline}>INVOICE</Text>
        <Heading style={h1}>{subject ?? 'Your Invoice'}</Heading>
        <Hr style={hr} />
        <Text style={text}>
          Hi {customerName ?? 'there'},
        </Text>
        <Text style={text}>
          Here is your invoice. Please review the details and complete payment at your convenience.
        </Text>
        {customMessage && (
          <Text style={messageBox}>{customMessage}</Text>
        )}
        <Hr style={hr} />
        <Text style={text}>
          If you have any questions about this invoice, feel free to reply to this email.
        </Text>
        <Text style={footer}>Best regards, The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: InvoiceEmail,
  subject: (data: Record<string, any>) => data.subject ?? 'Your invoice',
  displayName: 'Invoice email',
  previewData: { customerName: 'Acme Corp', subject: 'Invoice Acme Corp', customMessage: 'Payment is due within 30 days.' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const logo = { margin: '0 0 24px' }
const tagline = { fontSize: '11px', color: '#999999', letterSpacing: '2px', textTransform: 'uppercase' as const, margin: '0 0 4px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#212121', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#737373', lineHeight: '1.5', margin: '0 0 25px' }
const messageBox = { fontSize: '14px', color: '#212121', lineHeight: '1.5', margin: '0 0 25px', backgroundColor: '#f5f5f5', padding: '12px 16px', borderRadius: '4px', fontStyle: 'italic' as const }
const hr = { borderColor: '#e5e5e5', margin: '20px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
