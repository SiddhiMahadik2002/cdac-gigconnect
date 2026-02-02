import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext.jsx';
import { updateFreelancerProfile, getFreelancerProfile } from '../api/freelancer.api.js';
import Input from '../components/common/Input.jsx';
import TextArea from '../components/common/TextArea.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import { PersonIcon, FlashIcon, LinkIcon, CodeIcon, BrushIcon, WarningIcon, CheckIcon } from '../components/icons/Icons.jsx';
import { parseFullName, toFullName, formatCurrency } from '../utils/nameMapper.js';
import { COMMON_SKILLS } from '../utils/constants.js';
import styles from './FreelancerProfilePage.module.css';
import { ChartIcon, CloseIcon } from '../components/icons/Icons.jsx';

// Validation schema
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  title: z.string().min(1, 'Professional title is required'),
  bio: z.string().min(50, 'Bio must be at least 50 characters').max(500, 'Bio must be less than 500 characters'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid Portfolio URL').optional().or(z.literal('')),
});

const FreelancerProfilePage = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [profileState, setProfileState] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  const watchedSkills = watch('skills', []);

  useEffect(() => {
    // Derive a robust user id from possible shapes returned by the backend
    const userId = user?.userId ?? user?.id ?? user?.freelancerId ?? user?.sub;

    const loadProfile = async () => {
      try {
        setLoading(true);

        // Initialize with current user data and fetch full freelancer profile
        const { firstName, lastName } = parseFullName(user?.fullName || '');
        setValue('firstName', firstName);
        setValue('lastName', lastName);

        // Fetch the freelancer profile from backend
        const profile = await getFreelancerProfile(userId);

        setValue('title', profile.title || '');
        setValue('bio', profile.description || '');

        // Profile.skills may be a comma-separated string or an array
        let skillsArray = [];
        if (Array.isArray(profile.skills)) {
          skillsArray = profile.skills;
        } else if (typeof profile.skills === 'string') {
          skillsArray = profile.skills.split(',').map(s => s.trim()).filter(Boolean);
        }
        setValue('skills', skillsArray || []);

        setValue('linkedinUrl', profile.linkedin || profile.linkedinUrl || '');
        setValue('githubUrl', profile.github || profile.githubUrl || '');
        setValue('portfolioUrl', profile.portfolio || profile.portfolioUrl || '');

        // Save the raw profile for display (ratings, reviews, earnings)
        setProfileState(profile);

      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadProfile();
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const profileData = {
        fullName: toFullName(data.firstName, data.lastName),
        title: data.title,
        bio: data.bio,
        skills: data.skills,
        linkedinUrl: data.linkedinUrl,
        githubUrl: data.githubUrl,
        portfolioUrl: data.portfolioUrl,
      };

      // Update auth context with new name
      const updatedUser = {
        ...user,
        fullName: profileData.fullName
      };
      // Send update to backend, then update auth context
      await updateFreelancerProfile(profileData);
      await login(updatedUser);

      setSuccess('Profile updated successfully!');

    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !watchedSkills.includes(skillInput.trim())) {
      const newSkills = [...watchedSkills, skillInput.trim()];
      setValue('skills', newSkills);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    const newSkills = watchedSkills.filter(skill => skill !== skillToRemove);
    setValue('skills', newSkills);
  };

  const addCommonSkill = (skill) => {
    if (!watchedSkills.includes(skill)) {
      const newSkills = [...watchedSkills, skill];
      setValue('skills', newSkills);
    }
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  if (loading) {
    return <Loader centered fullHeight text="Loading profile..." />;
  }

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileContainer}>
        {/* Profile Header */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <span className={styles.avatarText}>
                {user?.fullName?.charAt(0)?.toUpperCase() || 'F'}
              </span>
            </div>
            <div className={styles.profileInfo}>
              <h1 className={styles.profileName}>{user?.fullName || 'Freelancer'}</h1>
              <p className={styles.profileEmail}>{user?.email}</p>
            </div>
          </div>

          <div className={styles.profileStats}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{profileState?.averageRating ?? '—'}</div>
              <div className={styles.statLabel}>Rating</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{profileState?.ratingCount ?? (profileState?.recentReviews?.length ?? 0)}</div>
              <div className={styles.statLabel}>Reviews</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{formatCurrency(profileState?.totalEarnings || 0)}</div>
              <div className={styles.statLabel}>Earned</div>
            </div>
          </div>
        </div>

        {error && (
          <div className={styles.alert + ' ' + styles.error}>
            <span className={styles.alertIcon}><WarningIcon /></span>
            {error}
          </div>
        )}

        {success && (
          <div className={styles.alert + ' ' + styles.success}>
            <span className={styles.alertIcon}><CheckIcon /></span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGrid}>
            {/* Left Column */}
            <div className={styles.formColumn}>
              {/* Personal Information */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionIcon}><PersonIcon /></div>
                  <div>
                    <h3 className={styles.sectionTitle}>Personal Information</h3>
                    <p className={styles.sectionDescription}>Your basic profile details</p>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <Input
                    label="First Name"
                    type="text"
                    required
                    {...register('firstName')}
                    error={errors.firstName?.message}
                    disabled={saving}
                  />
                  <Input
                    label="Last Name"
                    type="text"
                    required
                    {...register('lastName')}
                    error={errors.lastName?.message}
                    disabled={saving}
                  />
                </div>

                <Input
                  label="Professional Title"
                  type="text"
                  required
                  {...register('title')}
                  error={errors.title?.message}
                  disabled={saving}
                  placeholder="e.g., Full Stack Developer, UI/UX Designer"
                />

                <TextArea
                  label="Professional Bio"
                  required
                  {...register('bio')}
                  error={errors.bio?.message}
                  disabled={saving}
                  placeholder="Tell clients about your experience and expertise..."
                  maxLength={500}
                  showCharCount
                  size="large"
                />

                {/* Hourly rate removed - feature not needed */}
              </div>

              {/* Skills */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionIcon}><FlashIcon /></div>
                  <div>
                    <h3 className={styles.sectionTitle}>Skills & Expertise</h3>
                    <p className={styles.sectionDescription}>Showcase what you're great at</p>
                  </div>
                </div>

                <div className={styles.skillInput}>
                  <Input
                    label="Add Skills"
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleSkillKeyPress}
                    disabled={saving}
                    placeholder="Type a skill and press Enter"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSkill}
                    disabled={!skillInput.trim() || saving}
                  >
                    Add
                  </Button>
                </div>

                {watchedSkills.length > 0 && (
                  <div className={styles.skillTags}>
                    {watchedSkills.map((skill, index) => (
                      <div key={index} className={styles.skillTag}>
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className={styles.removeSkill}
                          disabled={saving}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.commonSkills}>
                  <p className={styles.commonSkillsLabel}>Popular skills:</p>
                  <div className={styles.commonSkillsList}>
                    {COMMON_SKILLS.filter(skill => !watchedSkills.includes(skill))
                      .slice(0, 8).map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          className={styles.commonSkillButton}
                          onClick={() => addCommonSkill(skill)}
                          disabled={saving}
                        >
                          + {skill}
                        </button>
                      ))}
                  </div>
                </div>

                {errors.skills && (
                  <div className={styles.fieldError}>
                    {errors.skills.message}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className={styles.formColumn}>
              {/* Social Links */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionIcon}><LinkIcon /></div>
                  <div>
                    <h3 className={styles.sectionTitle}>Social Links</h3>
                    <p className={styles.sectionDescription}>Connect your professional profiles</p>
                  </div>
                </div>

                <Input
                  label="LinkedIn URL"
                  type="url"
                  {...register('linkedinUrl')}
                  error={errors.linkedinUrl?.message}
                  disabled={saving}
                  placeholder="https://linkedin.com/in/yourprofile"
                  icon={<LinkIcon />}
                />

                <Input
                  label="GitHub URL"
                  type="url"
                  {...register('githubUrl')}
                  error={errors.githubUrl?.message}
                  disabled={saving}
                  placeholder="https://github.com/yourusername"
                  icon={<CodeIcon />}
                />

                <Input
                  label="Portfolio URL"
                  type="url"
                  {...register('portfolioUrl')}
                  error={errors.portfolioUrl?.message}
                  disabled={saving}
                  placeholder="https://yourportfolio.com"
                  icon={<BrushIcon />}
                />
              </div>


            </div>
          </div>

          <div className={styles.actions}>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              disabled={saving}
              fullWidth
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FreelancerProfilePage;