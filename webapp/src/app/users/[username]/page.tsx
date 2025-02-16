'use client'

import { Navbar } from '@/app/components/Navbar'
import { Product } from '@/app/types/product'
import { User } from '@/app/types/user'
import { use, useEffect, useState } from 'react'

export default function UserPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = use(params)
    const [products, setProducts] = useState<Product[]>([])
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        // Fetch user data
        fetch(`http://localhost:8000/users/${username}`)
            .then(r => r.json())
            .then(setUser)

        // Fetch products
        fetch(`http://localhost:8000/users/${username}/products`)
            .then(r => r.json())
            .then(setProducts)
    }, [username])

    return (
        <>
            <Navbar />
            <div className="p-8 max-w-2xl mx-auto">
                <div className="flex items-center gap-4">
                    {user?.avatar_url && (
                        <img src={user.avatar_url} alt="" className="w-16 h-16 rounded-full" />
                    )}
                    <div>
                        <h1 className="text-xl font-bold">{username}</h1>
                        {user?.bio && <p className="text-gray-600 mt-1">{user.bio}</p>}
                        <div className="flex gap-4 text-sm text-gray-500 mt-2">
                            {user?.location && <span>📍 {user.location}</span>}
                            {user?.twitter_username && (
                                <a
                                    href={`https://twitter.com/${user.twitter_username}`}
                                    className="hover:underline"
                                >
                                    🐦 @{user.twitter_username}
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-lg font-bold">Products</h2>
                    {products.length === 0 ? (
                        <p className="text-gray-500 text-center mt-4">No products yet</p>
                    ) : (
                        <div className="mt-4 space-y-4">
                            {products.map(product => (
                                <div key={product.name} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <a href={product.html_url} className="font-medium hover:underline">{product.name}</a>
                                            {product.description && <p className="text-gray-600 text-sm mt-1">{product.description}</p>}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {product.language && <span>🔨 {product.language}</span>}
                                            <span className="ml-3">⭐ {product.stargazers_count}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
} 