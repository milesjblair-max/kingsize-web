
interface LatLng {
    lat: number;
    lng: number;
}

// Major Australian postcodes and their coordinates (Center of suburb)
// Focusing on WA, QLD, VIC as per store locations
export const POSTCODE_COORDINATES: Record<string, LatLng> = {
    // WA - Perth & Surrounds
    "6052": { lat: -31.921, lng: 115.875 }, // Inglewood
    "6107": { lat: -32.017, lng: 115.950 }, // Cannington
    "6027": { lat: -31.745, lng: 115.766 }, // Joondalup
    "6000": { lat: -31.952, lng: 115.861 }, // Perth CBD
    "6100": { lat: -31.960, lng: 115.908 }, // Victoria Park
    "6050": { lat: -31.933, lng: 115.882 }, // Mount Lawley
    "6155": { lat: -32.033, lng: 115.918 }, // Canning Vale
    "6025": { lat: -31.815, lng: 115.753 }, // Hillarys
    "6163": { lat: -32.062, lng: 115.776 }, // Fremantle
    "6059": { lat: -31.895, lng: 115.877 }, // Dianella

    // QLD - Brisbane & Surrounds
    "4000": { lat: -27.469, lng: 153.025 }, // Brisbane CBD
    "4122": { lat: -27.561, lng: 153.080 }, // Upper Mt Gravatt
    "4500": { lat: -27.311, lng: 152.986 }, // Strathpine
    "4032": { lat: -27.388, lng: 153.030 }, // Chermside
    "4109": { lat: -27.575, lng: 153.064 }, // Sunnybank
    "4051": { lat: -27.425, lng: 153.003 }, // Alderley
    "4207": { lat: -27.755, lng: 153.208 }, // Loganholme
    "4220": { lat: -28.093, lng: 153.428 }, // Burleigh Heads
    "4503": { lat: -27.271, lng: 153.007 }, // Kallangur

    // VIC - Melbourne & Surrounds
    "3175": { lat: -37.988, lng: 145.214 }, // Dandenong
    "3000": { lat: -37.813, lng: 144.963 }, // Melbourne CBD
    "3130": { lat: -37.819, lng: 145.127 }, // Box Hill
    "3199": { lat: -38.146, lng: 145.143 }, // Frankston
    "3170": { lat: -37.915, lng: 145.163 }, // Mulgrave
    "3150": { lat: -37.887, lng: 145.176 }, // Glen Waverley
    "3029": { lat: -37.839, lng: 144.707 }, // Tarneit (West Melb)
    "3064": { lat: -37.595, lng: 144.925 }, // Craigieburn

    // NSW - Sydney Major (just in case they search from NSW to find nearest)
    "2000": { lat: -33.868, lng: 151.209 }, // Sydney CBD
    "2150": { lat: -33.815, lng: 151.004 }, // Parramatta
    "2250": { lat: -33.435, lng: 151.341 }, // Gosford
    "2750": { lat: -33.746, lng: 150.710 }, // Penrith
};

export const STORES_DATA = [
    {
        name: "Inglewood",
        state: "WA",
        address: "874 Beaufort Street, Inglewood 6052",
        phone: "(08) 9471 4111",
        hours: ["Mon-Sat: 9am-5pm", "Sun: 11am-4pm"],
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Kingsize+Big+%26+Tall+Inglewood",
        lat: -31.921,
        lng: 115.875
    },
    {
        name: "Cannington",
        state: "WA",
        address: "3/1339 Albany Highway, Cannington 6107",
        phone: "(08) 9458 2833",
        hours: ["Mon-Sat: 9am-5pm", "Sun: 11am-4pm"],
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Kingsize+Big+%26+Tall+Cannington",
        lat: -32.017,
        lng: 115.950
    },
    {
        name: "Joondalup",
        state: "WA",
        address: "3/9 Wise Street, Joondalup 6027",
        phone: "(08) 9300 2966",
        hours: ["Mon-Sat: 9am-5pm", "Sun: 11am-4pm"],
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Kingsize+Big+%26+Tall+Joondalup",
        lat: -31.745,
        lng: 115.766
    },
    {
        name: "Brisbane CBD",
        state: "QLD",
        address: "191 George Street, Brisbane 4000",
        phone: "(07) 3229 8228",
        hours: ["Mon-Sat: 9am-5pm", "Sun: Closed"],
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Kingsize+Big+%26+Tall+Brisbane+CBD",
        lat: -27.469,
        lng: 153.025
    },
    {
        name: "Mount Gravatt",
        state: "QLD",
        address: "1511 Logan Road, Upper Mt Gravatt 4122",
        phone: "(07) 3849 1955",
        hours: ["Mon-Sat: 9am-5pm", "Sun: 11am-4pm"],
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Kingsize+Big+%26+Tall+Mount+Gravatt",
        lat: -27.561,
        lng: 153.080
    },
    {
        name: "Strathpine",
        state: "QLD",
        address: "481 Gympie Road, Strathpine 4500",
        phone: "(07) 3205 9947",
        hours: ["Mon-Sat: 9am-5pm", "Sun: Closed"],
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Kingsize+Big+%26+Tall+Strathpine",
        lat: -27.311,
        lng: 152.986
    },
    {
        name: "Dandenong",
        state: "VIC",
        address: "12 McCrae Street, Dandenong 3175",
        phone: "(03) 9794 6766",
        hours: ["Mon-Sat: 9am-5pm", "Sun: 11am-4pm"],
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Kingsize+Big+%26+Tall+Dandenong",
        lat: -37.988,
        lng: 145.214
    }
];
