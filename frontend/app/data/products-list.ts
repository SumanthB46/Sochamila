export const PRODUCT_DETAILS = {
  1: {
    id: 1,
    title: "Men's Premium Hoodie",
    basePrice: 34.99,
    description: "High-quality hoodie perfect for custom printing or embroidery.",
    
    // Used to display color circles and mockup per color
    colors: [
      {
        name: "Sand",
        hex: "#e8e0d3",
        img: "/mockups/hoodie-sand.png",
      },
      {
        name: "Black",
        hex: "#000000",
        img: "/mockups/hoodie-black.png",
      },
      {
        name: "Gray",
        hex: "#cccccc",
        img: "/mockups/hoodie-gray.png",
      },
      {
        name: "Red",
        hex: "#e63946",
        img: "/mockups/hoodie-red.png",
      },
      {
        name: "Green",
        hex: "#2a9d8f",
        img: "/mockups/hoodie-green.png",
      },
    ],

    // Used for gallery previews on left side
    gallery: [
      "/mockups/hoodie-front.png",
      "/mockups/hoodie-back.png",
      "/mockups/hoodie-left.png",
      "/mockups/hoodie-right.png",
    ],

    // Sizes
    sizes: ["S", "M", "L", "XL", "2XL"],
  },

  2: {
    id: 2,
    title: "Men's Classic T-Shirt",
    basePrice: 19.99,
    description: "Soft cotton tee perfect for any custom graphic design.",

    colors: [
      { name: "White", hex: "#ffffff", img: "/mockups/tshirt-white.png" },
      { name: "Black", hex: "#000000", img: "/mockups/tshirt-black.png" },
      { name: "Blue", hex: "#1e40af", img: "/mockups/tshirt-blue.png" },
      { name: "Green", hex: "#16a34a", img: "/mockups/tshirt-green.png" },
    ],

    gallery: [
      "/mockups/tshirt-front.png",
      "/mockups/tshirt-back.png",
      "/mockups/tshirt-left.png",
      "/mockups/tshirt-right.png",
    ],

    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
  },
};
