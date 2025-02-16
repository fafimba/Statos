"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { Separator } from "../ui/separator"
import { Checkbox } from "../ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Menu, QrCode, Copy, Swords, HelpCircle, User2, Heart, Shield, ShieldCheck } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { allUnits, testUnits } from "./test_units"
import { calculateAttacks } from "@/lib/utils/calculator"
import { applyAbilityModifiers, GetMortalDamageFromAbilities, checkAbilityConditionsForProfile, checkAbilityConditions } from "@/lib/utils/AbilitiesApplier"

interface Effect {
  type: string
  stat?: string
  value?: number
  value_to_apply?: string
  target?: string
  critical?: {
    effect: string
    mortal_wounds: number
    on_modified: boolean
  }
  dice_amount?: number
  dice_type?: string
  difficulty?: number
  conditions?: Record<string, any>
}

interface AttackProfile {
  name: string
  type: string
  attacks: number
  hit: number
  wound: number
  rend: number
  damage: number
  models_override: number
  abilities?: string[]
}

interface Ability {
  id: string
  name: string
  description: string
  category: string
  activation: string
  effect: Effect
}

interface Unit {
  name: string
  models: number
  wounds: number
  save: number
  ward: number | null
  tags: string[]
  abilities: Ability[]
  attack_profiles: AttackProfile[]
}

interface DamageResult {
  damage_final: number
  enemy_wounds: number
  desglose_perfiles: {
    name: string
    total_attacks: number
    total_hits: number
    wounds: number
    mortal_wound: number
    damage_final: number
  }[]
}

interface CalculateAttacksFunction {
  (
    attack_profiles: AttackProfile[],
    save: number,
    ward: number | null,
    enemy_wounds: number,
    enemy_unit: Unit
  ): DamageResult
}

interface ActiveAbilities {
  offensive: Record<string, boolean>
  defensive: Record<string, boolean>
}

interface ActiveProfiles {
  [key: string]: boolean
}

const round2 = (num: number): number => Math.round(num * 100) / 100;

