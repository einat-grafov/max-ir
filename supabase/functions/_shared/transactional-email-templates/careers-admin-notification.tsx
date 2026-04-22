/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Img, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'MAX-IR'
const LOGO_URL = 'https://xfgxbrvqjbapmoijeshq.supabase.co/storage/v1/object/public/email-assets/maxir-logo.svg'

interface Props {
  applicantName?: string
  applicantEmail?: string
  applicantPhone?: string
  country?: string
  position?: string
  education?: string
  about?: string
}

const CareersAdminNotificationEmail = ({
  applicantName,
  applicantEmail,
  applicantPhone,
  country,
  position,
  education,
  about,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New career application from {applicantName || applicantEmail || 'a candidate'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt={SITE_NAME} width="150" height="26" style={logo} />
        <Heading style={h1}>New career application</Heading>
        <Text style={text}>
          A new application was submitted on the {SITE_NAME} careers page.
        </Text>

        <Section style={card}>
          {applicantName && <Row label="Name" value={applicantName} />}
          {applicantEmail && <Row label="Email" value={applicantEmail} />}
          {applicantPhone && <Row label="Phone" value={applicantPhone} />}
          {country && <Row label="Country" value={country} />}
          {position && <Row label="Position" value={position} />}
          {education && <Row label="Education" value={education} />}
        </Section>

        {about && (
          <>
            <Hr style={hr} />
            <Text style={label}>About the applicant</Text>
            <Text style={messageText}>{about}</Text>
          </>
        )}

        <Hr style={hr} />
        <Text style={footer}>
          Manage applications in the {SITE_NAME} admin panel.
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
  component: CareersAdminNotificationEmail,
  subject: (data: any) =>
    `New career application${data?.applicantName ? ` from ${data.applicantName}` : ''}`,
  displayName: 'Careers — admin notification',
  previewData: {
    applicantName: 'Alex Carter',
    applicantEmail: 'alex@example.com',
    applicantPhone: '+1 555-987-6543',
    country: 'Israel',
    position: 'Sensor R&D Engineer',
    education: 'M.Sc. Electrical Engineering',
    about: '5 years experience in IR sensors, looking to relocate.',
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
