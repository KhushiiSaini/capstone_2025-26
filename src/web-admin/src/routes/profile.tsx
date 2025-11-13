import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useRef, type HTMLInputTypeAttribute } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { getCurrentUser } from '../lib/auth';

type User = {
  id: number;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  email: string;
  phoneNumber: string | null;
  dob: string | null;
  dietaryRestrictions: string | null;
  emergencyContact: string | null;
  mediaConsent: boolean | null;
  program: string | null;
  year: string | null;
  studentNumber: string | null;
  pronouns: string | null;
  createdAt: string;
  updatedAt: string;
};

type UserForm = {
  firstName: string;
  lastName: string;
  preferredName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  dietaryRestrictions: string;
  emergencyContact: string;
  mediaConsent: boolean;
  program: string;
  year: string;
  studentNumber: string;
  pronouns: string;
};

async function fetchProfile(email: string): Promise<User> {
  const res = await fetch(`/api/auth/profile?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json();
}

async function updateUser(payload: { id: number; data: Partial<UserForm> }) {
  const res = await fetch(`/api/auth/users/${payload.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload.data,
      dob: payload.data.dob ? new Date(payload.data.dob).toISOString() : null,
    }),
  });

  if (!res.ok) {
    const message = await res.json().catch(() => ({}));
    throw new Error(message.error || 'Failed to update profile');
  }

  return res.json() as Promise<User>;
}

const emptyForm: UserForm = {
  firstName: '',
  lastName: '',
  preferredName: '',
  email: '',
  phoneNumber: '',
  dob: '',
  dietaryRestrictions: '',
  emergencyContact: '',
  mediaConsent: false,
  program: '',
  year: '',
  studentNumber: '',
  pronouns: '',
};

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const queryClient = useQueryClient();
  const [currentEmail] = useState(() => getCurrentUser()?.email ?? null);
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['admin-profile', currentEmail],
    queryFn: () => fetchProfile(currentEmail!),
    enabled: Boolean(currentEmail),
  });

  const [formState, setFormState] = useState<UserForm>(emptyForm);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    setFormState({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      preferredName: user.preferredName ?? '',
      email: user.email ?? '',
      phoneNumber: user.phoneNumber ?? '',
      dob: user.dob ? user.dob.slice(0, 10) : '',
      dietaryRestrictions: user.dietaryRestrictions ?? '',
      emergencyContact: user.emergencyContact ?? '',
      mediaConsent: Boolean(user.mediaConsent),
      program: user.program ?? '',
      year: user.year ?? '',
      studentNumber: user.studentNumber ?? '',
      pronouns: user.pronouns ?? '',
    });
    setStatusMessage(null);
  }, [user]);

