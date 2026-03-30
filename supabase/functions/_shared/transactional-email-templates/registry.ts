/// <reference types="npm:@types/react@18.3.1" />

import type { ComponentType } from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: any) => string)
  displayName?: string
  previewData?: Record<string, any>
  to?: string
}

import { template as inquiryConfirmation } from './inquiry-confirmation.tsx'
import { template as contactConfirmation } from './contact-confirmation.tsx'
import { template as careersConfirmation } from './careers-confirmation.tsx'
import { template as orderConfirmation } from './order-confirmation.tsx'
import { template as invoiceEmail } from './invoice-email.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'inquiry-confirmation': inquiryConfirmation,
  'contact-confirmation': contactConfirmation,
  'careers-confirmation': careersConfirmation,
  'order-confirmation': orderConfirmation,
  'invoice-email': invoiceEmail,
}
