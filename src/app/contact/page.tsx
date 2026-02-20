"use client";

import { useState, useMemo, useEffect } from "react";
import { Phone, MapPin, Clock, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { STORES_DATA } from "../../utils/postcodes"; // Keeping STORES_DATA but not using POSTCODE_COORDINATES logic
import { HelpTabs } from "@/features/help/HelpTabs";

interface Store {
    name: string;
    state: string;
    address: string;
    phone: string;
    hours: string[];
    mapUrl: string;
    lat: number;
    lng: number;
    distance?: number;
}

// Calculate Haversine distance in km
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export default function ContactPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedState, setSelectedState] = useState<string>("All");
    const [expandedStore, setExpandedStore] = useState<string | null>(null);
    const [userCoords, setUserCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    // Check if search term is a postcode (4 digits)
    const isPostcode = /^\d{4}$/.test(searchTerm);

    const states = ["All", "WA", "QLD", "VIC"];

    // Effect to fetch coordinates when searchTerm looks like a postcode
    useEffect(() => {
        if (!isPostcode) {
            setUserCoords(null);
            return;
        }

        const fetchPostcode = async () => {
            setIsLoadingLocation(true);
            try {
                const response = await fetch(`https://api.zippopotam.us/au/${searchTerm}`);
                if (!response.ok) throw new Error('Postcode not found');

                const data = await response.json();
                if (data.places && data.places.length > 0) {
                    const place = data.places[0];
                    setUserCoords({
                        lat: parseFloat(place.latitude),
                        lng: parseFloat(place.longitude)
                    });
                } else {
                    setUserCoords(null);
                }
            } catch (err) {
                console.error("Error fetching postcode:", err);
                setUserCoords(null);
            } finally {
                setIsLoadingLocation(false);
            }
        };

        // Small debounce to avoid hitting API on every keystroke if they type fast
        const timer = setTimeout(() => {
            fetchPostcode();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, isPostcode]);

    const processedStores = useMemo(() => {
        let storesWithMeta = STORES_DATA.map(store => ({ ...store, distance: undefined as number | undefined }));

        if (userCoords) {
            // Calculate distances
            storesWithMeta = storesWithMeta.map(store => ({
                ...store,
                distance: haversineDistance(
                    userCoords.lat,
                    userCoords.lng,
                    store.lat,
                    store.lng
                )
            }));

            // Sort by distance
            storesWithMeta.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }

        return storesWithMeta.filter(store => {
            if (userCoords) {
                // If location search is active (validated postcode), ignore text matching (show purely by distance)
                return true;
            }

            // Otherwise standard text filter
            const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                store.address.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesState = selectedState === "All" || store.state === selectedState;

            return matchesSearch && matchesState;
        });
    }, [searchTerm, selectedState, userCoords]);

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* 1. Compact Header Block */}
            <div className="bg-white pt-8 pb-0 shadow-sm mb-0">
                <div className="max-w-3xl mx-auto px-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
                    <p className="text-gray-600 mt-2">Find a store near you or get in touch.</p>
                </div>
                <HelpTabs />
            </div>

            <div className="max-w-3xl mx-auto px-4 mt-8">
                {/* 2. Store Search + Filters */}
                <div className="mb-6 space-y-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search suburb or postcode (e.g. 6152)"
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-black focus:border-black outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {isLoadingLocation && (
                            <div className="absolute right-3 top-3 text-gray-400">
                                <Loader2 size={24} className="animate-spin" />
                            </div>
                        )}
                    </div>

                    {!isPostcode && (
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {states.map((state) => (
                                <button
                                    key={state}
                                    onClick={() => setSelectedState(state)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${selectedState === state
                                        ? "bg-black text-white"
                                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                                        }`}
                                >
                                    {state}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 3. Store Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {processedStores.map((store) => (
                        <div key={store.name} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 relative overflow-hidden">
                            {store.distance !== undefined && (
                                <div className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-bl-lg">
                                    {store.distance < 1 ? "< 1 km away" : `${Math.round(store.distance)} km away`}
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-2 pr-20">
                                <h3 className="font-bold text-lg text-gray-900">{store.name}</h3>
                                {store.distance === undefined && (
                                    <span className="bg-gray-100 text-xs font-bold px-2 py-1 rounded text-gray-600">{store.state}</span>
                                )}
                            </div>

                            <a href={`tel:${store.phone.replace(/\D/g, '')}`} className="block text-xl font-bold text-blue-600 mb-3 hover:underline">
                                {store.phone}
                            </a>

                            <a href={store.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-gray-600 text-sm mb-4 hover:text-black">
                                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                                <span>{store.address}</span>
                            </a>

                            {/* Hours Accordion */}
                            <button
                                onClick={() => setExpandedStore(expandedStore === store.name ? null : store.name)}
                                className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4 w-full"
                            >
                                <Clock size={16} />
                                <span>View hours</span>
                                {expandedStore === store.name ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>

                            {expandedStore === store.name && (
                                <div className="bg-gray-50 p-3 rounded mb-4 text-sm text-gray-600 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                    {store.hours.map((hour, idx) => (
                                        <div key={idx}>{hour}</div>
                                    ))}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                <a
                                    href={`tel:${store.phone.replace(/\D/g, '')}`}
                                    className="flex justify-center items-center gap-2 bg-black text-white py-3 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors"
                                >
                                    <Phone size={16} />
                                    Call
                                </a>
                                <a
                                    href={store.mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex justify-center items-center gap-2 bg-gray-100 text-gray-900 py-3 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors border border-gray-200"
                                >
                                    <MapPin size={16} />
                                    Directions
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {processedStores.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p>{isLoadingLocation ? "Locating postcode..." : "No stores found matching your search."}</p>
                        {isPostcode && !isLoadingLocation && (
                            <p className="text-xs mt-2 text-red-400">We couldn't verify that postcode. Please try another.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Trust Footer */}
            <div className="mt-12 text-center border-t border-gray-200 pt-8">
                <p className="text-sm font-bold text-gray-500">Family owned since 1972.</p>
            </div>
        </div>
    );
}
