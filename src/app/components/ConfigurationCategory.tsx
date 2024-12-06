import React, { useEffect, useRef } from 'react';

interface ConfigurationCategoryProps {
    title: string;
    darkMode: boolean;
    categoryIndex: number;
    children: React.ReactNode;
}

const ConfigurationCategory: React.FC<ConfigurationCategoryProps> = ({ title, darkMode, categoryIndex, children }) => {
    const [categoryOpen, setCategoryOpen] = React.useState(false);
    const categoryContentRef = useRef<HTMLDivElement>(null);

    const toggleCategory = () => {
        setCategoryOpen(!categoryOpen);
    }

    const mode = darkMode ? ' dark' : ' light';
    const notFirstCategory = categoryIndex > 0 ? ' not-first' : '';
    const categoryClass = categoryOpen ? `sidebar-category open${mode}${notFirstCategory}` :
        `sidebar-category${mode}${notFirstCategory}`;
    const categoryTitleClass = `sidebar-category-title${mode}${categoryOpen ? ' open' : ''}`;
    const toggleIndicator = categoryOpen ? '⯅' : '⯆';
    const categoryContentClass = categoryOpen ? `sidebar-category-content open${mode}` : `sidebar-category-content${mode}`;

    return (
        <div className={categoryClass}>
            <div className={categoryTitleClass} onClick={toggleCategory}>
                {title}
                <span>{toggleIndicator}</span>
            </div>
            <div className={categoryContentClass} ref={categoryContentRef}>
                {children}
            </div>
        </div>
    );
}

export default ConfigurationCategory;