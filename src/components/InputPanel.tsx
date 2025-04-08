import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { Slider } from "@radix-ui/react-slider";

const safetyColors = [
  "#ca0020", // Very Unsafe
  "#f4a582", // Unsafe
  "#f7f7f7", // Neutral
  "#92c5de", // Safe
  "#0571b0", // Very Safe
];

const SafetySlider = ({ value, setValue }) => {
  return (
    <div className="w-full">
      <label className="block mb-2 font-semibold">How safe did you feel?</label>
      {/* <Slider.Root className="SliderRoot" def
       */}

        <Slider/>
      
      {/* <Slider
        className="w-full h-6 flex items-center"
        min={1}
        max={5}
        step={1}
        value={[value]}
        onValueChange={([val]) => setValue(val)}
        style={{ backgroundColor: safetyColors[value - 1], borderRadius: "9999px", padding: "6px" }}
      /> */}
      <div className="flex justify-between text-sm mt-1">
        <span>Very Unsafe</span>
        <span>Unsafe</span>
        <span>Neutral</span>
        <span>Safe</span>
        <span>Very Safe</span>
      </div>
    </div>
  );
};

const ExperienceInput = () => {
  const [gender, setGender] = useState("");
  const [orientation, setOrientation] = useState("");
  const [residency, setResidency] = useState("");
  const [experience, setExperience] = useState("");
  const [safety, setSafety] = useState(3);

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md space-y-4 mt-4 flex flex-col">

      <input
        type="text"
        placeholder="Gender Identity"
        className="w-full p-2 border rounded"
        value={gender}
        onChange={(e) => setGender(e.target.value)}
      />
      <input
        type="text"
        placeholder="Sexual Orientation"
        className="w-full p-2 border rounded"
        value={orientation}
        onChange={(e) => setOrientation(e.target.value)}
      />
      <select
        className="w-full p-2 border rounded"
        value={residency}
        onChange={(e) => setResidency(e.target.value)}
      >
        <option value="">Are you a resident or a past traveler?</option>
        <option value="resident">Resident</option>
        <option value="traveler">Past Traveler</option>
      </select>
      <textarea
        placeholder="Share your experience..."
        className="w-full p-2 border rounded"
        rows={4}
        value={experience}
        onChange={(e) => setExperience(e.target.value)}
      />
      <SafetySlider value={safety} setValue={setSafety} />
    </div>
  );
};

const InputPanel = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-3xl text-blue-600 hover:text-blue-800"
      >
        <FontAwesomeIcon icon={faPlusCircle} />
      </button>
      {open && <ExperienceInput />}
    </div>
  );
};

export default InputPanel;
