/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'MAX-IR'
const LOGO_URL = 'https://xfgxbrvqjbapmoijeshq.supabase.co/storage/v1/object/public/email-assets/maxir-logo.svg'

interface Props {
  name?: string
  products?: string
}

const InquiryConfirmationEmail = ({ name, products }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We received your inquiry — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt={SITE_NAME} width="120" height="40" style={logo} />
        <Heading style={h1}>
          {name ? `Thank you, ${name}!` : 'Thank you for your inquiry!'}
        </Heading>
        <Text style={text}>
          We have received your product inquiry{products ? ` regarding ${products}` : ''} and our team will review it shortly.
        </Text>
        <Text style={text}>
          A member of our team will get back to you as soon as possible. If you have any additional questions in the meantime, feel free to reply to this email.
        </Text>
        <Text style={footer}>Best regards, The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: InquiryConfirmationEmail,
  subject: 'We received your inquiry',
  displayName: 'Product inquiry confirmation',
  previewData: { name: 'Jane Smith', products: 'NIR Sensor Pro' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const logo = { margin: '0 0 24px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#212121', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#737373', lineHeight: '1.5', margin: '0 0 25px' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
