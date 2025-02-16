'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">PreBattle</h1>
        <p className="text-xl mb-8">Combat Simulator for Age of Sigmar</p>
        <Link href="/ability-tester">
          <Button>Ability Tester</Button>
        </Link>
      </div>
    </main>
  )
} 