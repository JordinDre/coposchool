export type SectionType =
    | 'hero_carousel'
    | 'product_carousel'
    | 'double_image_grid'
    | 'triple_image_grid'
    | 'single_image_grid'
    | 'text_banner'
    | 'image_ribbon'
    | 'spacer'
    | 'categories_grid'
    | 'feature_blocks'
    | 'brands_grid'
    | 'testimonials'
    | 'info_section';

export interface HeroCarouselSlide {
    id: number;
    title: string;
    subtitle?: string;
    imageUrl: string;
    buttonText?: string;
    buttonLink?: string;
}

export interface HeroCarouselSettings {
    slides: HeroCarouselSlide[];
}

export interface ProductCarouselSettings {
    title?: string;
    productIds?: number[];
}

export interface ImageGridItem {
    id: string;
    imageUrl: string;
    title?: string;
    link?: string;
}

export interface ImageGridSettings {
    items: ImageGridItem[];
    fullWidth?: boolean;
}

export interface TextBannerSettings {
    text: string;
    backgroundColor: string;
    textColor: string;
    fontSize?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ImageRibbonItem {
    id: string;
    imageUrl: string;
    link?: string;
}

export interface ImageRibbonSettings {
    items: ImageRibbonItem[];
    speed?: number; // duration in seconds
    backgroundColor?: string;
    imageHeight?: number; // in pixels
}

export interface SpacerSettings {
    height: number;
    showLine?: boolean;
    lineColor?: string;
}

export interface CategoriesGridSettings {
    title?: string;
    categoryIds?: number[];
    layout?: 'grid' | 'scroll';
}

export interface FeatureBlock {
    id: string;
    icon: string;
    title: string;
    description: string;
}

export interface FeatureBlocksSettings {
    items: FeatureBlock[];
    columns?: 2 | 3 | 4;
}

export interface BrandsGridSettings {
    title?: string;
    brandIds?: number[];
}

export interface NewsletterSettings {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    placeholder?: string;
    backgroundColor?: string;
    textColor?: string;
}

export interface TestimonialItem {
    id: string;
    name: string;
    role?: string;
    content: string;
    avatarUrl?: string;
    stars?: number;
}

export interface TestimonialsSettings {
    title?: string;
    items: TestimonialItem[];
}

export interface InfoSectionSettings {
    title: string;
    content: string;
    imageUrl: string;
    imagePosition: 'left' | 'right';
    buttonText?: string;
    buttonLink?: string;
    backgroundColor?: string;
}

export type SectionSettings =
    | HeroCarouselSettings
    | ProductCarouselSettings
    | ImageGridSettings
    | TextBannerSettings
    | ImageRibbonSettings
    | SpacerSettings
    | CategoriesGridSettings
    | FeatureBlocksSettings
    | BrandsGridSettings
    | TestimonialsSettings
    | InfoSectionSettings
    | Record<string, unknown>;

export interface Section {
    id: string;
    type: SectionType;
    order: number;
    settings: SectionSettings;
}

export interface Category {
    id: number;
    nombre: string;
    slug?: string;
    icon?: string;
    image_url?: string;
}

export interface Brand {
    id: number;
    nombre: string;
    slug?: string;
    image_url?: string;
    logo_url?: string;
}

export interface Product {
    id: number;
    nombre: string;
    slug: string;
    precio_venta: number | string;
    presentacion?: { nombre: string };
    marca?: { nombre: string };
    categoria?: { nombre: string };
    imagen_url?: string | null;
    imagenes_urls?: Array<{ url: string }>;
    existencia?: number;
    inventarios_sum_cantidad?: number | string | null;
    media?: Array<{ original_url: string }>;
    descripcion?: string;
    descripcion_corta?: string;
    atributos?: Array<{ id: number; nombre: string }>;
}

export interface Company {
    id: number;
    name: string;
    logo_url: string | null;
    currency?: string;
    facebook?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    whatsapp?: string | null;
    telefono?: string | null;
    email?: string | null;
    tiktok?: string | null;
    youtube?: string | null;
    is_ecommerce_active?: boolean;
}

export interface CatalogoConfig {
    mostrar_precio: boolean;
    mostrar_existencia: boolean;
    mostrar_marca: boolean;
    mostrar_categoria: boolean;
    mostrar_atributos: boolean;
    filtro_precio: boolean;
    filtro_categorias: boolean;
    filtro_marcas: boolean;
    filtro_presentaciones: boolean;
    mostrar_solo_existencias: boolean;
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    whatsapp: string | null;
    telefono: string | null;
    email: string | null;
    body_bg_light: string | null;
    body_bg_dark: string | null;
    footer_bg_light: string | null;
    footer_bg_dark: string | null;
    nav_bg_light: string | null;
    nav_bg_dark: string | null;
    header_bg_light: string | null;
    header_bg_dark: string | null;
    header_text_light: string | null;
    header_text_dark: string | null;
    header_font_size: string | null;
    nav_text_light: string | null;
    nav_text_dark: string | null;
    nav_font_size: string | null;
    body_text_light: string | null;
    body_text_dark: string | null;
    body_font_size: string | null;
    footer_text_light: string | null;
    footer_text_dark: string | null;
    footer_font_size: string | null;
    logo_size: string | null;
    footer_logo_size: string | null;
    informacion: string | null;
    primary_color: string | null;
    primary_text_color: string | null;
    secondary_color: string | null;
    tiktok: string | null;
    youtube: string | null;
    nav_categories?: Array<{ id: number; nombre: string }>;
}

export interface Municipio {
    id: number;
    nombre: string;
    departamento_id: number;
}

export interface Departamento {
    id: number;
    nombre: string;
    municipios?: Municipio[];
}

export interface EcommerceConfiguracion {
    id: number;
    diseno_inicio?: unknown;
    metodos_pago_habilitados: string[] | null;
    transferencia_datos: string | null;
    pago_link_datos: string | null;
    bodega_default_id: number | null;
    cuotas_disponibles: string[] | null;
    available_bodegas?: Array<{ id: number; nombre: string; codigo: string }>;
    created_at?: string;
    updated_at?: string;
}
