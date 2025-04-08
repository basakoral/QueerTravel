import React, { useState } from "react";

export function ShareExperiencePanel() {
    const [isVisible, setIsVisible] = useState(false);
    const [identity, setIdentity] = useState("");
    const [experience, setExperience] = useState("");
    const [rating, setRating] = useState("3");

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    const handleSubmit = () => {
        console.log({ identity, experience, rating });
        alert("Experience submitted successfully!");
        setIdentity("");
        setExperience("");
        setRating("3");
    };

    return (
        <div className={`fixed inset-0 bg-white shadow-lg p-4 max-w-md mx-auto rounded-lg transition-transform ${isVisible ? "block" : "hidden"}`}>
            <div className="flex justify-between items-center border-b pb-2 mb-3">
                <h5 className="text-center text-lg font-bold">Submit Your Experience</h5>
                <button onClick={toggleVisibility} className="text-xl">−</button>
            </div>

            <div>
                <div className="mb-3">
                    <label className="block font-bold">Identity:</label>
                    <select className="w-full p-2 border rounded" value={identity} onChange={(e) => setIdentity(e.target.value)}>
                        <option value="">Select...</option>
                        <option value="Gay">Gay</option>
                        <option value="Lesbian">Lesbian</option>
                        <option value="Bisexual">Bisexual</option>
                        <option value="Transgender">Transgender</option>
                        <option value="Queer">Queer</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label className="block font-bold">Experience:</label>
                    <textarea
                        className="w-full p-2 border rounded"
                        rows={3}
                        placeholder="Write your experience here..."
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                    ></textarea>
                </div>

                <div className="mb-3">
                    <label className="block font-bold">Safety Score:</label>
                    <select className="w-full p-2 border rounded" value={rating} onChange={(e) => setRating(e.target.value)}>
                        <option value="1">1 - Very Unsafe</option>
                        <option value="2">2 - Unsafe</option>
                        <option value="3">3 - Neutral</option>
                        <option value="4">4 - Safe</option>
                        <option value="5">5 - Very Safe</option>
                    </select>
                </div>

                <button onClick={handleSubmit} className="w-full bg-blue-500 text-white p-2 rounded mt-2">Submit</button>
            </div>
        </div>
    );
}
