import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useRef } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchProfile,
  });

  const [formState, setFormState] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setFormState({
        ...profile,
        dob: profile.dob ? profile.dob.slice(0, 10) : '',
      });
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(['user-profile'], updated);
      setToast({ type: 'success', message: 'Changes saved successfully.' });
      setIsEditing(false);
      setTimeout(() => setToast(null), 3000);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setToast({ type: 'error', message });
      setTimeout(() => setToast(null), 3000);
    },
  });

  if (isLoading || !formState) return <div className="p-8 text-[#7A003C]">Loading profile…</div>;
  if (error) return <div className="p-8 text-red-600">Failed to load your profile.</div>;

  const handleChange = (field: keyof UserProfile, value: string | boolean) => {
    setFormState((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;
    mutation.mutate({ ...formState, dob: formState.dob || null });
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      {/* ---------------- Taskbar / Header ---------------- */}
      <header className="bg-gradient-to-r from-[#620030] to-[#953363] text-white shadow-lg">
        <div className="w-full px-6 py-4 flex justify-between items-center">

          {/* LEFT-ALIGNED LOGO */}
          <div className="flex items-center space-x-3" onClick={() => window.location.href = "/"}>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#7A003C] font-extrabold text-lg shadow-sm">
              MES
            </div>
            <div>
              <h1 className="font-bold text-xl leading-none">MES Events Platform</h1>
            </div>
          </div>

          {/* RIGHT-SIDE NAV BUTTONS */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate({ to: '/events' })}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
            >
              Events
            </button>

            <button
              onClick={() => navigate({ to: '/profile' })}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
            >
              Profile
            </button>

            <button
              onClick={() => navigate({ to: '/inbox' })}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
            >
              Notifications
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

        </div>
      </header>

      {/* ---------------- Main Profile Content ---------------- */}
      <main className="bg-[#F9E9F0] p-8">
        {/* <div className=" bg-[#F9E9F0] p-8"> */}

        <div className="rounded-3xl shadow-md p-10 bg-white mx-auto w-full ">

          {toast && (
            <div
              className={`fixed top-6 right-6 z-50 rounded-xl px-4 py-3 text-white shadow-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                }`}
            >
              {toast.message}
            </div>
          )}

          <div className="space-y-8">

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
                  disabled={mutation.status === 'pending'}
                  className="px-6 py-3 bg-[#7A003C] text-white rounded-xl font-semibold shadow hover:bg-[#953363] transition disabled:opacity-50"
                >
                  {mutation.status === 'pending' ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isEditing && profile) {
                      setFormState({ ...profile, dob: profile.dob ? profile.dob.slice(0, 10) : '' });
                    }
                    setIsEditing((prev) => !prev);
                  }}
                  className="px-4 py-2 border border-[#CA99B1] text-[#7A003C] rounded-xl font-semibold bg-white hover:bg-[#FDF4F8]"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
            </div>


            <section className="bg-white border border-[#F3D3DF] rounded-2xl shadow-md p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LabeledInput label="First Name" value={formState.firstName || ''} onChange={(v) => handleChange('firstName', v)} disabled={!isEditing} />
                  <LabeledInput label="Last Name" value={formState.lastName || ''} onChange={(v) => handleChange('lastName', v)} disabled={!isEditing} />
                  <LabeledInput label="Preferred Name" value={formState.preferredName || ''} onChange={(v) => handleChange('preferredName', v)} disabled={!isEditing} />
                  <LabeledSelect
                    label="Pronouns"
                    value={formState.pronouns || ''}
                    onChange={(v) => handleChange('pronouns', v)}
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
                  <LabeledInput label="Phone Number" value={formState.phoneNumber || ''} onChange={(v) => handleChange('phoneNumber', v)} disabled={!isEditing} />
                  <LabeledInput label="Program" value={formState.program || ''} onChange={(v) => handleChange('program', v)} disabled={!isEditing} />
                  <LabeledSelect
                    label="Year"
                    value={formState.year || ''}
                    onChange={(v) => handleChange('year', v)}
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
                  <LabeledDatePicker label="Date of Birth" value={formState.dob || ''} onChange={(v) => handleChange('dob', v)} disabled={!isEditing} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LabeledInput label="Student Number" value={formState.studentNumber || ''} onChange={(v) => handleChange('studentNumber', v)} />
                  <LabeledInput label="Email" value={formState.email} onChange={() => { }} disabled />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LabeledTextArea label="Emergency Contact" value={formState.emergencyContact || ''} onChange={(v) => handleChange('emergencyContact', v)} disabled={!isEditing} />
                  <LabeledTextArea label="Dietary Restrictions" value={formState.dietaryRestrictions || ''} onChange={(v) => handleChange('dietaryRestrictions', v)} disabled={!isEditing} />
                </div>

                <label className="flex items-center gap-3 text-[#7A003C] font-medium">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-[#CA99B1] text-[#7A003C] focus:ring-[#7A003C]"
                    checked={Boolean(formState.mediaConsent)}
                    onChange={(e) => handleChange('mediaConsent', e.target.checked)}
                    disabled={!isEditing}
                  />
                  Media consent received
                </label>


              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

// ---------------------- Helper Components ----------------------

function LabeledInput({ label, value, onChange, type = 'text', disabled = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; disabled?: boolean }) {
  return (
    <label className="flex flex-col text-sm font-medium text-[#7A003C] gap-1">
      {label}
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-[#F3D3DF] px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#7A003C]"
      />
    </label>
  );
}

function LabeledTextArea({ label, value, onChange, disabled = false }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return (
    <label className="flex flex-col text-sm font-medium text-[#7A003C] gap-1">
      {label}
      <textarea
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-[#F3D3DF] px-4 py-2.5 text-base min-h-[96px] focus:outline-none focus:ring-2 focus:ring-[#7A003C]"
      />
    </label>
  );
}

function LabeledSelect({ label, value, onChange, options, disabled = false }: { label: string; value: string; onChange: (value: string) => void; options: { label: string; value: string }[]; disabled?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
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
          <span>{selectedOption.label}</span>
          <span className="text-xs text-[#953363]">▼</span>
        </button>
        {isOpen && !disabled && (
          <ul className="absolute z-10 mt-2 max-h-48 w-full overflow-auto rounded-xl border border-[#F3D3DF] bg-white shadow-lg">
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm ${opt.value === value ? 'bg-[#F9E9F0] font-semibold text-[#7A003C]' : 'hover:bg-[#FDF4F8] text-[#7A003C]'
                    }`}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </label>
  );
}

function LabeledDatePicker({ label, value, onChange, disabled = false }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return (
    <label className="flex flex-col text-sm font-medium text-[#7A003C] gap-1">
      {label}
      <input
        type="date"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-[#F3D3DF] px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#7A003C]"
      />
    </label>
  );
}
