import React from 'react';

interface ConfigurationCategoryProps {
    title: String;
    darkMode: boolean;
    categoryOpen: boolean;
    // children: React.ReactNode;
}

const ConfigurationCategory: React.FC<ConfigurationCategoryProps> = ({ title, darkMode, categoryOpen }) => {
    const mode = darkMode ? ' dark' : ' light';
    const categoryClass = categoryOpen ? `sidebar-category open${mode}` : `sidebar-category${mode}`;
    const categoryHeadingClass = `sidebar-category-heading${mode}`;
    const categoryContentClass = categoryOpen ? `sidebar-category-container open${mode}` : `sidebar-category-container${mode}`;
    return (
        <div className={categoryClass}>
            <div className={categoryHeadingClass}>
                <h1>{title}</h1>
                <span>Toogle icon</span>
            </div>
            <div className={categoryContentClass}>
                {/* {children} */}
                <p>child 1</p>
                <p>child 2</p>
                <p>child 3</p>
            </div>
        </div>
    );
}

export default ConfigurationCategory;