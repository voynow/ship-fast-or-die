'use client'

import { Navbar } from '@/app/components/Navbar'
import type { Product } from '@/app/types/product'
import type { RepositoryMetadata } from '@/app/types/repository'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function AddProductContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [repos, setRepos] = useState<RepositoryMetadata[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const token = searchParams.get('token')
    const username = searchParams.get('username')

    useEffect(() => {
        if (!token || !username) {
            router.push('/')
            return
        }

        // Fetch repos and existing products
        Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${username}/repos?access_token=${token}`).then(r => r.json()),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${username}/products`).then(r => r.json())
        ]).then(([reposData, productsData]) => {
            setRepos(reposData)
            setProducts(productsData)
        })
    }, [token, username, router])

    const addProduct = async (repoName: string) => {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${username}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                repo_name: repoName,
                access_token: token
            }),
        })
        const updatedProducts = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${username}/products`).then(r => r.json())
        setProducts(updatedProducts)
    }

    const removeProduct = async (repoName: string) => {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${username}/products/${repoName}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                access_token: token
            }),
        })
        const updatedProducts = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${username}/products`).then(r => r.json())
        setProducts(updatedProducts)
    }

    const isProduct = (repoName: string) => products.some(p => p.name === repoName)

    return (
        <div className="min-h-screen bg-zinc-50">
            <Navbar />
            <main className="px-6 py-24 max-w-5xl mx-auto">
                <header className="mb-32 text-center">
                    <div className="relative z-10">
                        <h1 className="font-mono text-7xl font-black tracking-tighter text-zinc-900">
                            SHIP IT <span className="text-indigo-500">NOW</span>
                        </h1>
                        <p className="mt-6 text-zinc-500 font-mono text-sm tracking-wide">
                            CHOOSE THE REPOSITORIES YOU WANT TO SHOWCASE
                        </p>
                        <div className="mt-8 inline-block px-4 py-2 bg-indigo-50 rounded-lg">
                            <p className="text-xs text-indigo-600 font-mono">
                                Only public repositories will be shown
                            </p>
                        </div>
                    </div>
                </header>

                <div className="space-y-2">
                    {repos.map(repo => (
                        <div
                            key={repo.name}
                            className="flex items-start gap-5 p-5 bg-white rounded-lg border border-zinc-100 
                                     hover:border-indigo-100 hover:bg-white transition-all duration-200"
                        >
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                                    <span className="text-xl text-indigo-300">⚡</span>
                                </div>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="font-mono text-sm text-zinc-900 truncate">
                                    {username}/{repo.name}
                                </h2>
                                {repo.description && (
                                    <p className="text-zinc-500 text-sm mt-1 line-clamp-2 font-light">
                                        {repo.description}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => isProduct(repo.name) ? removeProduct(repo.name) : addProduct(repo.name)}
                                className={`shrink-0 px-4 py-2 font-mono text-xs rounded-lg transition-colors duration-200
                                    ${isProduct(repo.name)
                                        ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                        : 'bg-indigo-50 text-indigo-500 hover:bg-indigo-100'
                                    }`}
                            >
                                {isProduct(repo.name) ? '- REMOVE' : '+ ADD'}
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default function AddProductPage() {
    return (
        <Suspense>
            <AddProductContent />
        </Suspense>
    )
}
