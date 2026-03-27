import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface CartItem {
    id: number;
    nombre: string;
    precio_venta: number;
    cantidad: number;
    imagen_url?: string | null;
    slug: string;
    marca?: { nombre: string } | null;
    presentacion?: { nombre: string } | null;
    atributos?: Array<{ id: number; nombre: string }> | null;
}

interface Product {
    id: number;
    nombre: string;
    precio_venta: number | string;
    slug: string;
    imagenes_urls?: Array<{ url: string }>;
    media?: Array<{ original_url: string }>;
    marca?: { nombre: string } | null;
    presentacion?: { nombre: string } | null;
    atributos?: Array<{ id: number; nombre: string }> | null;
}

interface CartContextType {
    items: CartItem[];
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    // Initialize cart from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('copo_cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Error parsing cart from localStorage', e);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('copo_cart', JSON.stringify(items));
    }, [items]);

    const addItem = useCallback((product: Product, quantity: number = 1) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);
            if (existingItem) {
                return prevItems.map((item) => (item.id === product.id ? { ...item, cantidad: item.cantidad + quantity } : item));
            }
            return [
                ...prevItems,
                {
                    id: product.id,
                    nombre: product.nombre,
                    precio_venta: Number(product.precio_venta),
                    cantidad: quantity,
                    imagen_url: product.imagenes_urls?.[0]?.url || product.media?.[0]?.original_url || null,
                    slug: product.slug,
                    marca: product.marca,
                    presentacion: product.presentacion,
                    atributos: product.atributos,
                },
            ];
        });
    }, []);

    const removeItem = useCallback((productId: number) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    }, []);

    const updateQuantity = useCallback(
        (productId: number, quantity: number) => {
            if (quantity <= 0) {
                removeItem(productId);
                return;
            }
            setItems((prevItems) => prevItems.map((item) => (item.id === productId ? { ...item, cantidad: quantity } : item)));
        },
        [removeItem],
    );

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.cantidad, 0), [items]);
    const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.precio_venta * item.cantidad, 0), [items]);

    const contextValue = useMemo(
        () => ({ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }),
        [items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal],
    );

    return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
