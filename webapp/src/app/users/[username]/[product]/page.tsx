'use client'

import { Navbar } from '@/app/components/Navbar'
import { Product } from '@/app/types/product'
import Image from 'next/image'
import { use, useEffect, useState } from 'react'

type Props = {
    params: Promise<{
        username: string
        product: string
    }>
}

export default function ProductPage({ params }: Props) {
    const { username, product } = use(params)
    const [productData, setProductData] = useState<Product | null>(null)

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${username}/products/${product}`)
            .then(async r => {
                const text = await r.text();
                console.log('Raw response text:', text);
                return JSON.parse(text);
            })
            .then(data => {
                console.log('Parsed data:', data);
                setProductData(data);
            })
    }, [username, product])

    if (!productData) {
        return (
            <div className="min-h-screen bg-zinc-50">
                <Navbar />
                <div className="p-8 max-w-2xl mx-auto">
                    <p className="font-mono text-zinc-500 text-center">404_PRODUCT_NOT_FOUND</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <Navbar />
            <main className="px-2 sm:px-6 py-24 max-w-5xl mx-auto">
                {/* Hero Section */}
                <div className="mb-16 text-center">
                    <h1 className="font-mono text-4xl sm:text-6xl font-black tracking-tighter text-zinc-900">
                        {productData.name.toUpperCase()}
                    </h1>
                    {productData.description && (
                        <p className="mt-6 font-mono text-xs sm:text-sm tracking-wide text-zinc-500">
                            {productData.description.toUpperCase()}
                        </p>
                    )}
                </div>

                {/* Main Stats Card */}
                <div className="p-8 bg-white rounded-lg border border-zinc-100">
                    {/* Header with name and github button */}
                    <div className="flex items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="shrink-0">
                                {productData.avatar_url ? (
                                    <Image
                                        src={productData.avatar_url}
                                        alt=""
                                        width={64}
                                        height={64}
                                        className="w-16 h-16 rounded-lg bg-zinc-50 object-cover"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-lg bg-indigo-50 flex items-center justify-center">
                                        <span className="text-2xl text-indigo-300">⚡</span>
                                    </div>
                                )}
                            </div>
                            <h2 className="font-mono text-lg text-zinc-900">
                                {productData.owner}/{productData.name}
                            </h2>
                        </div>
                        <a
                            href={productData.html_url}
                            className="inline-flex items-center gap-2 px-4 py-2 font-mono text-xs bg-zinc-900 text-white hover:bg-zinc-800 transition-colors rounded"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            <span>VIEW ON GITHUB</span>
                        </a>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-12 font-mono">
                        {/* Each stat card gets more compact sizing */}
                        <div className="p-2 sm:p-6 bg-zinc-50 border border-zinc-100">
                            <div className="flex flex-col">
                                <div className="text-[10px] sm:text-sm text-zinc-500 uppercase mb-2 flex items-center gap-1">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 .587l3.668 7.431 8.332 1.21-6.001 5.85 1.416 8.265L12 19.127l-7.417 3.89 1.416-8.265-6.001-5.85 8.332-1.21z" />
                                    </svg>
                                    Stars
                                </div>
                                <div className="text-xl sm:text-4xl font-bold text-zinc-900">{productData.stargazers_count}</div>
                            </div>
                        </div>

                        <div className="p-2 sm:p-6 bg-zinc-50 border border-zinc-100">
                            <div className="flex flex-col">
                                <div className="text-[10px] sm:text-sm text-zinc-500 uppercase mb-2 flex items-center gap-1">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 18.12L9.17 21l.83-3.57-2.67-2.23 3.54-.31L12 12l1.13 2.89 3.54.31-2.67 2.23.83 3.57z" />
                                    </svg>
                                    Language
                                </div>
                                {productData.language && (
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-indigo-500" />
                                        <div className="text-xl sm:text-4xl font-bold text-zinc-900">{productData.language}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="p-2 sm:p-6 bg-zinc-50 border border-zinc-100">
                            <div className="flex flex-col">
                                <div className="text-[10px] sm:text-sm text-zinc-500 uppercase mb-2 flex items-center gap-1">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Created
                                </div>
                                <div className="text-xl sm:text-4xl font-bold text-zinc-900">
                                    {new Date(productData.repo_created_at).toLocaleDateString()}
                                </div>
                                <div className="text-[8px] sm:text-sm text-zinc-500 mt-1">
                                    {new Date(productData.repo_created_at).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>

                        <div className="p-2 sm:p-6 bg-zinc-50 border border-zinc-100">
                            <div className="flex flex-col">
                                <div className="text-xs sm:text-sm text-zinc-500 uppercase mb-2 flex items-center gap-1">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Last Push
                                </div>
                                <div className="text-2xl sm:text-4xl font-bold text-zinc-900">
                                    {new Date(productData.repo_pushed_at).toLocaleDateString()}
                                </div>
                                <div className="text-xs sm:text-sm text-zinc-500 mt-1">
                                    {new Date(productData.repo_pushed_at).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>

                        {/* Files and Score */}
                        <div className="p-2 sm:p-6 bg-zinc-50 border border-zinc-100">
                            <div className="flex flex-col">
                                <div className="text-[10px] sm:text-sm text-zinc-500 uppercase mb-2 flex items-center gap-1">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Files
                                </div>
                                <div className="text-xl sm:text-4xl font-bold text-zinc-900">{productData.num_code_files}</div>
                            </div>
                        </div>

                        <div className="p-2 sm:p-6 bg-zinc-50 border border-zinc-100">
                            <div className="flex flex-col">
                                <div className="text-[10px] sm:text-sm text-zinc-500 uppercase mb-2 flex items-center gap-1">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Velocity Score
                                </div>
                                <div className="text-xl sm:text-4xl font-bold text-zinc-900">
                                    {(() => {
                                        const timeToShip = new Date(productData.repo_pushed_at).getTime() -
                                            new Date(productData.repo_created_at).getTime()
                                        const daysToShip = timeToShip / (1000 * 60 * 60 * 24)
                                        const fileComplexityFactor = productData.num_code_files ? Math.log(productData.num_code_files) : 1
                                        return ((productData.stargazers_count / daysToShip) * (1 / fileComplexityFactor)).toFixed(2)
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Time to Ship - Full Width but Compact */}
                        <div className="col-span-2 p-2 sm:p-6 bg-black text-white">
                            <div className="text-xs sm:text-sm tracking-wider mb-4 sm:mb-6 flex items-center gap-1 sm:gap-2 text-zinc-300">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                TIME_TO_SHIP
                            </div>
                            {(() => {
                                const diff = new Date(productData.repo_pushed_at).getTime() -
                                    new Date(productData.repo_created_at).getTime();
                                const minutes = Math.floor(diff / (1000 * 60));
                                const hours = Math.floor(minutes / 60);
                                const days = Math.floor(hours / 24);
                                const remainingHours = hours % 24;
                                const remainingMinutes = minutes % 60;

                                return (
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="flex flex-col items-center">
                                            <span className="text-4xl sm:text-5xl font-black tracking-tighter">{days}</span>
                                            <span className="text-xs sm:text-sm text-zinc-500 mt-1">DAYS</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-4xl sm:text-5xl font-black tracking-tighter">{remainingHours}</span>
                                            <span className="text-xs sm:text-sm text-zinc-500 mt-1">HOURS</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-4xl sm:text-5xl font-black tracking-tighter">{remainingMinutes}</span>
                                            <span className="text-xs sm:text-sm text-zinc-500 mt-1">MINUTES</span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
} 
