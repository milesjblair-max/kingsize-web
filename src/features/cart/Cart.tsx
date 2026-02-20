export const Cart = () => {
    return (
        <div className="fixed top-20 right-4 w-80 bg-white border shadow-lg p-4 rounded-lg hidden">
            <h3 className="font-bold border-b pb-2 mb-2">My Cart</h3>
            <p className="text-gray-500 text-center py-4">Your bag is empty.</p>
        </div>
    );
};
