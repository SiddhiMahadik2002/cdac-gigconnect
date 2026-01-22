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
import { parseFullName, toFullName } from '../utils/nameMapper.js';
import { COMMON_SKILLS } from '../utils/constants.js';
import styles from './FreelancerProfilePage.module.css';

// Validation schema
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  title: z.string().min(1, 'Professional title is required'),
  bio: z.string().min(50, 'Bio must be at least 50 characters').max(500, 'Bio must be less than 500 characters'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  hourlyRate: z.number().min(5, 'Hourly rate must be at least $5').max(500, 'Hourly rate must be less than $500').optional(),
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
    const loadProfile = async () => {
      try {
        setLoading(true);

        // Initialize with current user data
        const { firstName, lastName } = parseFullName(user?.fullName || '');

        // Mock profile data for demo
        const mockProfile = {
          title: 'Full Stack Developer',
          bio: 'Passionate full-stack developer with 5+ years of experience building web applications. I specialize in React, Node.js, and modern web technologies.',
          skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
          hourlyRate: 45,
          linkedinUrl: '',
          githubUrl: '',
          portfolioUrl: ''
        };

        setValue('firstName', firstName);
        setValue('lastName', lastName);
        setValue('title', mockProfile.title);
        setValue('bio', mockProfile.bio);
        setValue('skills', mockProfile.skills);
        setValue('hourlyRate', mockProfile.hourlyRate);
        setValue('linkedinUrl', mockProfile.linkedinUrl);
        setValue('githubUrl', mockProfile.githubUrl);
        setValue('portfolioUrl', mockProfile.portfolioUrl);

        // Uncomment when API is ready
        // const profile = await getFreelancerProfile(user.id);
        // setValue('title', profile.title || '');
        // setValue('bio', profile.bio || '');
        // setValue('skills', profile.skills || []);
        // setValue('hourlyRate', profile.hourlyRate || '');
        // setValue('linkedinUrl', profile.linkedinUrl || '');
        // setValue('githubUrl', profile.githubUrl || '');
        // setValue('portfolioUrl', profile.portfolioUrl || '');

      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
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
        hourlyRate: data.hourlyRate,
        linkedinUrl: data.linkedinUrl,
        githubUrl: data.githubUrl,
        portfolioUrl: data.portfolioUrl,
      };

      // Update auth context with new name
      const updatedUser = {
        ...user,
        fullName: profileData.fullName
      };
      await login(updatedUser, localStorage.getItem('auth_token'));

      setSuccess('Profile updated successfully!');

      // Uncomment when API is ready
      // await updateFreelancerProfile(profileData);

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
      <div className={styles.header}>
        <h1 className={styles.title}>Freelancer Profile</h1>
        <p className={styles.subtitle}>Complete your profile to attract more clients</p>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {success && (
        <div className={styles.success}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* Personal Information */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Personal Information</h3>

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
            placeholder="e.g., Full Stack Developer, UI/UX Designer, Content Writer"
          />

          <TextArea
            label="Professional Bio"
            required
            {...register('bio')}
            error={errors.bio?.message}
            disabled={saving}
            placeholder="Tell clients about your experience, expertise, and what makes you unique..."
            maxLength={500}
            showCharCount
            size="large"
          />

          <Input
            label="Hourly Rate (USD)"
            type="number"
            {...register('hourlyRate', { valueAsNumber: true })}
            error={errors.hourlyRate?.message}
            disabled={saving}
            placeholder="45"
            min={5}
            max={500}
            helperText="Optional: Set your preferred hourly rate"
          />
        </div>

        {/* Skills */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Skills & Expertise</h3>
          <p className={styles.sectionDescription}>
            Add skills that showcase your expertise
          </p>

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

        {/* Social Links */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Social Links</h3>
          <p className={styles.sectionDescription}>
            Add links to showcase your work and professional presence
          </p>

          <Input
            label="LinkedIn URL"
            type="url"
            {...register('linkedinUrl')}
            error={errors.linkedinUrl?.message}
            disabled={saving}
            placeholder="https://linkedin.com/in/yourprofile"
            icon="🔗"
          />

          <Input
            label="GitHub URL"
            type="url"
            {...register('githubUrl')}
            error={errors.githubUrl?.message}
            disabled={saving}
            placeholder="https://github.com/yourusername"
            icon="💻"
          />

          <Input
            label="Portfolio URL"
            type="url"
            {...register('portfolioUrl')}
            error={errors.portfolioUrl?.message}
            disabled={saving}
            placeholder="https://yourportfolio.com"
            icon="🎨"
          />
        </div>

        <div className={styles.actions}>
          <Button
            type="submit"
            variant="primary"
            loading={saving}
            disabled={saving}
            fullWidth
          >
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FreelancerProfilePage;