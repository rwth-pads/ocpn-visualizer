import React from 'react';

interface ConfigurationCategoryProps {
    title: String;
    darkMode: boolean;
    categoryIndex: number;
    // categoryOpen: boolean;
    // children: React.ReactNode;
}

const ConfigurationCategory: React.FC<ConfigurationCategoryProps> = ({ title, darkMode, categoryIndex }) => {
    const [categoryOpen, setCategoryOpen] = React.useState(false);

    const toggleCategory = () => {
        setCategoryOpen(!categoryOpen);
        // Set the max-height to animate the opening and closing of the category.
        const categoryContent = document.getElementsByClassName('sidebar-category-content')[categoryIndex] as HTMLElement;
        if (categoryContent.style.maxHeight) {
            categoryContent.style.maxHeight = '';
        } else {
            categoryContent.style.maxHeight = categoryContent.scrollHeight + 'px';
        }
    }

    const mode = darkMode ? ' dark' : ' light';
    const notFirstCategory = categoryIndex > 0 ? ' not-first' : '';
    const categoryClass = categoryOpen ? `sidebar-category open${mode}${notFirstCategory}` :
        `sidebar-category${mode}${notFirstCategory}`;
    const categoryTitleClass = `sidebar-category-title${mode}`; // Use Unicode characters for chevron-right and chevron-down
    const toggleIndicator = categoryOpen ? '-' : '+';
    const categoryContentClass = categoryOpen ? `sidebar-category-content open${mode}` : `sidebar-category-content${mode}`;

    return (
        <div className={categoryClass}>
            <div className={categoryTitleClass} onClick={toggleCategory}>
                <h1>{title}</h1>
                <span style={{ userSelect: 'none' }}>{toggleIndicator}</span> {/*&gt; */}
            </div>
            <div className={categoryContentClass}>
                {/* {children} */}
                {(categoryIndex === 0) &&
                    <div style={{ paddingLeft: '4%' }}>
                        <div>Included object types</div>
                        <div>Sources and sinks</div>
                        <div>type to color mapping</div>
                    </div>
                }
                {(categoryIndex === 1) &&
                    <div style={{ paddingLeft: '4%' }}>
                        <div>flow direction</div>
                        <div>objectCentrality</div>
                        <div>objectAttraction rangeMin rangeMax</div>
                        <div>maxBarycenterIterations</div>
                    </div>
                }
                {(categoryIndex === 2) &&
                    <div style={{ paddingLeft: '4%' }}>
                        <div>placeRadius transitionWidth (custom width) transitionHeight</div>
                        <div>dummySize ??</div>
                        <div>layerSep vertexSep</div>
                        <div>borderPaddingX / Y ???</div>
                        <div>default place, transition fill and stroke colors</div>
                        <div>transitionBorder size, arc size, arrowHeadSize, arcDefault color</div>
                    </div>
                }
            </div>
        </div>
    );
}

export default ConfigurationCategory;