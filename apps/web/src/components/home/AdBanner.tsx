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

    // If less than 5 banners, show a simpler layout
    if (displayBanners.length < 5) {
        return (
            <div className="w-full mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayBanners.map((banner) => (
                        <BannerItem
                            key={banner._id}
                            banner={banner}
                            className="h-[200px] md:h-[250px]"
                        />
                    ))}
                </div>
            </div>
        );
    }

    // Grid layout for exactly 5 banners
    return (
        <div className="w-full mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 h-auto ">
                {/* Large banner - spans 2 columns and 2 rows */}
                <BannerItem
                    banner={displayBanners[0]}
                    className="col-span-2 row-span-2 h-[510px]"
                />

                {/* Column 2 - Two small banners stacked */}
                <div className="col-span-1 row-span-2 flex flex-col gap-2">
                    <BannerItem
                        banner={displayBanners[1]}
                        className="flex-1 h-[250px]"
                    />
                    <BannerItem
                        banner={displayBanners[2]}
                        className="flex-1 h-[250px]"
                    />
                </div>

                {/* Column 3 - Two small banners stacked */}
                <div className="col-span-1 row-span-2 flex flex-col gap-2">
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
