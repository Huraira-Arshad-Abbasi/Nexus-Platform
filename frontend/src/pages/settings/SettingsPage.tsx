import React, { useState } from 'react'
import { User, Lock, Bell, Globe, Palette, CreditCard } from 'lucide-react'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { useAuth } from '../../context/useAuth'
import { Entrepreneur, Investor } from '../../types'
import { authApi } from '../../api/api'

type ActiveSection = 'profile' | 'security'

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth()
  const [activeSection, setActiveSection] = useState<ActiveSection>('profile')
  const [saving, setSaving] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // OTP state (for future 2FA implementation)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpSuccess, setOtpSuccess] = useState(false)
  const [otpError, setOtpError] = useState('')
  // Handler to send OTP for 2FA setup
  const handleSendOTP = async () => {
    setOtpLoading(true)
    setOtpError('')
    try {
      await authApi.sendOTP()
      setOtpSent(true)
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setOtpLoading(false)
    }
  }
  // For 2FA verification flow
  const handleVerifyOTP = async () => {
    setOtpLoading(true)
    setOtpError('')
    try {
      await authApi.verifyOTP(otp)
      setOtpSuccess(true)
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setOtpLoading(false)
    }
  }
  // ── Shared profile fields ──────────────────────────────
  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [location, setLocation] = useState(
    (user as Entrepreneur)?.location || ''
  )

  // ── Entrepreneur-specific fields ──────────────────────
  const [startupName, setStartupName] = useState(
    (user as Entrepreneur)?.startupName || ''
  )
  const [pitchSummary, setPitchSummary] = useState(
    (user as Entrepreneur)?.pitchSummary || ''
  )
  const [fundingNeeded, setFundingNeeded] = useState(
    (user as Entrepreneur)?.fundingNeeded || ''
  )
  const [industry, setIndustry] = useState(
    (user as Entrepreneur)?.industry || ''
  )
  const [foundedYear, setFoundedYear] = useState(
    (user as Entrepreneur)?.foundedYear?.toString() || ''
  )
  const [teamSize, setTeamSize] = useState(
    (user as Entrepreneur)?.teamSize?.toString() || ''
  )

  // ── Investor-specific fields ───────────────────────────
  const [minimumInvestment, setMinimumInvestment] = useState(
    (user as Investor)?.minimumInvestment || ''
  )
  const [maximumInvestment, setMaximumInvestment] = useState(
    (user as Investor)?.maximumInvestment || ''
  )
  const [totalInvestments, setTotalInvestments] = useState(
    (user as Investor)?.totalInvestments?.toString() || ''
  )
  const [investmentInterests, setInvestmentInterests] = useState(
    (user as Investor)?.investmentInterests?.join(', ') || ''
  )
  const [investmentStage, setInvestmentStage] = useState(
    (user as Investor)?.investmentStage?.join(', ') || ''
  )
  const [portfolioCompanies, setPortfolioCompanies] = useState(
    (user as Investor)?.portfolioCompanies?.join(', ') || ''
  )

  // ── Password fields ────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  if (!user) return null

  // ── Save profile handler ───────────────────────────────
  const handleSaveProfile = async () => {
    setSaving(true)
    setSuccessMsg('')
    setErrorMsg('')
    try {
      const sharedUpdates = { name, bio }

      const roleUpdates =
        user.role === 'entrepreneur'
          ? {
              location,
              startupName,
              pitchSummary,
              fundingNeeded,
              industry,
              foundedYear: foundedYear ? parseInt(foundedYear) : null,
              teamSize: teamSize ? parseInt(teamSize) : null
            }
          : {
              minimumInvestment,
              maximumInvestment,
              totalInvestments: totalInvestments
                ? parseInt(totalInvestments)
                : 0,
              investmentInterests: investmentInterests
                .split(',')
                .map(s => s.trim())
                .filter(Boolean),
              investmentStage: investmentStage
                .split(',')
                .map(s => s.trim())
                .filter(Boolean),
              portfolioCompanies: portfolioCompanies
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
            }

      await updateProfile(user.id, { ...sharedUpdates, ...roleUpdates })
      setSuccessMsg('Profile updated successfully!')
    } catch (err) {
      console.error('Failed to update profile', err)
      setErrorMsg('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── Change password handler ────────────────────────────
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.')
      return
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.')
      return
    }
    setSavingPassword(true)
    setErrorMsg('')
    try {
      // Week 3: wire to a real change-password endpoint
      // For now just show success
      setSuccessMsg('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className='space-y-6 animate-fade-in'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Settings</h1>
        <p className='text-gray-600'>
          Manage your account preferences and settings
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        {/* ── Sidebar nav ───────────────────────────────── */}
        <Card className='lg:col-span-1'>
          <CardBody className='p-2'>
            <nav className='space-y-1'>
              {[
                { key: 'profile', label: 'Profile', icon: <User size={18} /> },
                { key: 'security', label: 'Security', icon: <Lock size={18} /> }
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveSection(key as ActiveSection)
                    setSuccessMsg('')
                    setErrorMsg('')
                  }}
                  className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                    activeSection === key
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className='mr-3'>{icon}</span>
                  {label}
                </button>
              ))}

              {/* Non-functional sections (Week 3) */}
              {[
                { label: 'Notifications', icon: <Bell size={18} /> },
                { label: 'Language', icon: <Globe size={18} /> },
                { label: 'Appearance', icon: <Palette size={18} /> },
                { label: 'Billing', icon: <CreditCard size={18} /> }
              ].map(({ label, icon }) => (
                <button
                  key={label}
                  className='flex items-center w-full px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-50 rounded-md cursor-not-allowed'
                >
                  <span className='mr-3'>{icon}</span>
                  {label}
                </button>
              ))}
            </nav>
          </CardBody>
        </Card>

        {/* ── Main content ──────────────────────────────── */}
        <div className='lg:col-span-3 space-y-6'>
          {/* Success / Error messages */}
          {successMsg && (
            <div className='p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm'>
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className='p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm'>
              {errorMsg}
            </div>
          )}

          {/* ── PROFILE SECTION ───────────────────────── */}
          {activeSection === 'profile' && (
            <>
              <Card>
                <CardHeader>
                  <h2 className='text-lg font-medium text-gray-900'>
                    Profile Settings
                  </h2>
                </CardHeader>
                <CardBody className='space-y-6'>
                  {/* Avatar */}
                  <div className='flex items-center gap-6'>
                    <Avatar src={user.avatarUrl} alt={user.name} size='xl' />
                    <div>
                      <Button variant='outline' size='sm'>
                        Change Photo
                      </Button>
                      <p className='mt-2 text-sm text-gray-500'>
                        JPG, GIF or PNG. Max size 800K
                      </p>
                    </div>
                  </div>

                  {/* Shared fields */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <Input
                      label='Full Name'
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                    <Input
                      label='Email'
                      type='email'
                      value={user.email}
                      disabled
                    />
                    <Input label='Role' value={user.role} disabled />
                    <Input
                      label='Location'
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder='e.g. San Francisco, CA'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Bio
                    </label>
                    <textarea
                      className='w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500'
                      rows={4}
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder='Tell others about yourself...'
                    />
                  </div>

                  {/* ── Entrepreneur-specific fields ────── */}
                  {user.role === 'entrepreneur' && (
                    <>
                      <hr className='border-gray-200' />
                      <h3 className='text-md font-medium text-gray-900'>
                        Startup Details
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <Input
                          label='Startup Name'
                          value={startupName}
                          onChange={e => setStartupName(e.target.value)}
                          placeholder='e.g. TechVenture Inc.'
                        />
                        <Input
                          label='Industry'
                          value={industry}
                          onChange={e => setIndustry(e.target.value)}
                          placeholder='e.g. FinTech, HealthTech'
                        />
                        <Input
                          label='Funding Needed'
                          value={fundingNeeded}
                          onChange={e => setFundingNeeded(e.target.value)}
                          placeholder='e.g. $500K'
                        />
                        <Input
                          label='Founded Year'
                          type='number'
                          value={foundedYear}
                          onChange={e => setFoundedYear(e.target.value)}
                          placeholder='e.g. 2021'
                        />
                        <Input
                          label='Team Size'
                          type='number'
                          value={teamSize}
                          onChange={e => setTeamSize(e.target.value)}
                          placeholder='e.g. 5'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Pitch Summary
                        </label>
                        <textarea
                          className='w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500'
                          rows={4}
                          value={pitchSummary}
                          onChange={e => setPitchSummary(e.target.value)}
                          placeholder='Describe your startup and what problem it solves...'
                        />
                      </div>
                    </>
                  )}

                  {/* ── Investor-specific fields ─────────── */}
                  {user.role === 'investor' && (
                    <>
                      <hr className='border-gray-200' />
                      <h3 className='text-md font-medium text-gray-900'>
                        Investment Details
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <Input
                          label='Minimum Investment'
                          value={minimumInvestment}
                          onChange={e => setMinimumInvestment(e.target.value)}
                          placeholder='e.g. $50K'
                        />
                        <Input
                          label='Maximum Investment'
                          value={maximumInvestment}
                          onChange={e => setMaximumInvestment(e.target.value)}
                          placeholder='e.g. $500K'
                        />
                        <Input
                          label='Total Investments Made'
                          type='number'
                          value={totalInvestments}
                          onChange={e => setTotalInvestments(e.target.value)}
                          placeholder='e.g. 12'
                        />
                      </div>
                      <div className='space-y-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Investment Interests
                            <span className='text-gray-400 font-normal ml-1'>
                              (comma separated)
                            </span>
                          </label>
                          <Input
                            value={investmentInterests}
                            onChange={e =>
                              setInvestmentInterests(e.target.value)
                            }
                            placeholder='e.g. SaaS, FinTech, HealthTech'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Investment Stages
                            <span className='text-gray-400 font-normal ml-1'>
                              (comma separated)
                            </span>
                          </label>
                          <Input
                            value={investmentStage}
                            onChange={e => setInvestmentStage(e.target.value)}
                            placeholder='e.g. Pre-seed, Seed, Series A'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Portfolio Companies
                            <span className='text-gray-400 font-normal ml-1'>
                              (comma separated)
                            </span>
                          </label>
                          <Input
                            value={portfolioCompanies}
                            onChange={e =>
                              setPortfolioCompanies(e.target.value)
                            }
                            placeholder='e.g. Acme Corp, TechStart, GreenCo'
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className='flex justify-end gap-3 pt-2'>
                    <Button
                      variant='outline'
                      onClick={() => window.location.reload()}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </>
          )}

          {/* ── SECURITY SECTION ──────────────────────── */}
          {activeSection === 'security' && (
            <Card>
              <CardHeader>
                <h2 className='text-lg font-medium text-gray-900'>
                  Security Settings
                </h2>
              </CardHeader>
              <CardBody className='space-y-6'>
                {/* 2FA Section */}
                <div>
                  <h3 className='text-sm font-medium text-gray-900 mb-4'>
                    Two-Factor Authentication
                  </h3>

                  {otpSuccess ? (
                    <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
                      <p className='text-green-700 font-medium'>
                        ✓ OTP Verified Successfully
                      </p>
                      <p className='text-green-600 text-sm mt-1'>
                        2FA is working correctly on your account.
                      </p>
                    </div>
                  ) : !otpSent ? (
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm text-gray-600'>
                          Add an extra layer of security to your account
                        </p>
                        <Badge variant='error' className='mt-1'>
                          Not Verified
                        </Badge>
                      </div>
                      <Button
                        variant='outline'
                        onClick={handleSendOTP}
                        disabled={otpLoading}
                      >
                        {otpLoading ? 'Sending...' : 'Send OTP to Email'}
                      </Button>
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      <p className='text-sm text-green-600 font-medium'>
                        ✓ OTP sent to your email
                      </p>
                      {otpError && (
                        <p className='text-sm text-red-600'>{otpError}</p>
                      )}
                      <Input
                        label='Enter OTP'
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        placeholder='Enter 6-digit OTP'
                        maxLength={6}
                      />
                      <div className='flex gap-3'>
                        <Button
                          onClick={handleVerifyOTP}
                          disabled={otpLoading || otp.length !== 6}
                        >
                          {otpLoading ? 'Verifying...' : 'Verify OTP'}
                        </Button>
                        <Button
                          variant='outline'
                          onClick={handleSendOTP}
                          disabled={otpLoading}
                        >
                          Resend OTP
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Change Password — existing code stays */}
                <div className='pt-6 border-t border-gray-200'>
                  {/* ... your existing change password JSX ... */}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