export function AbilityTester() {
  const [unitA, setUnitA] = useState<Unit>(testUnits.attacker)
  const [unitB, setUnitB] = useState<Unit>(testUnits.defender)
  const [availableUnits] = useState<Unit[]>(Object.values(allUnits))
  const [localUrl] = useState<string>("http://192.168.0.21:3000/ability-tester")
  const [damageAtoB, setDamageAtoB] = useState<DamageResult | null>(null)
  const [damageBtoA, setDamageBtoA] = useState<DamageResult | null>(null)
  const [activeProfilesA, setActiveProfilesA] = useState<ActiveProfiles>({})
  const [activeProfilesB, setActiveProfilesB] = useState<ActiveProfiles>({})
  const [activeAbilitiesA, setActiveAbilitiesA] = useState<ActiveAbilities>({
    offensive: {},
    defensive: {}
  })
  const [activeAbilitiesB, setActiveAbilitiesB] = useState<ActiveAbilities>({
    offensive: {},
    defensive: {}
  })
  const [activeTabA, setActiveTabA] = useState('profiles')
  const [activeTabB, setActiveTabB] = useState('profiles')

  useEffect(() => {
    // Inicializar los perfiles activos cuando cambian las unidades
    setActiveProfilesA(
      unitA.attack_profiles.reduce((acc, profile) => ({
        ...acc,
        [profile.name]: profile.type === 'melee'
      }), {})
    )

    setActiveProfilesB(
      unitB.attack_profiles.reduce((acc, profile) => ({
        ...acc,
        [profile.name]: profile.type === 'melee'
      }), {})
    )

    // Inicializar las habilidades activas cuando cambian las unidades
    setActiveAbilitiesA({
      offensive: unitA.abilities
        .filter(a => a.category === 'offensive')
        .reduce((acc, ability) => ({ ...acc, [ability.id]: false }), {}),
      defensive: unitA.abilities
        .filter(a => a.category === 'defensive')
        .reduce((acc, ability) => ({ ...acc, [ability.id]: false }), {})
    })

    setActiveAbilitiesB({
      offensive: unitB.abilities
        .filter(a => a.category === 'offensive')
        .reduce((acc, ability) => ({ ...acc, [ability.id]: false }), {}),
      defensive: unitB.abilities
        .filter(a => a.category === 'defensive')
        .reduce((acc, ability) => ({ ...acc, [ability.id]: false }), {})
    })
  }, [unitA, unitB])

  useEffect(() => {
    // Aplicar modificadores y calcular daño
    const calculateDamage = () => {
      // A -> B
      const modifiedStateAtoB = applyAbilityModifiers(
        unitA,
        unitB,
        activeProfilesA,
        {
          offensive: activeAbilitiesA.offensive,
          defensive: activeAbilitiesB.defensive
        }
      )

      const rawResultAtoB = calculateAttacks({
        perfiles_ataque: modifiedStateAtoB.attacker.attack_profiles,
        guardia: modifiedStateAtoB.defender.save,
        salvaguardia: modifiedStateAtoB.defender.ward,
        enemy_wounds: modifiedStateAtoB.defender.wounds,
        enemigo: modifiedStateAtoB.defender
      });

      // Convertir el resultado al formato correcto
      const resultAtoB: DamageResult = {
        damage_final: rawResultAtoB.damage_final,
        enemy_wounds: rawResultAtoB.enemy_wounds,
        desglose_perfiles: rawResultAtoB.desglose_perfiles.map(perfil => ({
          name: String(perfil.name),
          total_attacks: perfil.total_attacks,
          total_hits: Number(perfil.total_hits),
          wounds: perfil.wounds,
          mortal_wound: perfil.mortal_wound,
          damage_final: perfil.damage_final
        }))
      };

      // Calcular daño mortal A -> B
      const mortalDamageAtoB = GetMortalDamageFromAbilities(
        unitA,
        unitB,
        {
          offensive: activeAbilitiesA.offensive,
          defensive: activeAbilitiesB.defensive
        }
      )

      // Sumar daño mortal al resultado y redondear
      resultAtoB.damage_final = round2(resultAtoB.damage_final + mortalDamageAtoB);
      setDamageAtoB(resultAtoB)

      // B -> A
      const modifiedStateBtoA = applyAbilityModifiers(
        unitB,
        unitA,
        activeProfilesB,
        {
          offensive: activeAbilitiesB.offensive,
          defensive: activeAbilitiesA.defensive
        }
      )

      const rawResultBtoA = calculateAttacks({
        perfiles_ataque: modifiedStateBtoA.attacker.attack_profiles,
        guardia: modifiedStateBtoA.defender.save,
        salvaguardia: modifiedStateBtoA.defender.ward,
        enemy_wounds: modifiedStateBtoA.defender.wounds,
        enemigo: modifiedStateBtoA.defender
      });

      // Convertir el resultado al formato correcto
      const resultBtoA: DamageResult = {
        damage_final: rawResultBtoA.damage_final,
        enemy_wounds: rawResultBtoA.enemy_wounds,
        desglose_perfiles: rawResultBtoA.desglose_perfiles.map(perfil => ({
          name: String(perfil.name),
          total_attacks: perfil.total_attacks,
          total_hits: Number(perfil.total_hits),
          wounds: perfil.wounds,
          mortal_wound: perfil.mortal_wound,
          damage_final: perfil.damage_final
        }))
      };

      // Calcular daño mortal B -> A
      const mortalDamageBtoA = GetMortalDamageFromAbilities(
        unitB,
        unitA,
        {
          offensive: activeAbilitiesB.offensive,
          defensive: activeAbilitiesA.defensive
        }
      )

      // Sumar daño mortal al resultado y redondear
      resultBtoA.damage_final = round2(resultBtoA.damage_final + mortalDamageBtoA);
      setDamageBtoA(resultBtoA)
    }

    calculateDamage()
  }, [unitA, unitB, activeProfilesA, activeProfilesB, activeAbilitiesA, activeAbilitiesB])

  const handleUnitChange = (value: string, isUnitA: boolean): void => {
    const selectedUnit = availableUnits.find(u => u.name === value)
    if (selectedUnit) {
      if (isUnitA) {
        setUnitA(selectedUnit)
      } else {
        setUnitB(selectedUnit)
      }
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(localUrl)
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err)
    }
  }

  const UnitCard = ({ 
    unit, 
    isUnitA, 
    activeProfiles, 
    setActiveProfiles, 
    activeAbilities, 
    setActiveAbilities,
    activeTab,
    setActiveTab
  }: { 
    unit: Unit, 
    isUnitA: boolean,
    activeProfiles: ActiveProfiles,
    setActiveProfiles: (profiles: ActiveProfiles) => void,
    activeAbilities: ActiveAbilities,
    setActiveAbilities: (abilities: ActiveAbilities) => void,
    activeTab: string,
    setActiveTab: (tab: string) => void
  }) => {
    return (
      <div className="w-full space-y-2 flex flex-col bg-[#fff8ee] rounded-lg border-[2px] border-[#8b4513]/30 overflow-hidden">
        <div className="flex justify-between items-center border-b border-[#8b4513] p-2">
          <h3 className="text-base font-drawn font-semibold text-[#2c1810] tracking-wide">
            {unit.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-[#6b4423] font-drawn">
            <span className="flex items-center gap-1">
              <User2 className="w-3.5 h-3.5" />
              {unit.models}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              {unit.wounds}
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              {unit.save}+
            </span>
            {unit.ward && (
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {unit.ward}+
              </span>
            )}
          </div>
        </div>

        <div className="p-1">
          {/* Barra de vida */}
          <div className="space-y-1 mb-3">
            {/* Iconos de miniaturas y porcentaje */}
            <div className="flex items-center gap-1.5 w-full">
              {isUnitA ? (
                <>
                  {/* Iconos de miniaturas */}
                  <div className="flex gap-1">
                    {Array.from({ length: unit.models }).map((_, i) => {
                      const totalWounds = unit.models * unit.wounds;
                      const currentDamage = isUnitA 
                        ? (damageBtoA?.damage_final ?? 0)
                        : (damageAtoB?.damage_final ?? 0);
                      const woundsPerModel = unit.wounds;
                      const modelPosition = (i + 1) * woundsPerModel;
                      const isModelDead = currentDamage >= modelPosition;

                      return (
                        <div 
                          key={i}
                          className={`w-5 h-5 transition-colors duration-500 ${isModelDead ? 'text-red-500/50' : 'text-[#8b4513]'}`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full align-baseline">
                            <path 
                              d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" 
                              stroke="currentColor" 
                              strokeWidth="2"
                            />
                            <path 
                              d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" 
                              stroke="currentColor" 
                              strokeWidth="2"
                            />
                          </svg>
                        </div>
                      );
                    })}
                  </div>
                  {/* Porcentaje de daño */}
                  <div className="ml-auto text-sm text-red-500/50 font-medium transition-all duration-500 ease-out [text-shadow:0_0_1px_rgba(255,0,0,0.2)]">
                    {`${Math.round((damageBtoA?.damage_final ?? 0) / (unit.models * unit.wounds) * 100)}%`}
                  </div>
                </>
              ) : (
                <>
                  {/* Porcentaje de daño */}
                  <div className="text-sm text-red-500/50 font-medium transition-all duration-500 ease-out [text-shadow:0_0_1px_rgba(255,0,0,0.2)]">
                    {`${Math.round((damageAtoB?.damage_final ?? 0) / (unit.models * unit.wounds) * 100)}%`}
                  </div>
                  {/* Iconos de miniaturas */}
                  <div className="ml-auto flex gap-1">
                    {Array.from({ length: unit.models }).map((_, i) => {
                      const totalWounds = unit.models * unit.wounds;
                      const currentDamage = isUnitA 
                        ? (damageBtoA?.damage_final ?? 0)
                        : (damageAtoB?.damage_final ?? 0);
                      const woundsPerModel = unit.wounds;
                      const modelPosition = (i + 1) * woundsPerModel;
                      const isModelDead = currentDamage >= modelPosition;

                      return (
                        <div 
                          key={i}
                          className={`w-5 h-5 transition-colors duration-500 ${isModelDead ? 'text-red-500/50' : 'text-[#8b4513]'}`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                            <path 
                              d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" 
                              stroke="currentColor" 
                              strokeWidth="2"
                            />
                            <path 
                              d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" 
                              stroke="currentColor" 
                              strokeWidth="2"
                            />
                          </svg>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              {/* Contenedor principal de la barra */}
              <div className="h-3 bg-[#e8d5b5] rounded-full overflow-hidden relative border border-[#8b4513]">
                {/* Barra de progreso */}
                <div 
                  className={`absolute top-0 h-full will-change-[width,transform] ${isUnitA ? 'left-0' : 'right-0'}`}
                  style={{ 
                    width: isUnitA 
                      ? `${Math.max(0, 100 - Math.round((damageBtoA?.damage_final ?? 0) / (unit.models * unit.wounds) * 100))}%` 
                      : `${Math.max(0, 100 - Math.round((damageAtoB?.damage_final ?? 0) / (unit.models * unit.wounds) * 100))}%`,
                    backgroundColor: '#b17f4a',
                    transition: 'width 1500ms ease-out , transform 1500ms ease-out',
                    transform: 'translateZ(0)'
                  }}
                />

                {/* Divisores de modelos */}
                <div className="absolute inset-0 pointer-events-none z-10">
                  {Array.from({ length: unit.models - 1 }).map((_, i) => (
                    <div 
                      key={i}
                      className="absolute h-full w-0.5 rounded-full opacity-80 scale-y-80 transition-transform duration-500 ease-out"
                      style={{ 
                        left: `${((i + 1) / unit.models) * 100}%`,
                        backgroundColor: '#8b4513',
                        mixBlendMode: 'difference'
                      }}
                    />
                  ))}
                </div>

                {/* Divisores de heridas */}
                <div className="absolute inset-0 pointer-events-none z-10">
                  {Array.from({ length: unit.models }).map((_, modelIndex) => (
                    Array.from({ length: unit.wounds - 1 }).map((_, woundIndex) => (
                      <div 
                        key={`${modelIndex}-${woundIndex}`}
                        className="absolute h-full w-px rounded-full opacity-40 scale-y-60 transition-transform duration-500 ease-out"
                        style={{ 
                          left: `${(modelIndex * unit.wounds + woundIndex + 1) / (unit.models * unit.wounds) * 100}%`,
                          backgroundColor: '#8b4513',
                          mixBlendMode: 'difference'
                        }}
                      />
                    ))
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs para perfiles y habilidades */}
          <div className="flex overflow-hidden h-[300px]" >
            <div className="flex w-full bg-[#f8f0e3]">
              <div className="flex flex-col">
                <button
                  onClick={() => setActiveTab('profiles')}
                  className={`flex items-center justify-center p-2 rounded-l transition-colors ${
                    activeTab === 'profiles' 
                      ? 'bg-[#8b4513] text-[#f8f0e3]' 
                      : 'text-[#8b4513] hover:bg-[#8b4513]/10'
                  } flex-1`}
                >
                  <Swords className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTab('abilities')}
                  className={`flex items-center justify-center p-2 rounded-l transition-colors ${
                    activeTab === 'abilities' 
                      ? 'bg-[#8b4513] text-[#f8f0e3]' 
                      : 'text-[#8b4513] hover:bg-[#8b4513]/10'
                  } flex-1`}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                    <path d="M13 2L3 14h9l-1 8L21 10h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className="flex-1 min-h-0 border-[2px] border-[#8b4513] rounded-r">
                {activeTab === 'profiles' && (
                  <div className="h-full p-3">
                    <ScrollArea className="h-full">
                      <div className="space-y-2 pr-2">
                        {unit.attack_profiles.map((profile, index) => (
                          <div key={index} className="bg-white p-2 rounded border border-[#8b4513]/30">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`${profile.name}-${isUnitA ? 'A' : 'B'}`}
                                  checked={isUnitA ? activeProfiles[profile.name] : activeProfiles[profile.name]}
                                  onCheckedChange={(checked) => {
                                    setActiveProfiles({
                                      ...activeProfiles,
                                      [profile.name]: checked as boolean
                                    })
                                  }}
                                  className="data-[state=checked]:bg-[#8b4513] data-[state=checked]:border-[#8b4513] h-4 w-4"
                                />
                                <span className="text-[#2c1810] font-drawn font-medium">{profile.name}</span>
                              </div>
                              <span className="text-[#6b4423] font-drawn text-xs">{profile.type}</span>
                            </div>
                            <div className="grid grid-cols-5 gap-2 text-center mt-1.5">
                              <div>
                                <p className="text-[#6b4423] text-xs font-drawn">A</p>
                                <p className="text-[#2c1810] text-sm font-medium font-drawn">{profile.attacks}</p>
                              </div>
                              <div>
                                <p className="text-[#6b4423] text-xs font-drawn">H</p>
                                <p className="text-[#2c1810] text-sm font-medium font-drawn">{profile.hit}+</p>
                              </div>
                              <div>
                                <p className="text-[#6b4423] text-xs font-drawn">W</p>
                                <p className="text-[#2c1810] text-sm font-medium font-drawn">{profile.wound}+</p>
                              </div>
                              <div>
                                <p className="text-[#6b4423] text-xs font-drawn">R</p>
                                <p className="text-[#2c1810] text-sm font-medium font-drawn">{profile.rend === 0 ? "-" : `-${profile.rend}`}</p>
                              </div>
                              <div>
                                <p className="text-[#6b4423] text-xs font-drawn">D</p>
                                <p className="text-[#2c1810] text-sm font-medium font-drawn">{profile.damage}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {activeTab === 'abilities' && (
                  <div className="h-full p-3">
                    <ScrollArea className="h-full">
                      <div className="space-y-2 pr-2">
                        {unit.abilities
                          .filter(a => a.category === 'offensive')
                          .filter(ability => checkAbilityConditions(ability, isUnitA ? unitA : unitB, isUnitA ? unitB : unitA))
                          .map((ability) => (
                            <div key={ability.id} className="flex items-center gap-2 text-sm bg-white p-2 rounded border border-[#8b4513]/30">
                              <Checkbox
                                id={ability.id}
                                checked={activeAbilities.offensive[ability.id] || false}
                                onCheckedChange={(checked) => setActiveAbilities({
                                  ...activeAbilities,
                                  offensive: { ...activeAbilities.offensive, [ability.id]: checked as boolean }
                                })}
                                className="data-[state=checked]:bg-[#8b4513] data-[state=checked]:border-[#8b4513] h-4 w-4"
                              />
                              <label htmlFor={ability.id} className="flex-1 text-[#2c1810] font-drawn text-sm">
                                {ability.name}
                              </label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-[#6b4423] hover:text-[#2c1810]">
                                    <HelpCircle className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="bg-[#f8f0e3] border-[#8b4513]">
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-[#2c1810] font-drawn">{ability.name}</h4>
                                    <p className="text-sm text-[#6b4423] font-drawn">{ability.description}</p>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          ))}

                        {unit.abilities
                          .filter(a => a.category === 'defensive')
                          .filter(ability => checkAbilityConditions(ability, isUnitA ? unitA : unitB, isUnitA ? unitB : unitA))
                          .map((ability) => (
                            <div key={ability.id} className="flex items-center gap-2 text-sm bg-white p-2 rounded border border-[#8b4513]/30">
                              <Checkbox
                                id={ability.id}
                                checked={activeAbilities.defensive[ability.id] || false}
                                onCheckedChange={(checked) => setActiveAbilities({
                                  ...activeAbilities,
                                  defensive: { ...activeAbilities.defensive, [ability.id]: checked as boolean }
                                })}
                                className="data-[state=checked]:bg-[#8b4513] data-[state=checked]:border-[#8b4513] h-4 w-4"
                              />
                              <label htmlFor={ability.id} className="flex-1 text-[#2c1810] font-drawn text-sm">
                                {ability.name}
                              </label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-[#6b4423] hover:text-[#2c1810]">
                                    <HelpCircle className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="bg-[#f8f0e3] border-[#8b4513]">
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-[#2c1810] font-drawn">{ability.name}</h4>
                                    <p className="text-sm text-[#6b4423] font-drawn">{ability.description}</p>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen overflow-hidden text-[#4a3728] flex flex-col" style={{
      backgroundColor: '#f4e4bc',
      backgroundImage: `
        url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise1'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise1)' opacity='0.15'/%3E%3C/svg%3E"),
        url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise2'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise2)' opacity='0.1'/%3E%3C/svg%3E"),
        radial-gradient(circle at center, rgba(244, 228, 188, 0.8) 0%, rgba(218, 198, 149, 0.4) 100%)
      `,
      backgroundBlendMode: 'overlay, multiply, normal',
    }}>
      <div className="absolute inset-0" style={{
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='50' height='50' filter='url(%23grain)' opacity='0.08'/%3E%3C/svg%3E"),
          linear-gradient(to right, rgba(139, 69, 19, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(139, 69, 19, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px, 20px 20px, 20px 20px',
        mixBlendMode: 'multiply',
        pointerEvents: 'none'
      }}></div>
      <div className="h-full flex flex-col p-4">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 flex-1 max-w-7xl mx-auto w-full">
          {/* Unidad A */}
          <div className="flex items-center">
            <UnitCard 
              unit={unitA} 
              isUnitA={true}
              activeProfiles={activeProfilesA}
              setActiveProfiles={setActiveProfilesA}
              activeAbilities={activeAbilitiesA}
              setActiveAbilities={setActiveAbilitiesA}
              activeTab={activeTabA}
              setActiveTab={setActiveTabA}
            />
          </div>

          {/* Daño Central */}
          <div className="flex items-center justify-center lg:px-4">
            <div className="flex items-center gap-4">
              {damageAtoB && (
                <span className="text-4xl font-black font-drawn text-[#8b4513] tracking-wide tabular-nums [text-shadow:0_2px_4px_rgba(139,69,19,0.2)]">
                  {Math.round((damageAtoB?.damage_final || 0) * 10) / 10}
                </span>
              )}

              <div className="text-[#8b4513]/60 text-3xl">⚔</div>

              {damageBtoA && (
                <span className="text-4xl font-black font-drawn text-[#8b4513] tracking-wide tabular-nums [text-shadow:0_2px_4px_rgba(139,69,19,0.2)]">
                  {Math.round((damageBtoA?.damage_final || 0) * 10) / 10}
                </span>
              )}
            </div>
          </div>

          {/* Unidad B */}
          <div className="bg-[#f8f0e3] bg-opacity-90 rounded-lg border-2 border-[#8b4513] shadow-md flex flex-col" style={{
            backgroundImage: `
              url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23paper)' opacity='0.08'/%3E%3C/svg%3E"),
              radial-gradient(circle at center, rgba(248, 240, 227, 0.9) 0%, rgba(244, 228, 188, 0.6) 100%)
            `,
            backgroundBlendMode: 'multiply, normal',
            boxShadow: '0 4px 6px -1px rgba(139, 69, 19, 0.1), 0 2px 4px -1px rgba(139, 69, 19, 0.06)'
          }}>
            <UnitCard 
              unit={unitB} 
              isUnitA={false}
              activeProfiles={activeProfilesB}
              setActiveProfiles={setActiveProfilesB}
              activeAbilities={activeAbilitiesB}
              setActiveAbilities={setActiveAbilitiesB}
              activeTab={activeTabB}
              setActiveTab={setActiveTabB}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

<style jsx global>{`
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.8; }
    100% { opacity: 1; }
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`}</style> 