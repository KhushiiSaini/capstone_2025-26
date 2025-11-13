import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useRef } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

type UserProfile = {
  firstName: string;
  lastName: string;
  preferredName?: string;
  email: string;
  phoneNumber?: string;
  dob?: string | null;
  dietaryRestrictions?: string;
  emergencyContact?: string;
  mediaConsent?: boolean;
  program?: string;
  year?: string;
  studentNumber?: string;
  pronouns?: string;
  updatedAt?: string;
};

async function fetchProfile(): Promise<UserProfile> {
  const res = await fetch('/api/profile', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json();
}

async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const message = await res.json().catch(() => ({}));
    throw new Error(message.error || 'Failed to update profile');
  }
  return res.json();
}

export const Route = createFileRoute('/profile')({
  component: () => (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  ),
});

function ProfilePage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchProfile,
  });

  const [formState, setFormState] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setFormState({
        ...profile,
        dob: profile.dob ? profile.dob.slice(0, 10) : '',
      });
      setStatus(null);
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(['user-profile'], updated);
      setStatus({ type: 'success', message: 'Changes saved successfully.' });
      setTimeout(() => setStatus(null), 3000);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setStatus({ type: 'error', message });
    },
  });

  if (isLoading || !formState) {
    return <div className="p-8 text-[#7A003C]">Loading profile…</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-red-600">
        Failed to load your profile. Please ensure your account exists.
      </div>
    );
  }

  const handleChange = (field: keyof UserProfile, value: string | boolean) => {
    setFormState((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formState, dob: formState.dob || null };
    mutation.mutate(payload);
  };

  return (
    <main className="min-h-screen bg-[#FFFFFF] p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <p className="text-sm uppercase tracking-wide text-[#AF668A] mb-2">Your Profile</p>
          <h1 className="text-4xl font-extrabold text-[#7A003C]">
            {formState.preferredName || `${formState.firstName} ${formState.lastName}`}
          </h1>
          <p className="text-[#953363] mt-2">
            Update your contact details, preferences, and emergency information.
          </p>
        </header>

        <section className="bg-white border border-[#F3D3DF] rounded-2xl shadow-md p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-[#AF668A]">Account</p>
              <h2 className="text-xl font-semibold text-[#7A003C]">{user?.email}</h2>
            </div>
            {status && (
              <span
                className={`text-sm font-medium ${
                  status.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {status.message}
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabeledInput label="First Name" value={formState.firstName || ''} onChange={(v) => handleChange('firstName', v)} />
              <LabeledInput label="Last Name" value={formState.lastName || ''} onChange={(v) => handleChange('lastName', v)} />
              <LabeledInput label="Preferred Name" value={formState.preferredName || ''} onChange={(v) => handleChange('preferredName', v)} />
              <LabeledSelect
                label="Pronouns"
                value={formState.pronouns || ''}
                onChange={(v) => handleChange('pronouns', v)}
                options={[
                  { label: 'Select pronouns', value: '' },
                  { label: 'She / Her', value: 'She/Her' },
                  { label: 'He / Him', value: 'He/Him' },
                  { label: 'They / Them', value: 'They/Them' },
                  { label: 'Prefer not to say', value: 'Prefer not to say' },
                  { label: 'Other', value: 'Other' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabeledInput label="Phone Number" value={formState.phoneNumber || ''} onChange={(v) => handleChange('phoneNumber', v)} />
              <LabeledInput label="Program" value={formState.program || ''} onChange={(v) => handleChange('program', v)} />
              <LabeledSelect
                label="Year"
                value={formState.year || ''}
                onChange={(v) => handleChange('year', v)}
                options={[
                  { label: 'Select year', value: '' },
                  { label: '1', value: '1' },
                  { label: '2', value: '2' },
                  { label: '3', value: '3' },
                  { label: '4', value: '4' },
                  { label: '5+', value: '5+' },
                  { label: 'Masters', value: 'Masters' },
                  { label: 'PhD', value: 'PhD' },
                ]}
              />
              <LabeledDatePicker
                label="Date of Birth"
                value={formState.dob || ''}
                onChange={(v) => handleChange('dob', v)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabeledInput label="Student Number" value={formState.studentNumber || ''} onChange={(v) => handleChange('studentNumber', v)} />
              <LabeledInput label="Email" value={formState.email} onChange={() => {}} disabled />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabeledTextArea label="Emergency Contact" value={formState.emergencyContact || ''} onChange={(v) => handleChange('emergencyContact', v)} />
              <LabeledTextArea label="Dietary Restrictions" value={formState.dietaryRestrictions || ''} onChange={(v) => handleChange('dietaryRestrictions', v)} />
            </div>

            <label className="flex items-center gap-3 text-[#7A003C] font-medium">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-[#CA99B1] text-[#7A003C] focus:ring-[#7A003C]"
                checked={Boolean(formState.mediaConsent)}
                onChange={(e) => handleChange('mediaConsent', e.target.checked)}
              />
              Media consent received
            </label>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-3 border border-[#CA99B1] text-[#7A003C] rounded-xl font-semibold hover:bg-[#FDF4F8]"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={mutation.status === 'pending'}
                className="px-6 py-3 bg-[#7A003C] text-white rounded-xl font-semibold shadow hover:bg-[#953363] transition disabled:opacity-50"
              >
                {mutation.status === 'pending' ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  type = 'text',
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col text-sm font-medium text-[#7A003C] gap-1">
      {label}
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-[#F3D3DF] px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#7A003C]"
      />
    </label>
  );
}

function LabeledTextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col text-sm font-medium text-[#7A003C] gap-1">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-[#F3D3DF] px-4 py-2.5 text-base min-h-[96px] focus:outline-none focus:ring-2 focus:ring-[#7A003C]"
      />
    </label>
  );
}

function LabeledSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <label className="flex flex-col text-sm font-medium text-[#7A003C] gap-1">
      {label}
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full rounded-xl border border-[#F3D3DF] bg-white px-4 py-2.5 text-left text-base text-[#7A003C] focus:outline-none focus:ring-2 focus:ring-[#7A003C] flex items-center justify-between"
        >
          <span>{selectedOption?.label ?? 'Select an option'}</span>
          <span className="text-xs text-[#953363]">▼</span>
        </button>
        {isOpen && (
          <ul className="absolute z-10 mt-2 max-h-48 w-full overflow-auto rounded-xl border border-[#F3D3DF] bg-white shadow-lg">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value || 'empty'}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm ${
                      isSelected ? 'bg-[#F9E9F0] text-[#7A003C] font-semibold' : 'text-[#7A003C] hover:bg-[#FDF4F8]'
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </label>
  );
}

function LabeledDatePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col text-sm font-medium text-[#7A003C] gap-1">
      {label}
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-[#F3D3DF] px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#7A003C]"
      />
    </label>
  );
}
