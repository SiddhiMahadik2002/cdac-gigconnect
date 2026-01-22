import React, { useState } from 'react';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import { COMMON_SKILLS } from '../../utils/constants.js';
import { debounce } from '../../utils/nameMapper.js';
import styles from './GigFilters.module.css';

const GigFilters = ({ onFilterChange }) => {
    const [filters, setFilters] = useState({
        search: '',
        skill: '',
        minPrice: '',
        maxPrice: '',
    });

    const debouncedFilterChange = debounce((newFilters) => {
        onFilterChange(newFilters);
    }, 500);

    const handleInputChange = (field, value) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
        debouncedFilterChange(newFilters);
    };

    const handleSkillSelect = (skill) => {
        const newSkill = filters.skill === skill ? '' : skill;
        const newFilters = { ...filters, skill: newSkill };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const clearedFilters = {
            search: '',
            skill: '',
            minPrice: '',
            maxPrice: '',
        };
        setFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    return (
        <div className={styles.filtersContainer}>
            <div className={styles.header}>
                <h3 className={styles.title}>Filters</h3>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="small"
                        onClick={clearFilters}
                    >
                        Clear All
                    </Button>
                )}
            </div>

            <div className={styles.filterGroup}>
                <Input
                    label="Search"
                    type="text"
                    placeholder="Search gigs..."
                    value={filters.search}
                    onChange={(e) => handleInputChange('search', e.target.value)}
                />
            </div>

            <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Skills</label>
                <div className={styles.skillsList}>
                    {COMMON_SKILLS.map((skill) => (
                        <button
                            key={skill}
                            className={`${styles.skillButton} ${filters.skill === skill ? styles.selected : ''
                                }`}
                            onClick={() => handleSkillSelect(skill)}
                        >
                            {skill}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Price Range</label>
                <div className={styles.priceInputs}>
                    <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => handleInputChange('minPrice', e.target.value)}
                        size="small"
                    />
                    <span className={styles.priceConnector}>to</span>
                    <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                        size="small"
                    />
                </div>
            </div>
        </div>
    );
};

export default GigFilters;