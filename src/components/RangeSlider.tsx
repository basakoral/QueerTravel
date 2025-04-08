// import { useData } from "../context/DataContext";
// import React, { useState, useEffect } from "react";

// export default function RangeSlider({ header }) {
//   const { weights, setWeights } = useData(); // Global state
//   const [sliderWeight, setSliderWeight] = useState(weights[header] * 100 || 50); // Initialize from context

//   useEffect(() => {
//     setSliderWeight(weights[header] * 100); // Sync local state when weights change
//   }, [weights, header]);

//   const handleWeightChange = (e) => {
//     const newSliderValue = +e.target.value; // Get new slider value
//     setSliderWeight(newSliderValue); // Update local state first

//     setWeights((prevWeights) => {
//       const sum = Object.values(prevWeights).reduce((acc, current) => acc + current, 0);

//       return {
//         ...prevWeights,
//         [header]: header === "Transgender Murder Rates"
//           ? -1 * newSliderValue / sum
//           : newSliderValue / sum,
//       };
//     });

//     console.log("Updated Weights:", weights);
//   };

//   return (
//     <div className="flex flex-col items-center gap-2">
//       <input
//         type="range"
//         id={`weight-${header}`}
//         name={`weight-${header}`}
//         min="0"
//         max="100"
//         value={sliderWeight} // Correctly linked to state
//         onChange={handleWeightChange} // Runs inside an event handler
//         style={{ width: "50px" }}
//       />
//       <label htmlFor={`weight-${header}`} className="text-lg font-medium" style={{ fontSize: "10px" }}>
//         {sliderWeight}
//       </label>
//     </div>
//   );
// }

import { useData } from "../context/DataContext";
import React, { useState } from "react";

export default function RangeSlider({ header }) {
  const { weights, setWeights } = useData(); // Get global weights from context
  const [sliderWeight, setSliderWeights] = useState<Record<string, number>>({
    "Non-binary Recognition": 50,
    "Marriage Same Sex (Status)": 50,
    "Worker Protections": 50,
    "Discrimination Protection": 50,
    "Violence Criminalization": 50,
    "Adoption Recognition": 50,
    "Poll Data": 50,
    "Transgender Legal Identity Laws": 50,
    "Transgender Murder Rates": 50,
    "Illegal Same Sex Relationships": 50,
    "Propaganda Morality Laws": 50
 });


 const handleSliderChange = (header: string, value: number) => {
  setSliderValues((prev) => ({ ...prev, [header]: value }));
};

 const handleWeightChange = (e) => {
    const newSliderValue = +e.target.value;

    // Update the local slider state
    setSliderWeights((prevWeights) => ({
      ...prevWeights,
      [header]: newSliderValue, // Update only the relevant weight
    }));

    console.log("Updated Slider Weight:", newSliderValue);

    // Calculate sum AFTER updating slider state
    setSliderWeights((prevSliderWeight) => {
      let sum = Object.values(prevSliderWeight).reduce((acc, current) => acc + current, 0);

      setWeights((prevWeights) => {
        const newWeight = header === "Transgender Murder Rates" 
          ? -1 * newSliderValue / sum 
          : newSliderValue / sum;

        console.log("New Weights:", { ...prevWeights, [header]: newWeight });

        return { 
          ...prevWeights, 
          [header]: newWeight 
        };
      });

      return prevSliderWeight;
    });
};


  return (
    <div className="flex flex-col items-center gap-2">
      <input
        type="range"
        id={"weight-" + header}
        name={"weight-" + header}
        min="0"
        max="100"
        // value={Math.abs(weights[header]) * 100} // Convert back to 0-100 range
        value = {sliderWeight[header]}
        onChange={handleWeightChange} // Call update function on change
        style={{ width: "50px" }} // Adjust width as needed
      />
      <label
        htmlFor={"weight-" + header}
        className="text-lg font-medium"
        style={{ fontSize: "10px" }}
      >
        {sliderWeight[header]} 
      </label>
    </div>
  );
}
