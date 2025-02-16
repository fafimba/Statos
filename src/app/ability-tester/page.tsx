'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { allUnits, type Unit } from '@/data/test_units'

export default function AbilityTester() {
  const [selectedUnit, setSelectedUnit] = useState<Unit>(allUnits.lord_of_afflictions)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Ability Tester</h1>
          <p className="text-muted-foreground text-lg">Test and compare unit abilities</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Unit Stats Card */}
          <Card className="lg:col-span-3 border-2 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl">{selectedUnit.name}</CardTitle>
                  <CardDescription>
                    {selectedUnit.models} {selectedUnit.models === 1 ? 'Model' : 'Models'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {selectedUnit.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs font-medium">
                      {tag}
                    </Badge>
                  ))}
                  {selectedUnit.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedUnit.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6 p-4 bg-muted/50 rounded-lg mb-6">
                <StatCard 
                  title="Wounds" 
                  value={selectedUnit.wounds} 
                  icon="❤️"
                />
                <StatCard 
                  title="Save" 
                  value={`${selectedUnit.save}+`} 
                  icon="🛡️"
                />
                <StatCard 
                  title="Ward" 
                  value={selectedUnit.ward ? `${selectedUnit.ward}+` : '-'} 
                  icon="✨"
                />
              </div>

              <Tabs defaultValue="abilities" className="w-full">
                <TabsList className="w-full grid grid-cols-3 mb-4">
                  <TabsTrigger value="abilities">Abilities</TabsTrigger>
                  <TabsTrigger value="attacks">Attack Profiles</TabsTrigger>
                  <TabsTrigger value="tags">Tags</TabsTrigger>
                </TabsList>

                <TabsContent value="abilities">
                  <div className="space-y-4">
                    {selectedUnit.abilities.map(ability => (
                      <Card key={ability.id} className="overflow-hidden">
                        <CardHeader className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-xl">{ability.name}</CardTitle>
                              <Badge variant={ability.category === 'offensive' ? 'destructive' : 'secondary'}>
                                {ability.category}
                              </Badge>
                            </div>
                            <Badge variant="outline">{ability.activation}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-muted-foreground">
                          {ability.description}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="attacks">
                  <div className="space-y-6">
                    {selectedUnit.attack_profiles.map(profile => (
                      <Card key={profile.name} className="overflow-hidden">
                        <CardHeader className="p-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">{profile.name}</CardTitle>
                            <Badge variant="secondary">{profile.type}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                            <StatCard title="Range" value={`${profile.range}"`} icon="📏" />
                            <StatCard title="Attacks" value={profile.attacks} icon="⚔️" />
                            <StatCard title="To Hit" value={`${profile.hit}+`} icon="🎯" />
                            <StatCard title="To Wound" value={`${profile.wound}+`} icon="💥" />
                            <StatCard title="Rend" value={profile.rend} icon="🗡️" />
                            <StatCard title="Damage" value={profile.damage} icon="💀" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="tags">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {selectedUnit.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Select different units to compare their abilities and stats.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(allUnits).map(([key, unit]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedUnit(unit)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedUnit.name === unit.name
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {unit.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle>Unit Type</CardTitle>
                <CardDescription>
                  {selectedUnit.tags.includes('HERO') ? 'Hero Unit' : 'Regular Unit'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {selectedUnit.tags.includes('HERO') ? '👑' : '⚔️'}
                  <span className="text-sm text-muted-foreground">
                    {selectedUnit.tags.includes('HERO')
                      ? 'This is a hero unit with unique abilities'
                      : 'This is a regular unit'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  icon 
}: { 
  title: string; 
  value: React.ReactNode; 
  icon?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-2">
      {icon && <span className="text-xl">{icon}</span>}
      <div className="flex flex-col">
        <span className="text-sm text-muted-foreground">{title}</span>
        <span className="text-xl font-bold">{value}</span>
      </div>
    </div>
  )
} 