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
            const daysToShip = Math.max(timeToShip / (1000 * 60 * 60 * 24), 0.1)
            const fileBonus = (p.num_code_files === null || p.num_code_files === 1) ? 2 : 1 / Math.log((p.num_code_files || 1) + 1)
            const score = Math.round((p.stargazers_count * fileBonus / daysToShip) * 100) / 100
            console.log(`Score for ${p.owner}/${p.name}:`, {
              stars: p.stargazers_count,
              files: p.num_code_files,
              daysToShip,
              fileBonus,
              finalScore: score
            })
            return score
          }
          return getScore(b) - getScore(a) // Sort descending
        })
        setProducts(sortedProducts)
      })
  }, [])

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <main className="px-6 py-12 max-w-5xl mx-auto">
        <header className="mb-16 text-center">
          <div className="relative z-10">
            <h1 className="font-mono text-7xl font-black tracking-tighter text-zinc-900">
              SHIP FAST <span className="text-indigo-500">OR DIE</span>
            </h1>
            <p className="mt-6 text-zinc-500 font-mono text-2xl tracking-wide">
              Celebrating the builders who ship early & often
            </p>

            <div className="mt-12 flex flex-col items-center gap-4 max-w-2xl mx-auto">
              <h3 className="text-lg text-indigo-600 font-mono font-semibold text-center">
                How we rank products
              </h3>
              <div className="w-full p-4 bg-indigo-50 rounded-3xl shadow-sm">
                <div className="grid gap-12 max-w-xl mx-auto">
                  <div className="grid grid-cols-[80px_1fr] items-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-lg">⚡</span>
                    </div>
                    <div className="text-left">
                      <h4 className="text-lg font-medium text-zinc-900 mb-2">Ship Fast</h4>
                      <p className="text-zinc-600">Time from first commit to last push (faster = better)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-[80px_1fr] items-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-lg">📦</span>
                    </div>
                    <div className="text-left">
                      <h4 className="text-lg font-medium text-zinc-900 mb-2">Keep It Simple</h4>
                      <p className="text-zinc-600">Simple code is better (fewer files = better)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-[80px_1fr] items-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-lg">⭐</span>
                    </div>
                    <div className="text-left">
                      <h4 className="text-lg font-medium text-zinc-900 mb-2">Get Recognition</h4>
                      <p className="text-zinc-600">Use GitHub stars to boost products that you love!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-2">
          {products.map((product, index) => (
            <Link
              key={`${product.owner}/${product.name}`}
              href={`/users/${product.owner}/${product.name}`}
              className="group block"
            >
              <div className={`flex items-start gap-5 p-5 bg-white rounded-lg border transition-all duration-200 relative
                group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] 
                group-hover:-translate-y-0.5
                hover:border-indigo-100`}>
                {index < 3 && (
                  <div className={`absolute -top-1.5 -left-2.5 w-5 h-5 rounded-full shadow-sm flex items-center justify-center text-[10px] font-mono font-bold
                    ${index === 0 ? 'bg-gradient-to-br from-amber-200 to-amber-400 text-amber-900' :
                      index === 1 ? 'bg-gradient-to-br from-zinc-200 to-zinc-300 text-zinc-700' :
                        'bg-gradient-to-br from-orange-200 to-orange-300 text-orange-800'}`}>
                    {index + 1}
                  </div>
                )}
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
                      const fileBonus = (product.num_code_files === null || product.num_code_files === 1) ? 2 : 1 / Math.log((product.num_code_files || 1) + 1)
                      const velocity = Math.round((product.stargazers_count * fileBonus / daysToShip) * 100) / 100

                      const timeString = daysToShip > 0
                        ? `${daysToShip.toFixed(1)} days`
                        : `${(diff / (1000 * 60 * 60)).toFixed(1)} hours`;

                      return (
                        <div className="flex flex-wrap gap-x-4 text-[10px] sm:text-xs">
                          <div className="text-zinc-500">⚡ {timeString}</div>
                          {product.num_code_files && (
                            <div className="text-zinc-500">📁 {product.num_code_files} files</div>
                          )}
                          <div className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            Score: {velocity}
                          </div>
                        </div>
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

        <div className="mt-12 text-center">
          <Link
            href={`${process.env.NEXT_PUBLIC_API_URL}/auth/github/login`}
            className="inline-flex items-center px-6 py-3 text-sm font-mono text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
          >
            + Add Your Product
          </Link>
        </div>
      </main>
    </div>
  )
}
