import React from 'react';
import { elementsData } from './elementsData';
import { categoryColors } from './categoryColors';
import './PeriodicTable.css';

export const PeriodicTable = ({ onElementSelect, selectedElements }) => {
  const handleElementClick = (element) => {
    const updatedElements = selectedElements.includes(element.symbol)
      ? selectedElements.filter(el => el !== element.symbol)
      : [...selectedElements, element.symbol];

    onElementSelect(updatedElements); // Update selected elements
  };

  const isSelected = (symbol) => selectedElements.includes(symbol);

  return (
    <div className="periodic">
      {Array.from({ length: 7 }).map((_, rowIndex) => (
        <div className="periodic-row" key={rowIndex}>
          {Array.from({ length: 18 }).map((_, colIndex) => {
            const element = elementsData.find(
              el => el.row === rowIndex + 1 && el.column === colIndex + 1
            );

            if (element) {
              return (
                <div
                  className={`cell ${isSelected(element.symbol) ? 'selected' : ''} ${categoryColors[element.category]}`}
                  key={colIndex}
                  onClick={() => handleElementClick(element)}
                >
                  <div className="element">
                    <div className="at_num">{element.number}</div>
                    <div className="symbol">{element.symbol}</div>
                    <div className="at_details">
                      {element.name}
                      <br />
                      {element.weight}
                    </div>
                  </div>
                </div>
              );
            } else {
              return <div className="cell" key={colIndex}></div>;
            }
          })}
        </div>
      ))}
    </div>
  );
};
