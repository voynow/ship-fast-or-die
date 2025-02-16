'use client'

import { use, useEffect, useState } from 'react'

type User = {
    username: string
    access_token: string
    bio: string | null
    location: string | null
    twitter_username: string | null
    avatar_url: string | null
    created_at: string
}

type Repository = {
    name: string
    description: string | null
    html_url: string
}

type Product = {
    name: string
    description: string | null
    html_url: string
    owner: string
    avatar_url: string | null
    language: string | null
    stargazers_count: number
    repo_created_at: string
    repo_pushed_at: string
    created_at: string
}

export default function UserPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = use(params)
    const [user, setUser] = useState<User | null>(null)
    const [repos, setRepos] = useState<Repository[]>([])
    const [products, setProducts] = useState<Product[]>([])

    useEffect(() => {
        async function fetchData() {
            const [userData, reposData, productsData] = await Promise.all([
                fetch(`http://localhost:8000/users/${username}`).then(r => r.json()),
                fetch(`http://localhost:8000/users/${username}/repos`).then(r => r.json()),
                fetch(`http://localhost:8000/users/${username}/products`).then(r => r.json())
            ])
            setUser(userData)
            setRepos(reposData)
            setProducts(productsData)
        }
        fetchData()
    }, [username])

    const addProduct = async (repoName: string) => {
        await fetch(`http://localhost:8000/users/${username}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ repo_name: repoName })
        })
        const productsData = await fetch(`http://localhost:8000/users/${username}/products`).then(r => r.json())
        setProducts(productsData)
        const dialog = document.getElementById('repo-dialog') as HTMLDialogElement
        dialog?.close()
    }

    if (!user) return <div>Loading...</div>

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                {user.avatar_url && <img src={user.avatar_url} alt="" className="w-16 h-16 rounded-full" />}
                <div>
                    <h1 className="text-xl font-bold">{user.username}</h1>
                    {user.bio && <p className="text-gray-600">{user.bio}</p>}
                </div>
            </div>

            <div className="mt-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">Products</h2>
                    <button
                        onClick={() => (document.getElementById('repo-dialog') as HTMLDialogElement)?.showModal()}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Add Product
                    </button>
                </div>
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

            <dialog id="repo-dialog" className="p-4 max-w-md rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">Select Repository</h3>
                    <button onClick={() => (document.getElementById('repo-dialog') as HTMLDialogElement)?.close()}>✕</button>
                </div>
                <div className="space-y-2">
                    {repos.map(repo => (
                        <button
                            key={repo.name}
                            onClick={() => addProduct(repo.name)}
                            className="w-full p-2 text-left hover:bg-gray-50 rounded"
                        >
                            <div className="font-medium">{repo.name}</div>
                            {repo.description && <p className="text-sm text-gray-600">{repo.description}</p>}
                        </button>
                    ))}
                </div>
            </dialog>
        </div>
    )
} 