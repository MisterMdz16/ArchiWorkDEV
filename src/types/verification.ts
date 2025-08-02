export interface VerificationFormData {
  full_name: string;
  phone_number: string;
  detailed_address: string;
  specialization: string;
  experience_years: string;
  specialization_description: string;
  software_proficiency: string[];
  portfolio_url: string;
  project_description: string;
  certifications: string;
  education: string;
  additional_info: string;
  terms_accepted: boolean;
}

export interface UploadedFiles {
  national_id: File | null;
  sample_project: File | null;
}

export interface VerificationApplication {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: Date;
  reviewed_at?: Date;
  reviewer_id?: string;
  rejection_reason?: string;
  form_data: VerificationFormData;
  file_urls: {
    national_id_url?: string;
    sample_project_url?: string;
  };
}