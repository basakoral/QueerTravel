import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as d3 from "d3";
import Papa from "papaparse";
import * as ss from "simple-statistics";

let flag = true;

const GEOJSON_URL = "/app/data/countries.geojson";
const CSV_URL = "/app/data/safetyData.csv";
// const API_URL = "https://dec.science.uu.nl/api/api/experiences";
const API_URL =  flag ? "https://dec.science.uu.nl/api/api/experiences"
                      : "http://localhost:3000/api/experiences";

interface Experience {
    _id: string;
    place: string;
    rating: string;
    message: string;
    tags: string;
    identity: string;
    sexualOrientation: string;
    age: number;
    resident: string;
    experienceDate: string;
    lat: number;
    lon: number;
    address: string;
}

interface DataContextType {
    csvData: any[];
    geoJsonData: any | null;
    categoryColors: Record<string, string>;
    experiences: Experience[];
    selectedCountryOnTable: string | null;
    weights: Record<string, number>;
    selectedCountryOnMap: string | null;
    setWeights: (weights: Record<string, number> | null) => void;
    setSelectedCountryOnTable: (country: string | null) => void;
    setSelectedCountryOnMap: (country: string | null) => void;
    updateSafetyCategory: (countryName: string, newCategory: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [csvData, setCsvData] = useState<any[]>([]);
    const [geoJsonData, setGeoJsonData] = useState<any | null>(null);
    const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [selectedCountryOnTable, setSelectedCountryOnTable] = useState(null);
    const [selectedCountryOnMap, setSelectedCountryOnMap] = useState(null);
    const [highlightedCountry, setHighlightedCountry] = useState(null); // New state
    const [weights, setWeights] = useState<Record<string, number>>({
        "Non-binary Recognition": 1/11,
        "Marriage Same Sex (Status)": 1/11,
        "Worker Protections": 1/11,
        "Discrimination Protection": 1/11,
        "Violence Criminalization": 1/11,
        "Adoption Recognition": 1/11,
        "Poll Data": 1/11,
        "Transgender Legal Identity Laws": 1/11,
        "Transgender Murder Rates": -1/11,
        "Illegal Same Sex Relationships": 1/11,
        "Propaganda Morality Laws": 1/11
    });


    // Normalize All Columns Except "Total Score"
    const normalizeData = (data: any[]) => {
        if (data.length === 0) return data;

        // console.log("Original Data: ", data);

        // Find numeric columns excluding "Total Score"
        const numericColumns = Object.keys(data[0]).filter(
            (col) => col !== "Total Score" && data.every((row) => !isNaN(parseFloat(row[col])))
        );

        // Compute min-max values for each column
        const minMaxMap: Record<string, { min: number; max: number }> = {};
        numericColumns.forEach((col) => {
            const values = data.map((row) => parseFloat(row[col])).filter((v) => !isNaN(v));
            minMaxMap[col] = { min: Math.min(...values), max: Math.max(...values) };
        });

        // Overwrite each column with its normalized value
        return data.map((row) => {
            const newRow = { ...row };
            numericColumns.forEach((col) => {
                const value = parseFloat(row[col]);
                if (!isNaN(value)) {
                    const { min, max } = minMaxMap[col];
                    newRow[col] = max !== min ? (value - min) / (max - min) : 0;
                }
            });
            return newRow;
        });
    };


    const calculateTotalScore = (data: any[]) => {
        const scoredData = data.map((row) => {
            const newRow = { ...row };
            newRow["Total Score"] = Object.keys(weights).reduce((sum, col) => {
                const normalizedValue = parseFloat(newRow[col] ?? "0"); // Uses normalized values
                return sum + normalizedValue * weights[col];
            }, 0);
            return newRow;
        });
    
        // Find min & max for "Total Score"
        const totalScoreValues = scoredData.map(row => row["Total Score"]);
        const minTotal = Math.min(...totalScoreValues);
        const maxTotal = Math.max(...totalScoreValues);
    
        // Normalize "Total Score" between 0 and 1
        const normalizedScoredData = scoredData.map((row) => {
            const newRow = { ...row };
            newRow["Total Score"] =
                maxTotal !== minTotal ? (row["Total Score"] - minTotal) / (maxTotal - minTotal) : 0;
            return newRow;
        });
    
        // Sort data by "Total Score" in descending order
        const sortedData = normalizedScoredData.sort((a, b) => b["Total Score"] - a["Total Score"]);
    
        return sortedData;
    };
    

    // Compute "Total Score" and Normalize It
    // const calculateTotalScore = (data: any[]) => {
    //     // const weights: Record<string, number> = {
    //     //     "Intersex Recognition": 1,
    //     //     "Marriage Same Sex (Status)": 1,
    //     //     "Worker Protections": 1,
    //     //     "Discrimination Protection": 1,
    //     //     "Violence Criminalization": 1,
    //     //     "Adoption Recognition": 1,
    //     //     // "Poll Data": 2,
    //     //     "Poll Data": 1,
    //     //     "Transgender Legal Identity Laws": 1,
    //     //     "Transgender Murder Rates": -1,
    //     //     "Illegal Same Sex Relationships": 1,
    //     //     "Propaganda Morality Laws": 1
    //     //     // "Transgender Murder Rates": -2,
    //     //     // "Illegal Same Sex Relationships": 2,
    //     //     // "Propaganda Morality Laws": 2
    //     // };

    //     const scoredData = data.map((row) => {
    //         const newRow = { ...row };
    //         newRow["Total Score"] = Object.keys(weights).reduce((sum, col) => {
    //             const normalizedValue = parseFloat(newRow[col] ?? "0"); // Now it directly uses the overwritten values
    //             return sum + normalizedValue * weights[col];
    //         }, 0);
    //         return newRow;
    //     });

    //     // Find min & max for "Total Score"
    //     const totalScoreValues = scoredData.map(row => row["Total Score"]);
    //     const minTotal = Math.min(...totalScoreValues);
    //     const maxTotal = Math.max(...totalScoreValues);

    //     // Normalize "Total Score" between 0 and 1
    //     return scoredData.map((row) => {
    //         const newRow = { ...row };
    //         newRow["Total Score"] =
    //             maxTotal !== minTotal ? (row["Total Score"] - minTotal) / (maxTotal - minTotal) : 0;
    //         return newRow;
    //     });
    // };

    const classifyData = (data: any[], method: string, numCategories: number) => {

        console.log("Classify Data num category method: " + " " + method + " " + numCategories);

        if (data.length === 0) return data;
    
        const scores = data.map(row => row["Total Score"]).sort((a, b) => a - b);
        let breaks: number[] = [];
    
        switch (method) {
            case "equal-interval":
                breaks = equalIntervalBreaks(scores, numCategories);
                break;
            case "quantile":
                breaks = quantileBreaks(scores, numCategories);
                break;
            case "jenks":
                breaks = jenksBreaks(scores, numCategories);
                break;
            case "std-dev":
                breaks = standardDeviationBreaks(scores, numCategories);
                break;
            case "k-means":
                breaks = kMeansBreaks(scores, numCategories);
                break;
            default:
                console.warn("Invalid classification method, defaulting to quantile.");
                breaks = quantileBreaks(scores, numCategories);
        }
    
        // Assign category names based on `numCategories`
        const categoryOptions: Record<number, string[]> = {
            2: ["Safe", "Unsafe"],
            3: ["Safe", "Neutral", "Unsafe"],
            4: ["Very Safe", "Safe", "Unsafe", "Very Unsafe"],
            5: ["Very Safe", "Safe", "Neutral", "Unsafe", "Very Unsafe"],
            6: ["Super Safe", "Very Safe", "Safe", "Unsafe", "Very Unsafe", "Super Unsafe"],
            7: ["Super Safe", "Very Safe", "Safe", "Neutral", "Unsafe", "Very Unsafe", "Super Unsafe"],
        };
    
        const categories = categoryOptions[numCategories] || categoryOptions[5]; // Default to 5 categories

        console.log("Categories: ", categories);
    
        // Assign category to each row
        // const updatedData = data.map(row => {
        //     const score = row["Total Score"];
        //     const categoryIndex = breaks.findIndex(b => score <= b);
        //     return { ...row, "Safety Category": categories[Math.max(0, categoryIndex)] };
        // });

        const updatedData = data.map(row => {
            const score = row["Total Score"];
            
            let categoryIndex = breaks.findIndex(b => score <= b);
            
            // FIX: Ensure categoryIndex is valid
            if (categoryIndex === -1) {
                categoryIndex = breaks.length - 1; // Assign highest category if no match
            }
        
            // FIX: Reverse categories correctly
            categoryIndex = categories.length - 1 - categoryIndex;
        
            return { ...row, "Safety Category": categories[Math.max(0, categoryIndex)] };
        });

        console.log("Updated Data: ", updatedData);
        
        setCsvData(updatedData);
    
        return updatedData; // Return classified data instead of modifying state directly
    };
    

    const equalIntervalBreaks = (scores: number[], numCategories: number): number[] => {
        const min = Math.min(...scores);
        const max = Math.max(...scores);
        const step = (max - min) / numCategories;
        return Array.from({ length: numCategories }, (_, i) => min + step * (i + 1));
    };

    const quantileBreaks = (scores: number[], numCategories: number): number[] => {
        return Array.from({ length: numCategories - 1 }, (_, i) => 
            ss.quantileSorted(scores, (i + 1) / numCategories)
        );
    };
    
    const jenksBreaks = (scores: number[], numCategories: number): number[] => {
        return ss.jenks(scores, numCategories);
    };

    const standardDeviationBreaks = (scores: number[], numCategories: number): number[] => {
        const mean = ss.mean(scores);
        const stdDev = ss.standardDeviation(scores);
        return Array.from({ length: numCategories }, (_, i) => mean + stdDev * (i - numCategories / 2));
    };
    
    const kMeansBreaks = (scores: number[], numCategories: number): number[] => {
        if (!ss.ckmeans || typeof ss.ckmeans !== "function") {
            console.error("Error: ckmeans is not available in simple-statistics");
            return [];
        }
    
        // Ensure scores are sorted
        const sortedScores = scores.slice().sort((a, b) => a - b);
    
        try {
            const clusters = ss.ckmeans(sortedScores, numCategories);
            
            // Use median values instead of the first or last value of each cluster
            return clusters.map(cluster => cluster[Math.floor(cluster.length / 2)]);
        } catch (error) {
            console.error("Error in ckmeans classification:", error);
            return [];
        }
    };
    
    
    
    
    

    // Generate Dynamic `categoryColors` using `d3.schemeRdBu`
    // const generateCategoryColors = (data: any[]) => {
    //     const uniqueCategories = Array.from(new Set(data.map(row => row["Safety Category"])))
    //         .filter(Boolean)
    //         .sort((a, b) => {
    //             // Sorting to ensure: "Very Unsafe" → Red & "Very Safe" → Blue
    //             const order = ["Very Unsafe", "Unsafe", "Neutral", "Safe", "Very Safe"];
    //             return order.indexOf(a) - order.indexOf(b);
    //         });

    //     const colorScale = d3.scaleOrdinal(d3.schemeRdBu[uniqueCategories.length] || d3.schemeRdBu[5]);
    //     return Object.fromEntries(uniqueCategories.map((cat, i) => [cat, colorScale(i)]));
    // };

    useEffect(() => {
        if (csvData.length === 0) return; // Prevents errors if no data is loaded
    
        const uniqueCategories = Array.from(new Set(csvData.map(row => row["Safety Category"])))
            .filter(Boolean)
            .sort((a, b) => {
                const order = ["Super Unsafe","Very Unsafe", "Unsafe", "Neutral", "Safe", "Very Safe", "Super Safe"];
                return order.indexOf(a) - order.indexOf(b);
            });
    
        // Ensures color scale updates based on the number of unique categories
        // const color = uniqueCategories.length > 2 ? d3.schemeRdBu[uniqueCategories.length] : 

        // console.log(d3.schemeRdBu[3].filter(hex => hex !== "#f7f7f7"));
        const colorScale = d3.scaleOrdinal(
            uniqueCategories.length > 2
                ? d3.schemeRdBu[uniqueCategories.length] || d3.schemeRdBu[5] // Ensure it defaults to a valid scheme
                : uniqueCategories.length === 2
                    ? d3.schemeRdBu[3].filter(hex => hex !== "#f7f7f7") // Ensure removal of "neutral" color
                    : ["#f7f7f7"] // Default for 1 category
        );
        

        // const colorScale = d3.scaleOrdinal(uniqueCategories.length === 2 ? 3 : uniqueCategories.length] || d3.schemeRdBu[5]);
    
        const newCategoryColors = Object.fromEntries(uniqueCategories.map((cat, i) => [cat, colorScale(i)]));

        console.log("Updated Category Colors:", newCategoryColors);

        // Updates the state dynamically
        setCategoryColors(Object.fromEntries(uniqueCategories.map((cat, i) => [cat, colorScale(i)])));
    }, [csvData]); // Runs whenever `csvData` updates
    

    // Fetch Data on Mount
    useEffect(() => {
        fetch(CSV_URL)
            .then((res) => res.text())
            .then((csvText) => {
                const { data } = Papa.parse(csvText, { header: true, skipEmptyLines: true });
                const normalizedData = normalizeData(data);
                const updatedData = calculateTotalScore(normalizedData);
                const classifiedData = classifyData(updatedData, "k-means", 5);
                setCsvData(classifiedData);
                // setCategoryColors(generateCategoryColors(classifiedData));
                
            })
            .catch((error) => console.error("Error fetching CSV:", error));
        fetch(API_URL)
            .then(res => res.json())
            .then(data => {
                console.log("Fetched Experiences: ", data);
                setExperiences(data);
            })
            .catch(error => console.error("Error fetching experiences:", error));
       
        fetch(GEOJSON_URL)
            .then((res) => res.json())
            .then(setGeoJsonData)
            .catch((error) => console.error("Error fetching GeoJSON:", error));
    }, []);

    useEffect(() => {
        const updatedData = calculateTotalScore(csvData);
        const classifiedData = classifyData(updatedData, "k-means", 5);
        setCsvData(classifiedData);

    }, [weights])

    // Function to update safety category & keep colors updated
    const updateSafetyCategory = (countryName: string, newCategory: string) => {
        setCsvData((prevData) => {
            const updatedData = prevData.map((row) =>
                row.Country === countryName ? { ...row, "Safety Category": newCategory } : row
            );
            // setCategoryColors(generateCategoryColors(updatedData));  // Update colors dynamically
            return calculateTotalScore(updatedData);
        });
    };

    return (
        <DataContext.Provider value={{ csvData, geoJsonData, categoryColors, experiences, selectedCountryOnMap, selectedCountryOnTable, weights, setWeights, setSelectedCountryOnMap, setSelectedCountryOnTable, updateSafetyCategory, classifyData }}>
            {children}
        </DataContext.Provider>
    );
};


export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
};




