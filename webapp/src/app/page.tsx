'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Navbar } from './components/Navbar'
import { Product } from './types/product'


export default function Page() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch('http://localhost:8000/products/leaderboard')
      .then(res => res.json())
      .then(setProducts)
  }, [])

  return (
    <>
      <Navbar />
      <div className="p-8 max-w-4xl mx-auto">
        <div className="space-y-4">
          {products.map(product => (
            <Link
              key={`${product.owner}/${product.name}`}
              href={`/users/${product.owner}/${product.name}`}
              className="block border rounded-lg p-4 hover:border-gray-400"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  {product.avatar_url && (
                    <img src={product.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                  )}
                  <div>
                    <span className="font-medium">
                      {product.owner}/{product.name}
                    </span>
                    {product.description && (
                      <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-4">
                  {product.language && <span>🔨 {product.language}</span>}
                  <span className="font-medium">⭐ {product.stargazers_count}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