const mutation = useMutation({
  mutationFn: updateUser,
  onSuccess: (updatedUser) => {
    queryClient.setQueryData(['admin-profile', currentEmail], updatedUser);
    setStatusMessage({ type: 'success', message: 'Changes saved successfully.' });
    setTimeout(() => setStatusMessage(null), 3000);
  },
  onError: (mutationError: unknown) => {
    const message = mutationError instanceof Error ? mutationError.message : 'Failed to update profile';
    setStatusMessage({ type: 'error', message });
  },
});

  if (!currentEmail) {
    return (
      <div className="p-8 text-[#7A003C]">
        Please log in to view your profile.
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8 text-[#7A003C]">Loading profile…</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-red-600">
        Failed to load your profile. Please ensure your account exists in the system.
      </div>
    );
  }

  if (!user) {
    return <div className="p-8 text-[#7A003C]">Profile not found.</div>;
  }

  const handleInputChange = (field: keyof UserForm, value: string | boolean) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    mutation.mutate({ id: user.id, data: formState });
  };

  const handleReset = () => {
    if (user) {
      setFormState({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        preferredName: user.preferredName ?? '',
        email: user.email ?? '',
        phoneNumber: user.phoneNumber ?? '',
        dob: user.dob ? user.dob.slice(0, 10) : '',
        dietaryRestrictions: user.dietaryRestrictions ?? '',
        emergencyContact: user.emergencyContact ?? '',
        mediaConsent: Boolean(user.mediaConsent),
        program: user.program ?? '',
        year: user.year ?? '',
        studentNumber: user.studentNumber ?? '',
        pronouns: user.pronouns ?? '',
      });
      setStatusMessage(null);
    }
  };

  const displayName = user.preferredName || `${user.firstName} ${user.lastName}`;

  return (
    <main className="min-h-screen bg-[#FFFFFF] p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <p className="text-sm uppercase tracking-wide text-[#AF668A] mb-2">
            Welcome Back
          </p>
          <h1 className="text-4xl font-extrabold text-[#7A003C]">
            {displayName}
          </h1>
          <p className="text-[#953363] mt-2">
            Review and update your personal information. Changes save instantly.
          </p>
        </header>

        <section className="bg-white border border-[#F3D3DF] rounded-2xl shadow-md p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-[#AF668A]">Account</p>
              <h2 className="text-2xl font-semibold text-[#7A003C]">
                {user.email}
              </h2>
              <p className="text-xs text-[#CA99B1] mt-1">
                Profile ID #{user.id} · Last updated {new Date(user.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabeledInput
                label="First Name"
                value={formState.firstName}
                onChange={(value) => handleInputChange('firstName', value)}
              />
              <LabeledInput
                label="Last Name"
                value={formState.lastName}
                onChange={(value) => handleInputChange('lastName', value)}
              />
              <LabeledInput
                label="Preferred Name"
                value={formState.preferredName}
                onChange={(value) => handleInputChange('preferredName', value)}
              />
              <LabeledSelect
                label="Pronouns"
                value={formState.pronouns}
                onChange={(value) => handleInputChange('pronouns', value)}
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
              <LabeledInput
                label="Email"
                type="email"
                value={formState.email}
                onChange={(value) => handleInputChange('email', value)}
              />
              <LabeledInput
                label="Phone Number"
                value={formState.phoneNumber}
                onChange={(value) => handleInputChange('phoneNumber', value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabeledInput
                label="Program"
                value={formState.program}
                onChange={(value) => handleInputChange('program', value)}
              />
                <LabeledSelect
                  label="Year"
                  value={formState.year}
                  onChange={(value) => handleInputChange('year', value)}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabeledInput
                label="Student Number"
                value={formState.studentNumber}
                onChange={(value) => handleInputChange('studentNumber', value)}
              />
              <LabeledDatePicker
                label="Date of Birth"
                value={formState.dob}
                onChange={(value) => handleInputChange('dob', value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabeledTextArea
                label="Emergency Contact"
                value={formState.emergencyContact}
                onChange={(value) => handleInputChange('emergencyContact', value)}
              />
              <LabeledTextArea
                label="Dietary Restrictions"
                value={formState.dietaryRestrictions}
                onChange={(value) => handleInputChange('dietaryRestrictions', value)}
              />
            </div>

            <label className="flex items-center gap-3 text-[#7A003C] font-medium">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-[#CA99B1] text-[#7A003C] focus:ring-[#7A003C]"
                checked={formState.mediaConsent}
                onChange={(event) => handleInputChange('mediaConsent', event.target.checked)}
              />
              Media consent received
            </label>

            {statusMessage && (
              <div
                className={`rounded-xl px-4 py-3 text-sm font-medium ${
                  statusMessage.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {statusMessage.message}
              </div>
            )}

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate({ to: '/' })}
                className="px-6 py-3 border border-[#CA99B1] text-[#7A003C] rounded-xl font-semibold hover:bg-[#FDF4F8]"
              >
                ← Back to Dashboard
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

interface LabeledInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: HTMLInputTypeAttribute;
}

function LabeledInput({ label, value, onChange, type = 'text' }: LabeledInputProps) {
  return (
    <label className="flex flex-col text-sm font-medium text-[#7A003C] gap-1">
      {label}
      <input
        type={type}
        value={value}
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
                      isSelected
                        ? 'bg-[#F9E9F0] text-[#7A003C] font-semibold'
                        : 'text-[#7A003C] hover:bg-[#FDF4F8]'
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
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="appearance-none rounded-xl border border-[#F3D3DF] px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#7A003C] w-full text-[#7A003C]"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#7A003C] text-xs">
          📅
        </span>
      </div>
    </label>
  );
}
