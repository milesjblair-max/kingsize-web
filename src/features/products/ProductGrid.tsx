import Image from "next/image";

const NEW_ARRIVALS = [
    {
        id: 1,
        name: "NAUPO2434", // Using product code as name initially as per photo name
        brand: "Nautica",
        price: "$99.99",
        image: "/images/new-arrivals/nautica-polo.jpg",
    },
    {
        id: 2,
        name: "KAM300",
        brand: "KAM Jeans",
        price: "$89.99",
        image: "/images/new-arrivals/kam-shorts.jpg",
    },
    {
        id: 3,
        name: "JJ58870",
        brand: "Jack & Jones",
        price: "$49.99",
        image: "/images/new-arrivals/jack-jones-tshirt.jpg",
    },
    {
        id: 4,
        name: "TW4803",
        brand: "Thomas Cook",
        price: "$79.99",
        image: "/images/new-arrivals/tw-polo.jpg",
    }
];

export const ProductGrid = () => {
    return (
        <section className="px-6 py-12 max-w-[1400px] mx-auto">
            <h2 className="text-3xl font-bold mb-8">New Arrivals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {NEW_ARRIVALS.map((product) => (
                    <div key={product.id} className="group cursor-pointer">
                        <div className="relative aspect-[3/4] bg-gray-100 mb-4 overflow-hidden rounded-sm">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            />
                        </div>
                        <h3 className="font-bold text-lg mb-1">{product.brand}</h3>
                        <p className="text-gray-600 text-sm mb-2">{product.name}</p>
                        <p className="font-bold text-gray-900">{product.price}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};
