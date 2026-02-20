import { api } from "./api";

export const cmsService = {
    getHomepageLayout: async () => {
        // In a real app, this would return the order of components
        // e.g., ['hero', 'new-arrivals', 'recommendations']
        return api.get("/cms/homepage");
    },
};
