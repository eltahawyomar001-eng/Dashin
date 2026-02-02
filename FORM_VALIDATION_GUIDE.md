# Form Validation Guide

## Table of Contents
- [Overview](#overview)
- [Validation Schemas](#validation-schemas)
- [Form Components](#form-components)
- [Integration Examples](#integration-examples)
- [Validation Patterns](#validation-patterns)
- [Best Practices](#best-practices)
- [Testing](#testing)

## Overview

This guide covers the form validation infrastructure built with **Zod** (runtime validation) and **react-hook-form** (form state management). All validation schemas are defined in `packages/shared-types/src/validation.ts` and reusable form components in `packages/ui/src/components/form-*.tsx`.

### Tech Stack
- **Zod v4.3.6**: Runtime type validation with TypeScript inference
- **react-hook-form v7.71.1**: Form state management
- **@hookform/resolvers v5.2.2**: Zod schema integration

### Architecture

```
Validation Layer:
  ├─ Zod Schemas (packages/shared-types/src/validation.ts)
  │   ├─ Field-level validation (length, format, ranges)
  │   ├─ Cross-field validation (date comparison, conditionals)
  │   ├─ Nested object validation (contact, company)
  │   └─ Custom refinements with helpful error messages
  │
  ├─ Form Components (packages/ui/src/components/)
  │   ├─ FormField: Text inputs with error display
  │   ├─ FormTextarea: Multi-line input with character counter
  │   ├─ FormSelect: Dropdown with options
  │   ├─ FormSection: Grouping with optional collapse
  │   └─ FormError/FormSuccess: Message display
  │
  └─ Integration
      ├─ FormProvider wraps form
      ├─ zodResolver connects schema to react-hook-form
      ├─ Controller wraps each input
      └─ useFormContext accesses form state
```

## Validation Schemas

### Campaign Schema

**Location**: `packages/shared-types/src/validation.ts`

```typescript
import { campaignSchema, type CampaignFormData } from '@dashin/shared-types';

// Schema fields
{
  name: string (1-100 chars, trimmed, required)
  description?: string (max 500 chars)
  targetCompanies: number (1-50,000, integer, required)
  targetLeads: number (1-50,000, integer, required)
  startDate: string (ISO datetime, required)
  endDate?: string (ISO datetime, optional)
  clientId?: string (optional)
}

// Cross-field validation
- endDate must be after startDate (when both provided)
```

**Usage**:
```typescript
const methods = useForm({
  resolver: zodResolver(campaignSchema),
  defaultValues: {
    name: '',
    description: '',
    targetCompanies: 100,
    targetLeads: 500,
    startDate: new Date().toISOString(),
    endDate: undefined,
    clientId: undefined,
  },
  mode: 'onChange', // Validate on every change
});
```

### Lead Schema

**Location**: `packages/shared-types/src/validation.ts`

```typescript
import { leadSchema, type LeadFormData } from '@dashin/shared-types';

// Schema fields
{
  campaignId: string (required)
  firstName: string (1-100 chars, trimmed, required)
  lastName: string (1-100 chars, trimmed, required)
  title: string (1-200 chars, required)
  contact: {
    email: string (email format, required)
    phone?: string (regex pattern, optional)
    linkedin?: string (URL format, optional)
  }
  company: {
    name: string (required)
    industry: string (required)
    size: string (required)
    location: string (required)
    website?: string (URL format, optional)
    revenue?: string (optional)
  }
  priority: 'low' | 'medium' | 'high' | 'urgent' (required)
  notes?: string (max 1000 chars)
}
```

**Nested Validation**:
- Contact object: email required, phone/linkedin optional with format validation
- Company object: name/industry/size/location required, website/revenue optional

### Lead Qualification Schema

**Location**: `packages/shared-types/src/validation.ts`

```typescript
import { leadQualificationSchema, type LeadQualificationFormData } from '@dashin/shared-types';

// Schema fields
{
  score: number (1-5, integer, required)
  priority: 'low' | 'medium' | 'high' | 'urgent' (required)
  qualificationCriteria: Array<{
    criterion: string (required)
    met: boolean (required)
    notes?: string (optional)
  }> (min 1 item)
  notes?: string (max 1000 chars)
  rejectionReason?: string (max 500 chars)
}

// Conditional validation
- rejectionReason is REQUIRED when score ≤ 2
- Error: "Rejection reason is required for low scores (≤2)"
```

### Data Source Schema

**Location**: `packages/shared-types/src/validation.ts`

```typescript
import { dataSourceSchema, type DataSourceFormData } from '@dashin/shared-types';

// Schema fields
{
  name: string (1-100 chars, trimmed, required)
  description?: string (max 500 chars)
  type: 'web_scraping' | 'api' | 'csv_import' | 'database' (required)
  config: ScrapingConfigSchema (required)
  frequency: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly' (default 'manual')
  active: boolean (default true)
}

// Config nested validation
config: {
  url: string (URL format, required)
  selectors: {
    name?: string
    title?: string
    email?: string
    phone?: string
    company?: string
    location?: string
  }
  pagination: {
    enabled: boolean
    selector: string
    maxPages: number (1-100, integer)
  }
  authentication: {
    type: 'none' | 'basic' | 'bearer' | 'oauth'
    credentials: Record<string, string> (optional)
  }
  rateLimit: {
    requestsPerMinute: number (1-60, integer)
    delayBetweenRequests: number (0-10000ms, integer)
  }
}
```

### Scraping Job Schema

**Location**: `packages/shared-types/src/validation.ts`

```typescript
import { scrapingJobSchema, type ScrapingJobFormData } from '@dashin/shared-types';

// Schema fields
{
  dataSourceId: string (required)
  priority: 'low' | 'medium' | 'high' | 'urgent' (default 'medium')
  config?: Partial<ScrapingConfigSchema> (optional override)
  notes?: string (max 500 chars)
}
```

### User Schema

**Location**: `packages/shared-types/src/validation.ts`

```typescript
import { userSchema, type UserFormData } from '@dashin/shared-types';

// Schema fields
{
  email: string (email format, required)
  firstName: string (1-100 chars, trimmed, required)
  lastName: string (1-100 chars, trimmed, required)
  role: 'super_admin' | 'agency_admin' | 'researcher' | 'client' (required)
  agencyId?: string (optional)
  clientId?: string (optional)
}

// Role-based conditionals
- 'client' role REQUIRES clientId
- Agency roles ('agency_admin', 'researcher') REQUIRE agencyId
```

### Report Schema

**Location**: `packages/shared-types/src/validation.ts`

```typescript
import { reportSchema, type ReportFormData } from '@dashin/shared-types';

// Schema fields
{
  name: string (1-100 chars, trimmed, required)
  type: 'campaign_summary' | 'lead_analytics' | 'source_performance' | 'custom' (required)
  filters: {
    campaignIds?: string[] (optional)
    dateFrom?: string (datetime, optional)
    dateTo?: string (datetime, optional)
    status?: string[] (optional)
  }
  schedule?: {
    enabled: boolean (required)
    frequency: 'daily' | 'weekly' | 'monthly' (required)
    recipients: string[] (email format, required)
  }
}
```

### Common Validation Helpers

**Location**: `packages/shared-types/src/validation.ts`

```typescript
import {
  emailValidation,
  passwordValidation,
  urlValidation,
  phoneValidation,
} from '@dashin/shared-types';

// Email validation
emailValidation = z.string().email('Invalid email format')

// Password validation (8-128 chars, uppercase/lowercase/digit)
passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one digit')

// URL validation
urlValidation = z.string().url('Invalid URL format')

// Phone validation (optional, with regex pattern)
phoneValidation = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional()
```

## Form Components

### FormField Component

**Location**: `packages/ui/src/components/form-field.tsx`

**Purpose**: Reusable text input wrapper with react-hook-form integration

**Props**:
```typescript
interface FormFieldProps {
  name: string; // Field name in form schema
  label?: string; // Optional label text
  placeholder?: string; // Optional placeholder
  type?: 'text' | 'email' | 'password' | 'number' | 'url' | 'tel' | 'date' | 'datetime-local'; // Default 'text'
  description?: string; // Helper text below input
  required?: boolean; // Shows asterisk, default false
  disabled?: boolean; // Disables input, default false
  className?: string; // Additional Tailwind classes
}
```

**Features**:
- Automatic error display with icon
- Required indicator (red asterisk)
- Number type conversion (parseFloat for number inputs)
- Accessibility: `aria-invalid`, `aria-describedby`
- Styling: Red border on error, blue focus ring
- Description text when no error

**Usage**:
```tsx
<FormField
  name="name"
  label="Campaign Name"
  placeholder="Q1 2024 Tech Startups"
  required
  description="A unique name to identify this campaign"
/>

<FormField
  name="targetCompanies"
  label="Target Companies"
  type="number"
  placeholder="100"
  required
/>

<FormField
  name="email"
  label="Email Address"
  type="email"
  required
/>
```

### FormTextarea Component

**Location**: `packages/ui/src/components/form-textarea.tsx`

**Purpose**: Multi-line text input with character counter

**Props**:
```typescript
interface FormTextareaProps {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number; // Default 4
  maxLength?: number; // Optional character limit
  className?: string;
}
```

**Features**:
- Live character counter (charCount / maxLength)
- Warning at 90% capacity (orange text)
- Resize control: `resize-vertical`
- Same error handling as FormField
- watch() for live value tracking

**Usage**:
```tsx
<FormTextarea
  name="description"
  label="Description"
  placeholder="Target SaaS companies with 50-200 employees..."
  rows={3}
  maxLength={500}
  description="Optional campaign description"
/>

<FormTextarea
  name="notes"
  label="Qualification Notes"
  rows={5}
  maxLength={1000}
  required
/>
```

### FormSelect Component

**Location**: `packages/ui/src/components/form-select.tsx`

**Purpose**: Dropdown select with options array

**Props**:
```typescript
interface FormSelectProps {
  name: string;
  label?: string;
  placeholder?: string; // Default 'Select an option...'
  description?: string;
  required?: boolean;
  disabled?: boolean;
  options: Array<{
    label: string;
    value: string | number;
  }>;
  className?: string;
}
```

**Features**:
- Maps options array to option elements
- Disabled placeholder option (empty string value)
- Controlled component with field.value ?? ''
- Same error handling as FormField

**Usage**:
```tsx
<FormSelect
  name="priority"
  label="Priority"
  required
  options={[
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Urgent', value: 'urgent' },
  ]}
/>

<FormSelect
  name="clientId"
  label="Client"
  placeholder="Select a client..."
  options={[
    { label: 'Client A', value: 'client-1' },
    { label: 'Client B', value: 'client-2' },
  ]}
  description="Optional client assignment"
/>
```

### FormSection Component

**Location**: `packages/ui/src/components/form-section.tsx`

**Purpose**: Grouping container with optional collapse

**Props**:
```typescript
interface FormSectionProps {
  title: string; // Section heading
  description?: string; // Optional subtitle
  children: ReactNode; // Form fields
  collapsible?: boolean; // Default false
  defaultOpen?: boolean; // Default true
  className?: string;
}
```

**Features**:
- Non-collapsible: Simple container with border
- Collapsible: Button with chevron icon, conditional content
- Keyboard accessible: focus ring, button type="button"
- Animated chevron: rotate-180 when open
- First section: `first:border-t-0` for seamless stacking

**Usage**:
```tsx
{/* Non-collapsible section */}
<FormSection
  title="Basic Information"
  description="Campaign name and description"
>
  <FormField name="name" label="Name" required />
  <FormTextarea name="description" label="Description" />
</FormSection>

{/* Collapsible section (closed by default) */}
<FormSection
  title="Advanced Settings"
  description="Optional configuration"
  collapsible
  defaultOpen={false}
>
  <FormField name="customField" label="Custom Field" />
</FormSection>
```

### FormError / FormSuccess Components

**Location**: `packages/ui/src/components/form-messages.tsx`

**Purpose**: Form-level success/error messages

**Props**:
```typescript
interface FormMessageProps {
  message?: string; // Returns null if not provided
  className?: string;
}
```

**Features**:
- FormError: Red background, alert icon, role="alert"
- FormSuccess: Green background, checkmark icon, role="status"
- Early return if no message
- Flex layout with icon and text

**Usage**:
```tsx
const [submitError, setSubmitError] = useState<string | null>(null);
const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

// In form
{submitError && <FormError message={submitError} />}
{submitSuccess && <FormSuccess message={submitSuccess} />}

// Set on submit
try {
  await createCampaign.mutateAsync(data);
  setSubmitSuccess('Campaign created successfully!');
} catch (error) {
  setSubmitError(error.message);
}
```

## Integration Examples

### Complete Form Example: Campaign Creation

**Location**: `apps/web/src/components/forms/CreateCampaignForm.tsx`

```tsx
'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { campaignSchema, type CampaignFormData } from '@dashin/shared-types';
import {
  FormField,
  FormTextarea,
  FormSelect,
  FormSection,
  FormError,
  FormSuccess,
  Button,
} from '@dashin/ui';
import { useCreateCampaign } from '@/hooks/useCampaigns';
import { useState } from 'react';

interface CreateCampaignFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateCampaignForm({
  onSuccess,
  onCancel,
}: CreateCampaignFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const createCampaign = useCreateCampaign();

  // Step 1: Initialize form with zodResolver
  const methods = useForm({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      description: '',
      targetCompanies: 100,
      targetLeads: 500,
      startDate: new Date().toISOString(),
      endDate: undefined,
      clientId: undefined,
    },
    mode: 'onChange', // Validate on every change
  });

  // Step 2: Extract form methods
  const {
    handleSubmit,
    formState: { isSubmitting, isDirty, isValid },
    reset,
  } = methods;

  // Step 3: Define submit handler
  const onSubmit = async (data: CampaignFormData) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(null);

      await createCampaign.mutateAsync(data);

      setSubmitSuccess('Campaign created successfully!');
      reset();
      onSuccess?.();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to create campaign'
      );
    }
  };

  // Step 4: Wrap form in FormProvider
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Form-level messages */}
        {submitError && <FormError message={submitError} />}
        {submitSuccess && <FormSuccess message={submitSuccess} />}

        {/* Basic Information Section */}
        <FormSection
          title="Basic Information"
          description="Campaign name and description"
        >
          <FormField
            name="name"
            label="Campaign Name"
            placeholder="Q1 2024 Tech Startups"
            required
            description="A unique name to identify this campaign"
          />

          <FormTextarea
            name="description"
            label="Description"
            placeholder="Target SaaS companies with 50-200 employees..."
            rows={3}
            maxLength={500}
            description="Optional campaign description"
          />
        </FormSection>

        {/* Targets Section */}
        <FormSection
          title="Campaign Targets"
          description="Define the scope of your campaign"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="targetCompanies"
              label="Target Companies"
              type="number"
              placeholder="100"
              required
              description="Number of companies to target"
            />

            <FormField
              name="targetLeads"
              label="Target Leads"
              type="number"
              placeholder="500"
              required
              description="Number of leads to generate"
            />
          </div>
        </FormSection>

        {/* Timeline Section (Collapsible) */}
        <FormSection
          title="Campaign Timeline"
          description="Set the start and end dates"
          collapsible
          defaultOpen={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="startDate"
              label="Start Date"
              type="datetime-local"
              required
              description="When the campaign begins"
            />

            <FormField
              name="endDate"
              label="End Date"
              type="datetime-local"
              description="Optional campaign end date"
            />
          </div>
        </FormSection>

        {/* Client Assignment (Optional, Collapsible) */}
        <FormSection
          title="Client Assignment"
          description="Assign this campaign to a client"
          collapsible
          defaultOpen={false}
        >
          <FormSelect
            name="clientId"
            label="Client"
            placeholder="Select a client..."
            options={[
              { label: 'Client A', value: 'client-1' },
              { label: 'Client B', value: 'client-2' },
              { label: 'Client C', value: 'client-3' },
            ]}
            description="Optional client assignment"
          />
        </FormSection>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || !isDirty || !isValid}
          >
            {isSubmitting ? 'Creating...' : 'Create Campaign'}
          </Button>
        </div>

        {/* Dev-only validation state indicator */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
            <p>isDirty: {isDirty ? 'Yes' : 'No'}</p>
            <p>isValid: {isValid ? 'Yes' : 'No'}</p>
            <p>isSubmitting: {isSubmitting ? 'Yes' : 'No'}</p>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
```

**Key Integration Steps**:
1. **Import validation schema**: `import { campaignSchema, type CampaignFormData } from '@dashin/shared-types'`
2. **Initialize form with zodResolver**: `useForm({ resolver: zodResolver(campaignSchema) })`
3. **Set defaultValues**: Match schema structure, use empty strings/undefined for optional fields
4. **Wrap in FormProvider**: `<FormProvider {...methods}>` enables useFormContext in child components
5. **Use form components**: FormField, FormTextarea, FormSelect with `name` prop matching schema
6. **Handle submission**: `onSubmit={handleSubmit(onSubmit)}` with async handler
7. **Show validation state**: Disable submit button when !isDirty or !isValid

### Lead Qualification Form Example

```tsx
'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadQualificationSchema, type LeadQualificationFormData } from '@dashin/shared-types';
import {
  FormField,
  FormTextarea,
  FormSelect,
  FormError,
  FormSuccess,
  Button,
} from '@dashin/ui';
import { useQualifyLead } from '@/hooks/useLeads';

export function LeadQualificationForm({ leadId }: { leadId: string }) {
  const qualifyLead = useQualifyLead();

  const methods = useForm({
    resolver: zodResolver(leadQualificationSchema),
    defaultValues: {
      score: 3,
      priority: 'medium',
      qualificationCriteria: [
        { criterion: '', met: false, notes: '' },
      ],
      notes: '',
      rejectionReason: '',
    },
    mode: 'onChange',
  });

  const { handleSubmit, watch } = methods;
  const score = watch('score'); // Watch score for conditional rendering

  const onSubmit = async (data: LeadQualificationFormData) => {
    await qualifyLead.mutateAsync({ leadId, ...data });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="score"
            label="Qualification Score"
            type="number"
            required
            description="Rate from 1 (poor) to 5 (excellent)"
          />

          <FormSelect
            name="priority"
            label="Priority"
            required
            options={[
              { label: 'Low', value: 'low' },
              { label: 'Medium', value: 'medium' },
              { label: 'High', value: 'high' },
              { label: 'Urgent', value: 'urgent' },
            ]}
          />
        </div>

        {/* Conditional field: Show rejection reason when score ≤ 2 */}
        {score <= 2 && (
          <FormTextarea
            name="rejectionReason"
            label="Rejection Reason"
            required
            maxLength={500}
            description="Required for low scores (≤2)"
          />
        )}

        <FormTextarea
          name="notes"
          label="Qualification Notes"
          rows={4}
          maxLength={1000}
        />

        <Button type="submit" variant="primary">
          Submit Qualification
        </Button>
      </form>
    </FormProvider>
  );
}
```

**Conditional Validation**:
- `watch('score')` tracks score field value
- Show rejectionReason field only when score ≤ 2
- Zod schema enforces requirement: `refine((data) => data.score > 2 || data.rejectionReason, { ... })`

### Data Source Configuration Form

```tsx
'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { dataSourceSchema, type DataSourceFormData } from '@dashin/shared-types';
import {
  FormField,
  FormTextarea,
  FormSelect,
  FormSection,
  Button,
} from '@dashin/ui';

export function DataSourceForm() {
  const methods = useForm({
    resolver: zodResolver(dataSourceSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'web_scraping',
      config: {
        url: '',
        selectors: {
          name: '',
          email: '',
          company: '',
        },
        pagination: {
          enabled: false,
          selector: '',
          maxPages: 10,
        },
        authentication: {
          type: 'none',
          credentials: {},
        },
        rateLimit: {
          requestsPerMinute: 30,
          delayBetweenRequests: 1000,
        },
      },
      frequency: 'manual',
      active: true,
    },
    mode: 'onChange',
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(console.log)} className="space-y-6">
        {/* Basic Info */}
        <FormSection title="Basic Information">
          <FormField name="name" label="Data Source Name" required />
          <FormTextarea name="description" label="Description" maxLength={500} />
          <FormSelect
            name="type"
            label="Source Type"
            required
            options={[
              { label: 'Web Scraping', value: 'web_scraping' },
              { label: 'API', value: 'api' },
              { label: 'CSV Import', value: 'csv_import' },
              { label: 'Database', value: 'database' },
            ]}
          />
        </FormSection>

        {/* Scraping Config (nested fields) */}
        <FormSection title="Scraping Configuration">
          <FormField name="config.url" label="Target URL" type="url" required />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField name="config.selectors.name" label="Name Selector" />
            <FormField name="config.selectors.email" label="Email Selector" />
            <FormField name="config.selectors.company" label="Company Selector" />
            <FormField name="config.selectors.location" label="Location Selector" />
          </div>
        </FormSection>

        {/* Rate Limiting */}
        <FormSection title="Rate Limiting" collapsible defaultOpen={false}>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="config.rateLimit.requestsPerMinute"
              label="Requests Per Minute"
              type="number"
              required
              description="1-60 requests"
            />
            <FormField
              name="config.rateLimit.delayBetweenRequests"
              label="Delay Between Requests (ms)"
              type="number"
              required
              description="0-10000ms"
            />
          </div>
        </FormSection>

        {/* Scheduling */}
        <FormSection title="Scheduling">
          <FormSelect
            name="frequency"
            label="Run Frequency"
            required
            options={[
              { label: 'Manual', value: 'manual' },
              { label: 'Hourly', value: 'hourly' },
              { label: 'Daily', value: 'daily' },
              { label: 'Weekly', value: 'weekly' },
              { label: 'Monthly', value: 'monthly' },
            ]}
          />
        </FormSection>

        <Button type="submit" variant="primary">
          Create Data Source
        </Button>
      </form>
    </FormProvider>
  );
}
```

**Nested Field Access**:
- Use dot notation: `config.url`, `config.selectors.name`, `config.rateLimit.requestsPerMinute`
- Zod schema validates nested structure automatically
- FormField components work seamlessly with nested paths

## Validation Patterns

### Cross-Field Validation

**Pattern**: Validate one field based on another's value

**Example**: Campaign end date must be after start date

```typescript
export const campaignSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  // ... other fields
}).refine(
  (data) => !data.endDate || new Date(data.endDate) > new Date(data.startDate),
  {
    message: 'End date must be after start date',
    path: ['endDate'], // Error shows on endDate field
  }
);
```

**Usage in Form**:
```tsx
<FormField
  name="startDate"
  label="Start Date"
  type="datetime-local"
  required
/>

<FormField
  name="endDate"
  label="End Date"
  type="datetime-local"
  description="Must be after start date"
/>
```

### Conditional Required Fields

**Pattern**: Require field based on another field's value

**Example**: Rejection reason required when qualification score ≤ 2

```typescript
export const leadQualificationSchema = z.object({
  score: z.number().int().min(1).max(5),
  rejectionReason: z.string().max(500).optional(),
  // ... other fields
}).refine(
  (data) => data.score > 2 || data.rejectionReason,
  {
    message: 'Rejection reason is required for low scores (≤2)',
    path: ['rejectionReason'],
  }
);
```

**Usage in Form**:
```tsx
const score = watch('score'); // Watch score field

{score <= 2 && (
  <FormTextarea
    name="rejectionReason"
    label="Rejection Reason"
    required
    description="Required for low scores (≤2)"
  />
)}
```

### Role-Based Validation

**Pattern**: Require fields based on user role

**Example**: Client role requires clientId, agency roles require agencyId

```typescript
export const userSchema = z.object({
  email: emailValidation,
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  role: z.enum(['super_admin', 'agency_admin', 'researcher', 'client']),
  agencyId: z.string().optional(),
  clientId: z.string().optional(),
}).refine(
  (data) => data.role !== 'client' || data.clientId,
  {
    message: 'Client ID is required for client role',
    path: ['clientId'],
  }
).refine(
  (data) => !['agency_admin', 'researcher'].includes(data.role) || data.agencyId,
  {
    message: 'Agency ID is required for agency roles',
    path: ['agencyId'],
  }
);
```

### Regex Pattern Validation

**Pattern**: Validate format with regex (phone, custom IDs)

**Example**: Phone number validation

```typescript
export const phoneValidation = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional();

// Usage in schema
export const leadContactSchema = z.object({
  email: emailValidation,
  phone: phoneValidation,
  linkedin: urlValidation.optional(),
});
```

### Array Validation

**Pattern**: Validate arrays with min/max length and item validation

**Example**: Qualification criteria (min 1 item)

```typescript
export const leadQualificationSchema = z.object({
  qualificationCriteria: z.array(
    z.object({
      criterion: z.string().min(1, 'Criterion is required'),
      met: z.boolean(),
      notes: z.string().optional(),
    })
  ).min(1, 'At least one qualification criterion is required'),
  // ... other fields
});
```

### Async Validation

**Pattern**: Validate with API call (unique email check)

**Implementation**:
```tsx
'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { emailValidation } from '@dashin/shared-types';
import { FormField, Button } from '@dashin/ui';
import { useState } from 'react';

// Basic schema without async validation
const userSchema = z.object({
  email: emailValidation,
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
});

export function UserForm() {
  const [emailError, setEmailError] = useState<string | null>(null);

  const methods = useForm({
    resolver: zodResolver(userSchema),
    mode: 'onChange',
  });

  const { handleSubmit, setError } = methods;

  const onSubmit = async (data) => {
    try {
      setEmailError(null);

      // Check if email exists (API call)
      const response = await fetch(`/api/users/check-email?email=${data.email}`);
      const { exists } = await response.json();

      if (exists) {
        // Set field-specific error
        setError('email', {
          type: 'manual',
          message: 'Email already exists',
        });
        return;
      }

      // Proceed with submission
      await createUser(data);
    } catch (error) {
      setEmailError('Failed to validate email');
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField
          name="email"
          label="Email Address"
          type="email"
          required
        />
        <FormField name="firstName" label="First Name" required />
        <FormField name="lastName" label="Last Name" required />
        
        {emailError && <FormError message={emailError} />}
        
        <Button type="submit">Create User</Button>
      </form>
    </FormProvider>
  );
}
```

## Best Practices

### 1. Schema Design

✅ **DO**:
- Group related validations in helper schemas (leadContactSchema, leadCompanySchema)
- Use z.string().trim() to remove whitespace automatically
- Provide helpful error messages: `min(1, 'Name is required')` instead of just `min(1)`
- Use z.optional() for truly optional fields
- Use default values: `z.boolean().default(true)`

❌ **DON'T**:
- Don't repeat validation logic - create helper schemas
- Don't use generic error messages - be specific
- Don't forget to trim string inputs
- Don't use z.nullable() unless you specifically need null (use z.optional() instead)

### 2. Form Initialization

✅ **DO**:
- Always provide defaultValues matching your schema structure
- Use empty strings for text fields, undefined for optional fields
- Set mode: 'onChange' for live validation
- Use FormProvider to enable useFormContext in child components

```tsx
const methods = useForm({
  resolver: zodResolver(campaignSchema),
  defaultValues: {
    name: '',
    description: '',
    targetCompanies: 100,
    targetLeads: 500,
    startDate: new Date().toISOString(),
    endDate: undefined,
    clientId: undefined,
  },
  mode: 'onChange',
});
```

❌ **DON'T**:
- Don't omit defaultValues - causes uncontrolled component warnings
- Don't use null for optional fields - use undefined
- Don't forget FormProvider wrapper

### 3. Error Handling

✅ **DO**:
- Show field-specific errors automatically (form components handle this)
- Show form-level errors with FormError component
- Clear errors on successful submission
- Provide actionable error messages

```tsx
const onSubmit = async (data) => {
  try {
    setSubmitError(null);
    await createCampaign.mutateAsync(data);
    setSubmitSuccess('Campaign created successfully!');
    reset();
  } catch (error) {
    setSubmitError(
      error instanceof Error ? error.message : 'Failed to create campaign'
    );
  }
};
```

❌ **DON'T**:
- Don't show generic "Something went wrong" messages
- Don't forget to reset error state before new submission
- Don't let errors persist after successful submission

### 4. Submit Button State

✅ **DO**:
- Disable when isSubmitting (prevent double submission)
- Disable when !isDirty (no changes made)
- Disable when !isValid (validation errors present)
- Show loading state: "Creating..." vs "Create Campaign"

```tsx
<Button
  type="submit"
  variant="primary"
  disabled={isSubmitting || !isDirty || !isValid}
>
  {isSubmitting ? 'Creating...' : 'Create Campaign'}
</Button>
```

❌ **DON'T**:
- Don't allow submission with validation errors
- Don't forget loading state feedback
- Don't enable submit on pristine (unchanged) forms

### 5. Nested Fields

✅ **DO**:
- Use dot notation for nested paths: `config.url`, `contact.email`
- Structure defaultValues to match schema nesting
- Group nested fields visually with FormSection

```tsx
// Schema
const dataSourceSchema = z.object({
  config: z.object({
    url: z.string().url(),
    selectors: z.object({
      name: z.string().optional(),
      email: z.string().optional(),
    }),
  }),
});

// Form
<FormField name="config.url" label="Target URL" type="url" />
<FormField name="config.selectors.name" label="Name Selector" />
<FormField name="config.selectors.email" label="Email Selector" />
```

❌ **DON'T**:
- Don't flatten nested structures in schema - maintain hierarchy
- Don't forget to initialize nested defaultValues

### 6. Type Safety

✅ **DO**:
- Export FormData types from validation schemas
- Use type inference: `type CampaignFormData = z.infer<typeof campaignSchema>`
- Type your onSubmit handler: `(data: CampaignFormData) => Promise<void>`
- Let zodResolver handle form types automatically

```typescript
// In validation.ts
export const campaignSchema = z.object({ ... });
export type CampaignFormData = z.infer<typeof campaignSchema>;

// In form component
import { type CampaignFormData } from '@dashin/shared-types';

const onSubmit = async (data: CampaignFormData) => {
  // data is fully typed
  console.log(data.name, data.targetCompanies);
};
```

❌ **DON'T**:
- Don't use `any` types for form data
- Don't manually type form values - use z.infer
- Don't duplicate type definitions

### 7. Accessibility

✅ **DO**:
- Use semantic HTML (label, button, form)
- Provide aria-invalid for error states (form components handle this)
- Use aria-describedby to link descriptions/errors
- Show required indicators (red asterisk)
- Ensure keyboard navigation works

❌ **DON'T**:
- Don't use divs for buttons - use button elements
- Don't forget to mark required fields visually
- Don't omit error messages for screen readers

## Testing

### Unit Testing Schemas

```typescript
import { campaignSchema } from '@dashin/shared-types';

describe('campaignSchema', () => {
  it('validates valid campaign data', () => {
    const validData = {
      name: 'Q1 2024 Campaign',
      description: 'Test campaign',
      targetCompanies: 100,
      targetLeads: 500,
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-03-31T23:59:59.999Z',
    };

    const result = campaignSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid name (too short)', () => {
    const invalidData = {
      name: '', // Empty string
      targetCompanies: 100,
      targetLeads: 500,
      startDate: '2024-01-01T00:00:00.000Z',
    };

    const result = campaignSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['name']);
    }
  });

  it('rejects endDate before startDate', () => {
    const invalidData = {
      name: 'Test Campaign',
      targetCompanies: 100,
      targetLeads: 500,
      startDate: '2024-03-01T00:00:00.000Z',
      endDate: '2024-01-01T00:00:00.000Z', // Before startDate
    };

    const result = campaignSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['endDate']);
      expect(result.error.issues[0].message).toContain('after start date');
    }
  });
});
```

### Integration Testing Forms

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateCampaignForm } from './CreateCampaignForm';

describe('CreateCampaignForm', () => {
  it('shows validation errors for empty required fields', async () => {
    render(<CreateCampaignForm />);
    
    const submitButton = screen.getByText('Create Campaign');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const onSuccess = jest.fn();
    render(<CreateCampaignForm onSuccess={onSuccess} />);

    // Fill in form
    await userEvent.type(
      screen.getByLabelText(/campaign name/i),
      'Q1 2024 Campaign'
    );
    await userEvent.type(
      screen.getByLabelText(/target companies/i),
      '100'
    );
    await userEvent.type(
      screen.getByLabelText(/target leads/i),
      '500'
    );

    // Submit
    await userEvent.click(screen.getByText('Create Campaign'));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('disables submit button when form is invalid', () => {
    render(<CreateCampaignForm />);
    
    const submitButton = screen.getByText('Create Campaign');
    expect(submitButton).toBeDisabled();
  });

  it('shows character counter for description', async () => {
    render(<CreateCampaignForm />);
    
    const description = screen.getByLabelText(/description/i);
    await userEvent.type(description, 'Test description');

    expect(screen.getByText(/\d+ \/ 500/)).toBeInTheDocument();
  });
});
```

### Testing Conditional Validation

```typescript
import { leadQualificationSchema } from '@dashin/shared-types';

describe('leadQualificationSchema', () => {
  it('requires rejectionReason when score ≤ 2', () => {
    const data = {
      score: 2,
      priority: 'low',
      qualificationCriteria: [{ criterion: 'Budget', met: false }],
      notes: 'Not qualified',
      // Missing rejectionReason
    };

    const result = leadQualificationSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Rejection reason');
    }
  });

  it('allows missing rejectionReason when score > 2', () => {
    const data = {
      score: 4,
      priority: 'high',
      qualificationCriteria: [{ criterion: 'Budget', met: true }],
      notes: 'Qualified',
      // rejectionReason not required
    };

    const result = leadQualificationSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
```

## Summary

This form validation infrastructure provides:

✅ **Type-Safe Validation**: Zod schemas with TypeScript inference  
✅ **Comprehensive Coverage**: 12 schemas covering all application domains  
✅ **Reusable Components**: 5 form components with consistent styling  
✅ **Cross-Field Validation**: Date comparisons, conditional requirements  
✅ **Nested Object Support**: Deep validation for complex structures  
✅ **Accessibility**: ARIA attributes, keyboard navigation, screen reader support  
✅ **Error Handling**: Field-level and form-level error display  
✅ **Developer Experience**: Helpful error messages, TypeScript autocomplete  
✅ **Performance**: Tree-shaking (only imported schemas bundled), minimal bundle impact  

**Next Steps**:
1. Integrate forms into actual pages (campaign creation, lead qualification, etc.)
2. Add custom validation rules as needed
3. Implement async validation for unique constraints
4. Add form-level validation messages
5. Create additional form components (checkbox, radio, file upload)
6. Add unit tests for all schemas
7. Add integration tests for all forms

**Resources**:
- Zod Documentation: https://zod.dev
- react-hook-form Documentation: https://react-hook-form.com
- Example Forms: `apps/web/src/components/forms/`
- Validation Schemas: `packages/shared-types/src/validation.ts`
- Form Components: `packages/ui/src/components/form-*.tsx`
