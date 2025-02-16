'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Navbar } from './components/Navbar'
import { Product } from './types/product'

export default function Page() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/leaderboard`)
      .then(res => res.json())
      .then(products => {
        const sortedProducts = products.sort((a: Product, b: Product) => {
          const getScore = (p: Product) => {
            const timeToShip = new Date(p.repo_pushed_at).getTime() - new Date(p.repo_created_at).getTime()
            const daysToShip = timeToShip / (1000 * 60 * 60 * 24)
            const fileComplexityFactor = p.num_code_files ? Math.log(p.num_code_files) : 1
            return (p.stargazers_count / daysToShip) * (1 / fileComplexityFactor)
          }
          return getScore(b) - getScore(a) // Sort descending
        })
        setProducts(sortedProducts)
      })
  }, [])

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <main className="px-6 py-24 max-w-5xl mx-auto">
        <header className="mb-32 text-center">
          <div className="relative z-10 mt-12">
            <h1 className="font-mono text-7xl font-black tracking-tighter text-zinc-900">
              SHIP FAST <span className="text-indigo-500">OR DIE</span>
            </h1>
            <p className="mt-6 text-zinc-500 font-mono text-sm tracking-wide">
              CELEBRATING THE BUILDERS WHO SHIP EARLY & OFTEN
            </p>
            <div className="mt-8 inline-block px-4 py-2 bg-indigo-50 rounded-lg">
              <p className="text-xs text-indigo-600 font-mono">
                Rankings based on velocity (stars/time) and simplicity (fewer files)
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-2">
          {products.map(product => (
            <Link
              key={`${product.owner}/${product.name}`}
              href={`/users/${product.owner}/${product.name}`}
              className="group block"
            >
              <div className="flex items-start gap-5 p-5 bg-white rounded-lg border border-zinc-100 
                            hover:border-indigo-100 hover:bg-white transition-all duration-200">
                <div className="relative shrink-0">
                  {product.avatar_url ? (
                    <Image
                      src={product.avatar_url}
                      alt=""
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-lg bg-zinc-50 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <span className="text-xl text-indigo-300">⚡</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-mono text-sm text-zinc-900 truncate">
                    {product.owner}/{product.name}
                  </h2>
                  {product.description && (
                    <p className="text-zinc-500 text-sm mt-1 line-clamp-2 font-light">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-2 text-xs text-zinc-400 space-y-1">
                    {(() => {
                      const diff = new Date(product.repo_pushed_at).getTime() -
                        new Date(product.repo_created_at).getTime()
                      const daysToShip = diff / (1000 * 60 * 60 * 24)
                      const fileComplexityFactor = product.num_code_files ? Math.log(product.num_code_files) : 1
                      const velocity = ((product.stargazers_count / daysToShip) * (1 / fileComplexityFactor)).toFixed(2)

                      const timeString = daysToShip > 0
                        ? `${daysToShip.toFixed(2)} days`
                        : `${(diff / (1000 * 60 * 60)).toFixed(2)} hours`;

                      return (
                        <>
                          <div>Shipped in {timeString}</div>
                          {product.num_code_files && (
                            <div>{product.num_code_files} files</div>
                          )}
                          <div className="relative">
                            Velocity / Simplcity Score: {velocity}
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs shrink-0">
                  {product.language && (
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {product.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    ★ {product.stargazers_count}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
