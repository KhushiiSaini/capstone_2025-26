import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useRef, type HTMLInputTypeAttribute } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Calendar, User, ChartBar } from 'lucide-react';
import { getCurrentUser } from '../lib/auth';
import ProtectedTeamPortal from '../components/ProtectedTeamPortal';

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

const sidebarLinks = [
  { title: 'Event Manager', icon: Calendar, path: '/events' },
  { title: 'User Profile', icon: User, path: '/profile' },
  { title: 'Analytics', icon: ChartBar, path: '/analytics' },
];

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
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const syncFormWithUser = (target: User) => {
    setFormState({
      firstName: target.firstName ?? '',
      lastName: target.lastName ?? '',
      preferredName: target.preferredName ?? '',
      email: target.email ?? '',
      phoneNumber: target.phoneNumber ?? '',
      dob: target.dob ? target.dob.slice(0, 10) : '',
      dietaryRestrictions: target.dietaryRestrictions ?? '',
      emergencyContact: target.emergencyContact ?? '',
      mediaConsent: Boolean(target.mediaConsent),
      program: target.program ?? '',
      year: target.year ?? '',
      studentNumber: target.studentNumber ?? '',
      pronouns: target.pronouns ?? '',
    });
  };

  useEffect(() => {
    if (!user) return;
    syncFormWithUser(user);
    setIsEditing(false);
  }, [user]);

  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['admin-profile', currentEmail], updatedUser);
        syncFormWithUser(updatedUser); // <— sync form state

      setToast({ type: 'success', message: 'Changes saved successfully.' });
      setIsEditing(false);
      setTimeout(() => setToast(null), 3000);
    },
    onError: (mutationError: unknown) => {
      const message = mutationError instanceof Error ? mutationError.message : 'Failed to update profile';
      setToast({ type: 'error', message });
      setTimeout(() => setToast(null), 3000);
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
    if (!isEditing) return;
    mutation.mutate({ id: user.id, data: formState });
  };

  const handleEditToggle = () => {
    if (isEditing && user) {
      syncFormWithUser(user);
    }
    setIsEditing((prev) => !prev);
  };

  const displayName = user.preferredName || `${user.firstName} ${user.lastName}`;

  return (
    <ProtectedTeamPortal>
      <main className="min-h-screen bg-[#FFFFFF] flex flex-col lg:flex-row relative">
        {toast && (
          <div
            className={`fixed top-6 right-6 z-50 rounded-xl px-4 py-3 text-white shadow-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
              }`}
          >
            {toast.message}
          </div>
        )}

        <aside className="bg-[#620030] text-white w-full lg:w-72 shadow-lg p-8 flex flex-col space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl text-[#FFFFFF] flex items-center space-x-2 font-extrabold">
              <span>Admin Dashboard</span>
              <span className="w-6 h-6 bg-gradient-to-tr from-[#953363] to-[#AF668A] rounded-full flex-shrink-0" />
            </h2>
            <div className="mt-2 w-16 h-1 bg-[#AF668A] rounded-full" />
          </div>

          <div className="flex flex-col sticky space-y-4">
            {sidebarLinks.map((link) => (
              <button
                key={link.title}
                onClick={() => navigate({ to: link.path })}
                className={`flex items-center p-4 rounded-xl transition-all shadow-md ${link.path === '/profile' ? 'bg-[#AF668A] text-white' : 'bg-[#953363] text-white hover:bg-[#AF668A]'
                  }`}
              >
                <link.icon className="w-6 h-6 mr-3" />
                <span className="font-medium">{link.title}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex-1 p-6 sm:p-10">
          <div className="mx-auto space-y-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#F9E9F0] rounded-2xl p-6 shadow">
              <div>
                <h1 className="text-4xl font-extrabold text-[#7A003C] mb-2">
                  Hi, {formState.preferredName || `${formState.firstName}`}
                </h1>
                <p className="text-[#953363]">
                  Update your contact details, preferences, and emergency information.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
                <button
                  type="submit"
                  onClick={() => mutation.mutate({ id: user.id, data: formState })}
                  disabled={!isEditing || mutation.status === 'pending'}
                  className="px-6 py-3 bg-[#7A003C] text-white rounded-xl font-semibold shadow hover:bg-[#953363] transition disabled:opacity-50"
                >
                  {mutation.status === 'pending' ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="px-4 py-2 border border-[#CA99B1] text-[#7A003C] rounded-xl font-semibold hover:bg-[#FDF4F8]"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
            </div>



            <section className="bg-white border border-[#F3D3DF] rounded-2xl shadow-md p-6 lg:p-8">

              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LabeledInput
                    label="First Name"
                    value={formState.firstName}
                    onChange={(value) => handleInputChange('firstName', value)}
                    disabled={!isEditing}
                  />
                  <LabeledInput
                    label="Last Name"
                    value={formState.lastName}
                    onChange={(value) => handleInputChange('lastName', value)}
                    disabled={!isEditing}
                  />
                  <LabeledInput
                    label="Preferred Name"
                    value={formState.preferredName}
                    onChange={(value) => handleInputChange('preferredName', value)}
                    disabled={!isEditing}
                  />
                  <LabeledSelect
                    label="Pronouns"
                    value={formState.pronouns}
                    onChange={(value) => handleInputChange('pronouns', value)}
                    disabled={!isEditing}
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
                    disabled
                  />
                  <LabeledInput
                    label="Phone Number"
                    value={formState.phoneNumber}
                    onChange={(value) => handleInputChange('phoneNumber', value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LabeledInput
                    label="Program"
                    value={formState.program}
                    onChange={(value) => handleInputChange('program', value)}
                    disabled={!isEditing}
                  />
                  <LabeledSelect
                    label="Year"
                    value={formState.year}
                    onChange={(value) => handleInputChange('year', value)}
                    disabled={!isEditing}
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
                    disabled={!isEditing}
                  />
                  <LabeledDatePicker
                    label="Date of Birth"
                    value={formState.dob}
                    onChange={(value) => handleInputChange('dob', value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LabeledTextArea
                    label="Emergency Contact"
                    value={formState.emergencyContact}
                    onChange={(value) => handleInputChange('emergencyContact', value)}
                    disabled={!isEditing}
                  />
                  <LabeledTextArea
                    label="Dietary Restrictions"
                    value={formState.dietaryRestrictions}
                    onChange={(value) => handleInputChange('dietaryRestrictions', value)}
                    disabled={!isEditing}
                  />
                </div>

                <label className="flex items-center gap-3 text-[#7A003C] font-medium">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-[#CA99B1] text-[#7A003C] focus:ring-[#7A003C]"
                    checked={formState.mediaConsent}
                    onChange={(event) => handleInputChange('mediaConsent', event.target.checked)}
                    disabled={!isEditing}
                  />
                  Media consent received
                </label>


              </form>
            </section>
          </div>
        </section>
      </main>
    </ProtectedTeamPortal>
  );
}

interface LabeledInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: HTMLInputTypeAttribute;
  disabled?: boolean;
}

function LabeledInput({ label, value, onChange, type = 'text', disabled = false }: LabeledInputProps) {
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
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col text-sm font-medium text-[#7A003C] gap-1">
      {label}
      <textarea
        value={value}
        disabled={disabled}
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
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  disabled?: boolean;
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
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className="w-full rounded-xl border border-[#F3D3DF] bg-white px-4 py-2.5 text-left text-base text-[#7A003C] focus:outline-none focus:ring-2 focus:ring-[#7A003C] flex items-center justify-between disabled:opacity-60"
        >
          <span>{selectedOption?.label ?? 'Select an option'}</span>
          <span className="text-xs text-[#953363]">▼</span>
        </button>
        {isOpen && !disabled && (
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
                    className={`w-full px-4 py-2 text-left text-sm ${isSelected
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
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col text-sm font-medium text-[#7A003C] gap-1">
      {label}
      <div className="relative">
        <input
          type="date"
          value={value}
          disabled={disabled}
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

