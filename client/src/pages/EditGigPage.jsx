import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getGigById, updateGig } from '../api/gig.api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Input from '../components/common/Input.jsx';
import TextArea from '../components/common/TextArea.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import { VALIDATION, COMMON_SKILLS } from '../utils/constants.js';
import styles from './CreateGigPage.module.css';

// Validation schema
const editGigSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(VALIDATION.MAX_TITLE_LENGTH, `Title must be less than ${VALIDATION.MAX_TITLE_LENGTH} characters`),
  description: z.string()
    .min(1, 'Description is required')
    .max(VALIDATION.MAX_DESCRIPTION_LENGTH, `Description must be less than ${VALIDATION.MAX_DESCRIPTION_LENGTH} characters`),
  fixedPrice: z.number()
    .min(VALIDATION.MIN_PRICE, `Price must be at least $${VALIDATION.MIN_PRICE}`)
    .max(VALIDATION.MAX_PRICE, `Price must be less than $${VALIDATION.MAX_PRICE}`),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  images: z.array(z.string()).max(3, 'Maximum 3 images allowed').optional(),
});

const EditGigPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [imageUrls, setImageUrls] = useState(['']);
  const [gig, setGig] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editGigSchema),
  });

  const watchedSkills = watch('skills', []);

  // Load existing gig data
  useEffect(() => {
    const fetchGig = async () => {
      try {
        setLoading(true);
        setError('');

        const gigData = await getGigById(id);

        // Check if user owns this gig
        if (gigData.freelancerId !== user.id) {
          setError('You can only edit your own gigs');
          return;
        }

        setGig(gigData);

        // Populate form with existing data
        setValue('title', gigData.title);
        setValue('description', gigData.description);
        setValue('fixedPrice', gigData.fixedPrice);

        // Convert skills string to array
        const skillsArray = gigData.skills ? gigData.skills.split(',').map(s => s.trim()).filter(s => s) : [];
        setValue('skills', skillsArray);
        setValue('images', gigData.images || []);

        // Set image URLs for editing
        setImageUrls(
          gigData.images && gigData.images.length > 0
            ? [...gigData.images, ...Array(3 - gigData.images.length).fill('')].slice(0, 3)
            : ['', '', '']
        );

      } catch (err) {
        console.error('Error fetching gig:', err);
        setError('Failed to load gig data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id && user?.id) {
      fetchGig();
    }
  }, [id, user?.id, setValue]);

  const onSubmit = async (data) => {
    setSaving(true);
    setError('');

    try {
      // Filter out empty image URLs
      const validImages = imageUrls.filter(url => url.trim() !== '');

      const gigData = {
        title: data.title,
        description: data.description,
        fixedPrice: data.fixedPrice,
        skills: data.skills.join(', '), // Convert array to comma-separated string
        images: validImages,
      };

      await updateGig(id, gigData);
      navigate('/freelancer/gigs');
    } catch (err) {
      console.error('Error updating gig:', err);
      setError(
        err.response?.data?.message ||
        'Failed to update gig. Please try again.'
      );
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

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const addCommonSkill = (skill) => {
    if (!watchedSkills.includes(skill)) {
      const newSkills = [...watchedSkills, skill];
      setValue('skills', newSkills);
    }
  };

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);

    // Update form value
    const validUrls = newImageUrls.filter(url => url.trim() !== '');
    setValue('images', validUrls);
  };

  if (loading) {
    return <Loader centered fullHeight text="Loading gig..." />;
  }

  if (error && !gig) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error Loading Gig</h2>
        <p>{error}</p>
        <Button onClick={() => navigate('/freelancer/gigs')}>
          Back to My Gigs
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.createGig}>
      <div className={styles.header}>
        <h1 className={styles.title}>Edit Gig</h1>
        <p className={styles.subtitle}>Update your service details</p>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Basic Information</h3>

          <Input
            label="Gig Title"
            type="text"
            required
            {...register('title')}
            error={errors.title?.message}
            disabled={saving}
            placeholder="I will create amazing designs for your business"
          />

          <TextArea
            label="Description"
            required
            {...register('description')}
            error={errors.description?.message}
            disabled={saving}
            placeholder="Describe your service in detail..."
            maxLength={VALIDATION.MAX_DESCRIPTION_LENGTH}
            showCharCount
            size="large"
          />

          <Input
            label="Price (USD)"
            type="number"
            required
            {...register('fixedPrice', { valueAsNumber: true })}
            error={errors.fixedPrice?.message}
            disabled={saving}
            placeholder="50"
            min={VALIDATION.MIN_PRICE}
            max={VALIDATION.MAX_PRICE}
          />
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Skills</h3>
          <p className={styles.sectionDescription}>
            Add skills that relate to your gig
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

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Images (Optional)</h3>
          <p className={styles.sectionDescription}>
            Add up to 3 images to showcase your work
          </p>

          <div className={styles.imageInputs}>
            {imageUrls.map((url, index) => (
              <Input
                key={index}
                label={`Image ${index + 1} URL`}
                type="url"
                value={url}
                onChange={(e) => handleImageUrlChange(index, e.target.value)}
                disabled={saving}
                placeholder="https://example.com/image.jpg"
              />
            ))}
          </div>

          {errors.images && (
            <div className={styles.fieldError}>
              {errors.images.message}
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/freelancer/gigs')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={saving}
            disabled={saving}
          >
            Update Gig
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditGigPage;