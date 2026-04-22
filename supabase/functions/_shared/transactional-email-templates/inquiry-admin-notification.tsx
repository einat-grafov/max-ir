/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Img, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'MAX-IR'
const LOGO_URL = 'https://xfgxbrvqjbapmoijeshq.supabase.co/storage/v1/object/public/email-assets/maxir-logo.svg'

interface Props {
  inquirerName?: string
  inquirerEmail?: string
  inquirerPhone?: string
  inquirerCompany?: string
  inquirerCountry?: string
  product?: string
  message?: string
}

const InquiryAdminNotificationEmail = ({
  inquirerName,
  inquirerEmail,
  inquirerPhone,
  inquirerCompany,
  inquirerCountry,
  product,
  message,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New inquiry from {inquirerName || inquirerEmail || 'a visitor'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt={SITE_NAME} width="150" height="26" style={logo} />
        <Heading style={h1}>New inquiry received</Heading>
        <Text style={text}>
          A new inquiry was submitted on the {SITE_NAME} website.
        </Text>

        <Section style={card}>
          {inquirerName && <Row label="Name" value={inquirerName} />}
          {inquirerEmail && <Row label="Email" value={inquirerEmail} />}
          {inquirerPhone && <Row label="Phone" value={inquirerPhone} />}
          {inquirerCompany && <Row label="Company" value={inquirerCompany} />}
          {inquirerCountry && <Row label="Country" value={inquirerCountry} />}
          {product && <Row label="Product / subject" value={product} />}
        </Section>

        {message && (
          <>
            <Hr style={hr} />
            <Text style={label}>Message</Text>
            <Text style={messageText}>{message}</Text>
          </>
        )}

        <Hr style={hr} />
        <Text style={footer}>
          Manage inquiries in the {SITE_NAME} admin panel.
        </Text>
      </Container>
    </Body>
  </Html>
)

const Row = ({ label, value }: { label: string; value: string }) => (
  <Text style={rowText}>
    <span style={rowLabel}>{label}: </span>
    <span style={rowValue}>{value}</span>
  </Text>
)

export const template = {
  component: InquiryAdminNotificationEmail,
  subject: (data: any) =>
    `New inquiry${data?.product ? ` — ${data.product}` : ''}${data?.inquirerName ? ` from ${data.inquirerName}` : ''}`,
  displayName: 'Inquiry — admin notification',
  previewData: {
    inquirerName: 'Sarah Johnson',
    inquirerEmail: 'sarah@example.com',
    inquirerPhone: '+1 555-123-4567',
    inquirerCompany: 'Acme Inc.',
    inquirerCountry: 'United States',
    product: 'MAX-IR Sensor',
    message: "We'd like to know more about pricing and availability for 25 units.",
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const logo = { margin: '0 0 24px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#212121', margin: '0 0 12px' }
const text = { fontSize: '14px', color: '#737373', lineHeight: '1.5', margin: '0 0 20px' }
const card = {
  backgroundColor: '#fafafa',
  border: '1px solid #ebebeb',
  borderRadius: '8px',
  padding: '16px 18px',
  margin: '0 0 12px',
}
const rowText = { fontSize: '13px', margin: '0 0 6px', lineHeight: '1.5' }
const rowLabel = { color: '#999999', fontWeight: 600 as const }
const rowValue = { color: '#212121' }
const hr = { borderColor: '#ebebeb', margin: '20px 0' }
const label = { fontSize: '12px', fontWeight: 600 as const, color: '#999999', margin: '0 0 6px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }
const messageText = { fontSize: '14px', color: '#212121', lineHeight: '1.6', margin: '0', whiteSpace: 'pre-wrap' as const }
const footer = { fontSize: '12px', color: '#999999', margin: '20px 0 0' }
