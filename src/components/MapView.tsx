import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useData } from "../context/DataContext";
import * as turf from "@turf/turf";

let flag = true;

const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY;
// const MAP_STYLE = `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_API_KEY}`;
// const MAP_STYLE = `https://api.maptiler.com/maps/openstreetmap/style.json?key=${MAPTILER_API_KEY}`;

const MAP_STYLE = flag ? `https://api.maptiler.com/maps/openstreetmap/style.json?key=${MAPTILER_API_KEY}`
                       : `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_API_KEY}`;

interface MapViewProps {
  center: [number, number]; // Center coordinates passed from the parent (App.tsx)
  zoomLevel: number; // Zoom level passed from the parent (App.tsx)
}

export default function MapView({ center, zoomLevel }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const {
    csvData,
    geoJsonData,
    categoryColors,
    experiences,
    selectedCountryOnTable,
    setSelectedCountryOnMap,
  } = useData();
  

  function getSafetyLabel(rating) {

    console.log("Rating: ", rating);

    if (rating == 5) return "Very Safe";
    else if (rating == 4) return "Safe";
    else if (rating == 3) return "Neutral";
    else if (rating == 2) return "Unsafe";
    else return "Very Unsafe";
  }

  useEffect(() => {
    if (map.current && center && zoomLevel) {
      // Use flyTo for smooth animation
      map.current.flyTo({
        center: center,
        zoom: zoomLevel,
        speed: 2.0, // Default speed
        curve: 1, // Smooth curve
        easing(t) {
          return t;
        },
      });
    }
  }, [center, zoomLevel]); // Trigger flyTo whenever center or zoomLevel changes

  useEffect(() => {
    if (!selectedCountryOnTable || !geoJsonData || !map.current) return;

    console.log("Looking for country:", selectedCountryOnTable);

    // Find the country in geoJsonData
    const countryFeature = geoJsonData.features.find(
      (feature) =>
        feature.properties["name:en"].trim().toLowerCase() ===
        selectedCountryOnTable.trim().toLowerCase()
    );

    if (countryFeature) {
      // Get bounding box (minLng, minLat, maxLng, maxLat)
      const bbox = turf.bbox(countryFeature);
      const bounds = new maplibregl.LngLatBounds(
        [bbox[0], bbox[1]],
        [bbox[2], bbox[3]]
      );

      console.log("Zooming to country:", selectedCountryOnTable, bounds);

      // Zoom to country bounds
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 6,
        duration: 1500,
      });

      // Get center of country & show popup (Optional)
    //   const countryCenter = turf.center(countryFeature).geometry.coordinates;
      // new maplibregl.Popup({ offset: 10 })
      //     .setLngLat(countryCenter)
      //     .setHTML(`<strong>${selectedCountry}</strong>`)
      //     .addTo(map.current);
    } else {
      console.warn("Country not found in geoJson:", selectedCountryOnTable);
    }
  }, [selectedCountryOnTable, geoJsonData]);

  useEffect(() => {
    if (
      !mapContainer.current ||
      !geoJsonData ||
      !csvData.length ||
      !Object.keys(categoryColors).length
    )
      return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center, // Center based on the selected location passed as prop
      zoom: zoomLevel, // Zoom level based on the selected location
      minZoom: 2,
      pitch: 0,
      maxPitch: 0,
      dragRotate: false,
    });

    let fillColorExpression = ["match", ["get", "safetyCategory"]];
    Object.entries(categoryColors).forEach(([category, color]) => {
      fillColorExpression.push(category, color);
    });
    fillColorExpression.push("#000");

    map.current.on("load", () => {

      if(flag){
        map.current?.getStyle().layers.forEach((layer) => {
          console.log("Layer ID:", layer.id);
        });
  
        // map.current?.setPaintProperty("Water", "fill-color", "#ececec");
        map.current?.setPaintProperty("Water", "fill-color", "#000000dd");
      }
      

      const updatedGeoJson = { ...geoJsonData };

      //  console.log("MAP: ", map.current.getStyle())
      // map.current.getStyle().layers.forEach(layer => console.log("Layer ID: ",layer.id));

      updatedGeoJson.features.forEach((feature) => {
        const countryName = feature.properties["name:en"];
        feature.properties.safetyCategory =
          csvData
            .find((row) => row.Country.trim() === countryName.trim())
            ?.["Safety Category"].trim() || "Unknown";
      });

      map.current?.addSource("countries", {
        type: "geojson",
        data: updatedGeoJson,
      });

      map.current?.addLayer({
        id: "country-fill",
        type: "fill",
        source: "countries",
        paint: {
          "fill-color": fillColorExpression,
          "fill-opacity": 0.7,
          "fill-outline-color": "#000",
        },
        maxzoom: 5,
      },
      "Country labels" // Place the country fill BELOW country labels. It is possible that you can place tiler layers after custom layers
    );

    if(flag){
      // Add a line layer for thicker borders
      map.current?.addLayer({
        id: "country-outline",
        type: "line",
        source: "countries",
        paint: {
          "line-color": "#000",
          "line-width": 2, // 👈 thickness in pixels
        },
        // maxzoom: 5,
      });
    }

    

      const sortedExperiences = [...experiences].sort(
        (a, b) => b.rating - a.rating
      );

      // _id: string;
      // place: string;
      // rating: string;
      // message: string;
      // tags: string;
      // identity: string;
      // sexualOrientation: string;
      // age: number;
      // resident: string;
      // experienceDate: string;
      // lat: number;
      // lon: number;
      // address: string;

     

      const experienceGeoJson = {
        type: "FeatureCollection",
        features: sortedExperiences.map((exp) => ({
          type: "Feature",
          properties: {
            place: exp.place,
            rating: flag ? exp.rating : getSafetyLabel(exp.rating),
            message: exp.message,
            tags: exp.tags,
            identity: exp.identity,
            sexualOrientation: exp.sexualOrientation,
            age: exp.age,
            resident: exp.resident,
            experienceDate: exp.experienceDate,
            lat: exp.lat,
            lon: exp.lon,
            address: exp.address,
          },
          geometry: {
            type: "Point",
            coordinates: [exp.lon, exp.lat],
          },
        })),
      };
      

      map.current?.addSource("user-experiences", {
        type: "geojson",
        data: experienceGeoJson,
      });


      let activatePoints = true;
      if(activatePoints){
        map.current?.addLayer({
          id: "user-experiences-layer",
          type: "circle",
          source: "user-experiences",
          paint: {
            "circle-radius": 6,
            "circle-color": [
              "match",
              ["get", "rating"],
              "Very Unsafe",
              "#ca0020", // Very Unsafe - Red
              "Unsafe",
              "#f4a582", // Unsafe - Orange
              "Neutral",
              "#f7f7f7", // Neutral - Yellow
              "Safe",
              "#92c5de", // Safe - Light Blue
              "Very Safe",
              "#0571b0", // Very Safe - Dark Blue
              "#888888", // Default color if rating is missing
            ],
            "circle-opacity": 0.8,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#000",
          },
        },
        "Country labels" // Place the country fill BELOW country labels. It is possible that you can place tiler layers after custom layers
      );
      }

      const ratingColorMap: Record<string, string> = {
        "Very Unsafe": "#ca0020",
        "Unsafe": "#f4a582",
        "Neutral": "#f7f7f7",
        "Safe": "#92c5de",
        "Very Safe": "#0571b0",
      };

      map.current?.on("click", "user-experiences-layer", (e) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const rating = feature.properties.rating;
        const ratingColor = ratingColorMap[rating] || "#333"; // fallback color

        if(flag){
          new maplibregl.Popup({ offset: 15 })
          .setLngLat(feature.geometry.coordinates)
          .setHTML(`
            <div style="font-family: sans-serif; min-width: 200px; max-height: 400px; overflow-y: auto;">
              <h3 style="margin: 0 0 5px; font-size: 16px; color: #333;">${feature.properties.place}</h3>
              <div style="font-size: 14px">
                <p>
                  <strong>Rating:</strong>
                  <span style="color: #000; font-weight: bold;">${rating}</span>
                </p>
                <p>${feature.properties.identity}, ${feature.properties.sexualOrientation}, ${feature.properties.resident}</p>
              </div>
              <p style="margin: 5px 0; font-size: 14px;">"${feature.properties.message}"</p>
              <div style="font-size: 13px; color: #555;">
                <p><strong>Tags:</strong> ${feature.properties.tags}</p>
                <p><strong>Age:</strong> ${feature.properties.age}</p>
                <p><strong>Experience Date:</strong> ${feature.properties.experienceDate}</p>
                <p><strong>Address:</strong> ${feature.properties.address}</p>
              </div>
            </div>
          `) .addTo(map.current!);
        }else{
            new maplibregl.Popup({ offset: 15 })
            .setLngLat(feature.geometry.coordinates)
            .setHTML(`
            <strong>${feature.properties.identity}</strong><br>
            ${feature.properties.rating}<br>
            ${feature.properties.message}<br>
            <small>${feature.properties.address}</small>
          `
          ) .addTo(map.current!);
        }

        
          
          // .setHTML(`
          //   <div style="font-family: sans-serif; min-width: 200px;">
          //     <h3 style="margin: 0 0 5px; font-size: 16px; color: #333;">${feature.properties.place}</h3>
          //     <p style="margin: 0; font-size: 14px;">
                
          //     </p>
          //     <div style="font-size: 14px">
          //       <p>
          //         <strong>Rating:</strong>
          //         <span style="color: #000; font-weight: bold;">${rating}</span>
          //       </p>
          //       <p>${feature.properties.identity}, ${feature.properties.sexualOrientation}, ${feature.properties.resident}</p>
          //     </div>
          //     <p style="margin: 5px 0; font-size: 14px;">"${feature.properties.message}"</p>
          //     <div style="font-size: 13px; color: #555;">
          //       <p><strong>Tags:</strong> ${feature.properties.tags}</p>
          //       <p><strong>Age:</strong> ${feature.properties.age}</p>
          //       <p><strong>Experience Date:</strong> ${feature.properties.experienceDate}</p>
          //       <p><strong>Address:</strong> ${feature.properties.address}</p>
          //     </div>
          //   </div>
          // `)
          // .addTo(map.current!);
      });
      // map.current?.on("click", "user-experiences-layer", (e) => {
      //   if (!e.features || e.features.length === 0) return;
      //   const feature = e.features[0];

      //   new maplibregl.Popup({ offset: 15 })
      //     .setLngLat(feature.geometry.coordinates)
      //     .setHTML(
      //       `
      //       <strong>${feature.properties.identity}</strong><br>
      //       ${feature.properties.rating}<br>
      //       ${feature.properties.message}<br>
      //       <small>${feature.properties.address}</small>
      //     `
      //     )
      //     .addTo(map.current!);
      // });

      map.current?.on("click", "country-fill", (e) => {
        if (!e.features || e.features.length === 0) return;

        const clickedCountry = e.features[0].properties["name:en"];
        setSelectedCountryOnMap(clickedCountry);
      });

      if(flag){
        // Change "Country labels" layer styling
        map.current?.setLayoutProperty("Country labels", "text-font", ["Open Sans Bold", "Arial Unicode MS Bold"]);
        map.current?.setLayoutProperty("Country labels", "text-size", 14);

        // Optional: Change text color, halo, etc.
        map.current?.setPaintProperty("Country labels", "text-color", "#222");
        map.current?.setPaintProperty("Country labels", "text-halo-color", "#fff");
        map.current?.setPaintProperty("Country labels", "text-halo-width", 1);
      }

      
    });

    


    return () => map.current?.remove();
  }, [geoJsonData, csvData, categoryColors, experiences]); // Re-render map if center or zoomLevel changes

  return (
    <div
      ref={mapContainer}
      style={{ width: "100vw", height: "100vh", position: "absolute" }}
    />
  );
}

