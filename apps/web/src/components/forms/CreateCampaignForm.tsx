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

  const {
    handleSubmit,
    formState: { isSubmitting, isDirty, isValid },
    reset,
  } = methods;

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

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Form Messages */}
        {submitError && <FormError message={submitError} />}
        {submitSuccess && <FormSuccess message={submitSuccess} />}

        {/* Basic Information */}
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

        {/* Targets */}
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

        {/* Timeline */}
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

        {/* Client Assignment (Optional) */}
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

        {/* Validation State Indicator (Dev Only) */}
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
