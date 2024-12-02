import React, { useState, useEffect, useRef } from 'react';
import OCPNConfig from '../utils/classes/OCPNConfig';

import './DraggableListButton.css';

interface DraggableListButtonProps {
    buttonLabel: string;
    darkMode: boolean;
    userConfig: OCPNConfig;
    setChange: (change: boolean) => void;
}

const DraggableListButton: React.FC<DraggableListButtonProps> = ({ buttonLabel, darkMode, userConfig, setChange }) => {
    const mode = darkMode ? ' dark' : ' light';
    const [listOpen, setListOpen] = useState(false);
    const listRef = useRef<HTMLUListElement>(null);
    const [draggedItem, setDraggedItem] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!(event.target as HTMLElement).closest('.draggable-list-container')) {
                setListOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const list = listRef.current;
        if (!list) return;

        const handleDragStart = (e: DragEvent) => {
            const target = e.target as HTMLElement;
            setDraggedItem(target);
            target.classList.add('dragging');
        };

        const handleDragEnd = (e: DragEvent) => {
            const target = e.target as HTMLElement;
            target.classList.remove('dragging');
            setDraggedItem(null);

            // Update userConfig.objectCentrality based on the new order
            const newOrder = Array.from(list.children).map((child, index) => ({
                objectType: child.textContent || '',
                index
            }));

            const newObjectCentrality: { [key: string]: number } = {};
            newOrder.forEach(item => {
                newObjectCentrality[item.objectType] = item.index;
            });

            userConfig.objectCentrality = newObjectCentrality;
            console.log(userConfig.objectCentrality);
            setChange(true);
        };

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(list, e.clientY);
            if (draggedItem) {
                if (afterElement == null) {
                    list.appendChild(draggedItem);
                } else {
                    list.insertBefore(draggedItem, afterElement);
                }
            }
        };

        const getDragAfterElement = (container: HTMLElement, y: number) => {
            const draggableElements = Array.from(container.querySelectorAll<HTMLElement>('li:not(.dragging)'));

            return draggableElements.reduce(
                (closest, child) => {
                    const box = child.getBoundingClientRect();
                    const offset = y - box.top - box.height / 2;
                    if (offset < 0 && offset > closest.offset) {
                        return { offset: offset, element: child };
                    } else {
                        return closest;
                    }
                },
                { offset: Number.NEGATIVE_INFINITY, element: null as HTMLElement | null }
            ).element;
        };

        list.addEventListener('dragstart', handleDragStart);
        list.addEventListener('dragend', handleDragEnd);
        list.addEventListener('dragover', handleDragOver);

        return () => {
            list.removeEventListener('dragstart', handleDragStart);
            list.removeEventListener('dragend', handleDragEnd);
            list.removeEventListener('dragover', handleDragOver);
        };
    }, [draggedItem, userConfig, setChange]);

    return (
        <div className="draggable-list-container">
            <button
                className={`draggable-list-button${mode}`}
                onClick={() => setListOpen(!listOpen)}
            >
                {buttonLabel}
            </button>
            <ul id="sortable-list" ref={listRef} className={`draggable-list${mode}${listOpen ? ' open' : ''}`}>
                <li className={`list-item-left${mode}`}>Left to</li>
                {userConfig.includedObjectTypes.map((objectType, index) => (
                    <li key={index} className={`draggable-list-item${mode}`} draggable>
                        {objectType}
                    </li>
                ))}
                <li className={`list-item-right${mode}`}>Right</li>
            </ul>
        </div>
    );
}

export default DraggableListButton;