import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import { Checkbox } from "../components/ui/checkbox";
import { allUnits } from '../data/test_units';
import { applyAbilityModifiers } from '../utils/AbilitiesApplier';
import { calculateAttacks } from '../utils/calculator';

const AbilityTester = () => {
  const unitKeys = Object.keys(allUnits);
  const [selectedUnitA, setSelectedUnitA] = useState('lord_of_afflictions');
  const [selectedUnitB, setSelectedUnitB] = useState('putrid_blightkings');
  
  // Estado para ambas unidades
  const [unitAAbilities, setUnitAAbilities] = useState({
    offensive: allUnits[selectedUnitA].abilities.reduce((acc, ability) => ({
      ...acc,
      [ability.id]: false
    }), {}),
    defensive: allUnits[selectedUnitA].abilities.reduce((acc, ability) => ({
      ...acc,
      [ability.id]: false
    }), {})
  });

  const [unitBAbilities, setUnitBAbilities] = useState({
    offensive: allUnits[selectedUnitB].abilities.reduce((acc, ability) => ({
      ...acc,
      [ability.id]: false
    }), {}),
    defensive: allUnits[selectedUnitB].abilities.reduce((acc, ability) => ({
      ...acc,
      [ability.id]: false
    }), {})
  });

  const [unitAProfiles, setUnitAProfiles] = useState(
    allUnits[selectedUnitA].attack_profiles.reduce((acc, profile) => ({
      ...acc,
      [profile.name]: true
    }), {})
  );

  const [unitBProfiles, setUnitBProfiles] = useState(
    allUnits[selectedUnitB].attack_profiles.reduce((acc, profile) => ({
      ...acc,
      [profile.name]: true
    }), {})
  );

  const [tabValueA, setTabValueA] = useState(0);
  const [tabValueB, setTabValueB] = useState(0);

  // Manejadores para cada unidad
  const handleUnitAAbilityToggle = (abilityId, category) => {
    setUnitAAbilities(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [abilityId]: !prev[category][abilityId]
      }
    }));
  };

  const handleUnitBAbilityToggle = (abilityId, category) => {
    setUnitBAbilities(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [abilityId]: !prev[category][abilityId]
      }
    }));
  };

  const handleUnitAProfileToggle = (profileName) => {
    setUnitAProfiles(prev => ({
      ...prev,
      [profileName]: !prev[profileName]
    }));
  };

  const handleUnitBProfileToggle = (profileName) => {
    setUnitBProfiles(prev => ({
      ...prev,
      [profileName]: !prev[profileName]
    }));
  };

  const handleNextUnitA = () => {
    const currentIndex = unitKeys.indexOf(selectedUnitA);
    const nextIndex = (currentIndex + 1) % unitKeys.length;
    const nextUnit = unitKeys[nextIndex];
    setSelectedUnitA(nextUnit);
    // Resetear estados al cambiar de unidad
    setUnitAAbilities({
      offensive: allUnits[nextUnit].abilities.reduce((acc, ability) => ({
        ...acc,
        [ability.id]: false
      }), {}),
      defensive: allUnits[nextUnit].abilities.reduce((acc, ability) => ({
        ...acc,
        [ability.id]: false
      }), {})
    });
    setUnitAProfiles(
      allUnits[nextUnit].attack_profiles.reduce((acc, profile) => ({
        ...acc,
        [profile.name]: true
      }), {})
    );
  };

  const handleNextUnitB = () => {
    const currentIndex = unitKeys.indexOf(selectedUnitB);
    const nextIndex = (currentIndex + 1) % unitKeys.length;
    const nextUnit = unitKeys[nextIndex];
    setSelectedUnitB(nextUnit);
    // Resetear estados al cambiar de unidad
    setUnitBAbilities({
      offensive: allUnits[nextUnit].abilities.reduce((acc, ability) => ({
        ...acc,
        [ability.id]: false
      }), {}),
      defensive: allUnits[nextUnit].abilities.reduce((acc, ability) => ({
        ...acc,
        [ability.id]: false
      }), {})
    });
    setUnitBProfiles(
      allUnits[nextUnit].attack_profiles.reduce((acc, profile) => ({
        ...acc,
        [profile.name]: true
      }), {})
    );
  };

  // Calcular daño en ambas direcciones
  const AtoB = applyAbilityModifiers(
    allUnits[selectedUnitA],
    allUnits[selectedUnitB],
    unitAProfiles,
    {
      offensive: unitAAbilities.offensive,
      defensive: unitBAbilities.defensive
    }
  );
  console.log('Antes de calculateAttacks AtoB:', {
    unidad_atacante: allUnits[selectedUnitA],
    unidad_defensora: allUnits[selectedUnitB],
    perfiles_modificados: AtoB.attacker.attack_profiles,
    guardia: AtoB.defender.save,
    salvaguardia: AtoB.defender.ward,
    enemy_wounds: AtoB.defender.wounds,
    enemigo: AtoB.defender
  });

  const damageAtoB = calculateAttacks({
    perfiles_ataque: AtoB.attacker.attack_profiles,
    guardia: AtoB.defender.save,
    salvaguardia: AtoB.defender.ward,
    enemy_wounds: AtoB.defender.wounds,
    enemigo: AtoB.defender
  });

  console.log('Resultado calculateAttacks AtoB:', damageAtoB);

  const BtoA = applyAbilityModifiers(
    allUnits[selectedUnitB],
    allUnits[selectedUnitA],
    unitBProfiles,
    {
      offensive: unitBAbilities.offensive,
      defensive: unitAAbilities.defensive
    }
  );

  console.log('Antes de calculateAttacks BtoA:', {
    unidad_atacante: allUnits[selectedUnitB],
    unidad_defensora: allUnits[selectedUnitA],
    perfiles_modificados: BtoA.attacker.attack_profiles,
    guardia: BtoA.defender.save,
    salvaguardia: BtoA.defender.ward,
    enemy_wounds: BtoA.defender.wounds,
    enemigo: BtoA.defender
  });

  const damageBtoA = calculateAttacks({
    perfiles_ataque: BtoA.attacker.attack_profiles,
    guardia: BtoA.defender.save,
    salvaguardia: BtoA.defender.ward,
    enemy_wounds: BtoA.defender.wounds,
    enemigo: BtoA.defender
  });

  console.log('Resultado calculateAttacks BtoA:', damageBtoA);

  const renderUnitCard = (unit, title, abilities, profiles) => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Models</p>
              <p className="text-lg font-semibold">{unit.models}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Wounds</p>
              <p className="text-lg font-semibold">{unit.wounds}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Save</p>
              <p className="text-lg font-semibold">{unit.save}+</p>
            </div>
            {unit.ward && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ward</p>
                <p className="text-lg font-semibold">{unit.ward}+</p>
              </div>
            )}
          </div>

          {unit.tags && unit.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {unit.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {abilities && abilities.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="text-sm font-medium mb-2">Abilities</h4>
                <ScrollArea className="h-[200px] rounded-md border p-4">
                  <div className="space-y-4">
                    {abilities.map(ability => (
                      <div key={ability.id} className="space-y-1">
                        <h5 className="font-medium">{ability.name}</h5>
                        <p className="text-sm text-muted-foreground">{ability.description}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
          
          {profiles && profiles.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="text-sm font-medium mb-2">Attack Profiles</h4>
                <ScrollArea className="h-[200px] rounded-md border p-4">
                  <div className="space-y-4">
                    {profiles.map(profile => (
                      <div key={profile.name} className="space-y-2">
                        <h5 className="font-medium">{profile.name}</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Type:</span> {profile.type}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Range:</span> {profile.range}"
                          </div>
                          <div>
                            <span className="text-muted-foreground">Attacks:</span> {profile.attacks}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Hit:</span> {profile.hit}+
                          </div>
                          <div>
                            <span className="text-muted-foreground">Wound:</span> {profile.wound}+
                          </div>
                          <div>
                            <span className="text-muted-foreground">Rend:</span> {profile.rend}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Damage:</span> {profile.damage}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderDamageCard = (damage, title, defender) => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {damage.desglose_perfiles.map((profileDamage, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{profileDamage.name}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Total Damage:</span>
                  <span className="text-lg font-semibold">{profileDamage.damage_final.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {profileDamage.mortal_wound > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mortal Wounds</p>
                    <p className="text-lg font-semibold">{profileDamage.mortal_wound.toFixed(2)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Models Killed</p>
                  <p className="text-lg font-semibold">{Math.floor(profileDamage.damage_final / defender.wounds)}</p>
                </div>
              </div>

              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-primary">
                      Damage Efficiency
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary/20">
                  <div
                    style={{ width: `${Math.min((profileDamage.damage_final / (defender.wounds * defender.models)) * 100, 100)}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                  />
                </div>
              </div>
            </div>
          ))}

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Unit Damage</span>
            <span className="text-xl font-bold">{damage.damage_final.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAbility = (ability, isChecked, onToggle) => (
    <div className="flex items-start space-x-2">
      <Checkbox
        id={ability.id}
        checked={isChecked}
        onCheckedChange={onToggle}
      />
      <div>
        <label htmlFor={ability.id} className="text-sm font-medium">
          {ability.name}
        </label>
        <p className="text-sm text-muted-foreground">{ability.description}</p>
      </div>
    </div>
  );

  // Componente para los controles de una unidad
  const renderUnitControls = (unit, abilities, profiles, handleAbilityToggle, handleProfileToggle) => (
    <Card className="mb-4">
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-4">Offensive Abilities</h4>
            <div className="space-y-2">
              {unit.abilities.map(ability => (
                <div key={ability.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={`offensive-${ability.id}`}
                    checked={abilities.offensive[ability.id]}
                    onCheckedChange={() => handleAbilityToggle(ability.id, 'offensive')}
                  />
                  <div>
                    <label htmlFor={`offensive-${ability.id}`} className="text-sm font-medium">
                      {ability.name}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-4">Defensive Abilities</h4>
            <div className="space-y-2">
              {unit.abilities.map(ability => (
                <div key={ability.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={`defensive-${ability.id}`}
                    checked={abilities.defensive[ability.id]}
                    onCheckedChange={() => handleAbilityToggle(ability.id, 'defensive')}
                  />
                  <div>
                    <label htmlFor={`defensive-${ability.id}`} className="text-sm font-medium">
                      {ability.name}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-4">Attack Profiles</h4>
            <div className="space-y-2">
              {unit.attack_profiles.map(profile => (
                <div key={profile.name} className="flex items-start space-x-2">
                  <Checkbox
                    id={`profile-${profile.name}`}
                    checked={profiles[profile.name]}
                    onCheckedChange={() => handleProfileToggle(profile.name)}
                  />
                  <div>
                    <label htmlFor={`profile-${profile.name}`} className="text-sm font-medium">
                      {profile.name}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Ability Tester</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Unit A: {allUnits[selectedUnitA].name}</h2>
            <Button onClick={handleNextUnitA}>Next Unit</Button>
          </div>
          
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="abilities">Abilities</TabsTrigger>
              <TabsTrigger value="damage">Damage</TabsTrigger>
            </TabsList>
            <TabsContent value="stats">
              {renderUnitCard(allUnits[selectedUnitA], "Unit A", [], [])}
            </TabsContent>
            <TabsContent value="abilities">
              {renderUnitControls(
                allUnits[selectedUnitA],
                unitAAbilities,
                unitAProfiles,
                handleUnitAAbilityToggle,
                handleUnitAProfileToggle
              )}
            </TabsContent>
            <TabsContent value="damage">
              {renderDamageCard(damageAtoB, "Damage to Unit B", allUnits[selectedUnitB])}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Unit B: {allUnits[selectedUnitB].name}</h2>
            <Button onClick={handleNextUnitB}>Next Unit</Button>
          </div>
          
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="abilities">Abilities</TabsTrigger>
              <TabsTrigger value="damage">Damage</TabsTrigger>
            </TabsList>
            <TabsContent value="stats">
              {renderUnitCard(allUnits[selectedUnitB], "Unit B", [], [])}
            </TabsContent>
            <TabsContent value="abilities">
              {renderUnitControls(
                allUnits[selectedUnitB],
                unitBAbilities,
                unitBProfiles,
                handleUnitBAbilityToggle,
                handleUnitBProfileToggle
              )}
            </TabsContent>
            <TabsContent value="damage">
              {renderDamageCard(damageBtoA, "Damage to Unit A", allUnits[selectedUnitA])}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AbilityTester; 