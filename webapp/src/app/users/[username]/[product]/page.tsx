'use client'

import { Navbar } from '@/app/components/Navbar'
import { Product } from '@/app/types/product'
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
        fetch(`http://localhost:8000/users/${username}/products`)
            .then(r => r.json())
            .then(products => {
                const found = products.find((p: Product) => p.name === product)
                setProductData(found || null)
            })
    }, [username, product])

    if (!productData) {
        return (
            <>
                <Navbar />
                <div className="p-8 max-w-2xl mx-auto">
                    <p className="text-gray-500 text-center">Product not found</p>
                </div>
            </>
        )
    }

    return (
        <>
            <Navbar />
            <div className="p-8 max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    {productData.avatar_url && (
                        <img src={productData.avatar_url} alt="" className="w-16 h-16 rounded-full" />
                    )}
                    <div>
                        <h1 className="text-2xl font-bold">
                            {productData.owner}/{productData.name}
                        </h1>
                        {productData.description && (
                            <p className="text-gray-600 mt-2">{productData.description}</p>
                        )}
                        <div className="flex gap-4 text-sm text-gray-500 mt-4">
                            {productData.language && <span>🔨 {productData.language}</span>}
                            <span>⭐ {productData.stargazers_count}</span>
                            <a
                                href={productData.html_url}
                                className="hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View on GitHub →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
} 