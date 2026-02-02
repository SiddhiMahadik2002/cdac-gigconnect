import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createGig } from '../api/gig.api.js';
import Input from '../components/common/Input.jsx';
import TextArea from '../components/common/TextArea.jsx';
import Button from '../components/common/Button.jsx';
import { VALIDATION, COMMON_SKILLS } from '../utils/constants.js';
import styles from './CreateGigPage.module.css';

// Validation schema
const createGigSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(VALIDATION.MAX_TITLE_LENGTH, `Title must be less than ${VALIDATION.MAX_TITLE_LENGTH} characters`),
  description: z.string()
    .min(1, 'Description is required')
    .max(VALIDATION.MAX_DESCRIPTION_LENGTH, `Description must be less than ${VALIDATION.MAX_DESCRIPTION_LENGTH} characters`),
  fixedPrice: z.number()
    .min(VALIDATION.MIN_PRICE, `Price must be at least Rs ${VALIDATION.MIN_PRICE}`)
    .max(VALIDATION.MAX_PRICE, `Price must be less than Rs ${VALIDATION.MAX_PRICE}`),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  images: z.array(z.string()).max(3, 'Maximum 3 images allowed').optional(),
});

const CreateGigPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [imageUrls, setImageUrls] = useState(['', '', '']);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createGigSchema),
    defaultValues: {
      title: '',
      description: '',
      fixedPrice: '',
      skills: [],
      images: [],
    },
  });

  const watchedSkills = watch('skills', []);

  const onSubmit = async (data) => {
    setLoading(true);
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

      await createGig(gigData);
      navigate('/freelancer/gigs');
    } catch (err) {
      console.error('Error creating gig:', err);
      setError(
        err.response?.data?.message ||
        'Failed to create gig. Please try again.'
      );
    } finally {
      setLoading(false);
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

  return (
    <div className={styles.createGig}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create New Gig</h1>
        <p className={styles.subtitle}>Share your skills and start earning</p>
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
            disabled={loading}
            placeholder="I will create amazing designs for your business"
          />

          <TextArea
            label="Description"
            required
            {...register('description')}
            error={errors.description?.message}
            disabled={loading}
            placeholder="Describe your service in detail..."
            maxLength={VALIDATION.MAX_DESCRIPTION_LENGTH}
            showCharCount
            size="large"
          />

          <Input
            label="Price (Rs)"
            type="number"
            required
            {...register('fixedPrice', { valueAsNumber: true })}
            error={errors.fixedPrice?.message}
            disabled={loading}
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
              disabled={loading}
              placeholder="Type a skill and press Enter"
            />
            <Button
              type="button"
              variant="outline"
              onClick={addSkill}
              disabled={!skillInput.trim() || loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                disabled={loading}
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
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            Create Gig
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateGigPage;