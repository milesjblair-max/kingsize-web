import { api } from "./api";

export const catalogueService = {
    getProducts: async () => {
        return api.get("/products");
    },
    getProductById: async (id: string) => {
        return api.get(`/products/${id}`);
    },
};
