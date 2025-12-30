"use client";
import Link from "next/link";

interface Banner {
    _id: string;
    title: string;
    image: string;
    link?: string;
    position: number;
}

interface AdBannerProps {
    banners: Banner[];
}

const BannerItem = ({ banner, className }: { banner: Banner; className?: string }) => {
    const content = (
        <div className={`relative overflow-hidden rounded-lg group ${className}`}>
            <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );

    if (banner.link) {
        // Check if link is external (starts with http:// or https://)
        const isExternal = banner.link.startsWith('http://') || banner.link.startsWith('https://');

        return (
            <Link
                href={banner.link}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className={className}
            >
                {content}
            </Link>
        );
    }

    return content;
};

export default function AdBanner({ banners }: AdBannerProps) {
    if (!banners || banners.length === 0) return null;

    // Ensure we have exactly 5 banners for the grid layout
    const displayBanners = banners.slice(0, 5);

    // If less than 5 banners
    if (displayBanners.length < 5) {
        return (
            <div className="hidden md:block w-full mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayBanners.map((banner, index) => (
                        <BannerItem
                            key={banner._id}
                            banner={banner}
                            className={`aspect-[21/9] md:aspect-auto md:h-[250px] w-full bg-neutral-100 ${index > 0 ? 'hidden md:block' : 'block'}`}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // Grid layout for exactly 5 banners
    return (
        <div className="hidden md:block w-full mb-8">
            <div className="flex flex-col md:grid md:grid-cols-4 gap-2 h-auto">
                {/* First banner - Visible on mobile as a full-width block with aspect ratio, on desktop as a grid span */}
                <BannerItem
                    banner={displayBanners[0]}
                    className="block w-full md:col-span-2 md:row-span-2 aspect-[21/9] md:aspect-auto md:h-[510px] bg-neutral-100"
                />

                {/* Secondary banners - Hidden on mobile, flex row on desktop grid */}
                <div className="hidden md:flex col-span-1 row-span-2 flex-col gap-2">
                    <BannerItem
                        banner={displayBanners[1]}
                        className="flex-1 h-[250px]"
                    />
                    <BannerItem
                        banner={displayBanners[2]}
                        className="flex-1 h-[250px]"
                    />
                </div>

                <div className="hidden md:flex col-span-1 row-span-2 flex-col gap-2">
                    <BannerItem
                        banner={displayBanners[3]}
                        className="flex-1 h-[250px]"
                    />
                    <BannerItem
                        banner={displayBanners[4]}
                        className="flex-1 h-[250px]"
                    />
                </div>
            </div>
        </div>
    );
}
