import React, { useState } from 'react';
import { Box, Typography, Checkbox, FormControlLabel, Paper, Grid, Divider, Tabs, Tab, Button } from '@mui/material';
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
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>
      <Box sx={{ pl: 2 }}>
        <Typography>Models: {unit.models}</Typography>
        <Typography>Wounds: {unit.wounds}</Typography>
        <Typography>Save: {unit.save}+</Typography>
        {unit.ward && <Typography>Ward: {unit.ward}+</Typography>}
        <Typography>Tags: {unit.tags?.join(", ")}</Typography>
      </Box>
      
      {abilities && abilities.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>Abilities:</Typography>
          <Box sx={{ pl: 2 }}>
            {abilities.map(ability => renderAbility(ability))}
          </Box>
        </>
      )}
      
      {profiles && profiles.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>Attack Profiles:</Typography>
          <Box sx={{ pl: 2 }}>
            {profiles.map(profile => (
              <Box key={profile.name}>
                <Typography variant="subtitle2">{profile.name}</Typography>
                <Typography variant="body2">
                  Type: {profile.type} | Range: {profile.range}" |
                  Attacks: {profile.attacks} | Hit: {profile.hit}+ | 
                  Wound: {profile.wound}+ | Rend: {profile.rend} | 
                  Damage: {profile.damage}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Paper>
  );

  const renderDamageCard = (damage, title, defender) => (
    <Paper sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>
      {damage.desglose_perfiles.map((profileDamage, index) => (
        <Box key={index} sx={{ pl: 2, mb: 1 }}>
          <Typography variant="subtitle2">{profileDamage.name}</Typography>
          <Typography>Daño promedio: {profileDamage.damage_final.toFixed(2)}</Typography>
          {profileDamage.mortal_wound > 0 && (
            <Typography>Daño mortal: {profileDamage.mortal_wound.toFixed(2)}</Typography>
          )}
          <Typography>
            Modelos eliminados: {Math.floor(profileDamage.damage_final / defender.wounds)}
          </Typography>
        </Box>
      ))}
      <Divider sx={{ my: 1 }} />
      <Typography variant="subtitle1">
        Daño Total: {damage.damage_final.toFixed(2)}
      </Typography>
    </Paper>
  );

  const renderAbility = (ability) => (
    <Box sx={{ ml: 2 }}>
      <Typography variant="subtitle2">{ability.name}</Typography>
      <Typography variant="body2">{ability.description}</Typography>
      <Typography variant="caption">
        Type: {ability.effect.type} | 
        Activation: {ability.activation}
      </Typography>
    </Box>
  );

  // Componente para los controles de una unidad
  const renderUnitControls = (unit, abilities, profiles, handleAbilityToggle, handleProfileToggle) => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1">Offensive Abilities</Typography>
      {unit.abilities.map(ability => (
        <FormControlLabel
          key={ability.id}
          control={
            <Checkbox
              checked={abilities.offensive[ability.id]}
              onChange={() => handleAbilityToggle(ability.id, 'offensive')}
            />
          }
          label={ability.name}
        />
      ))}

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1">Defensive Abilities</Typography>
      {unit.abilities.map(ability => (
        <FormControlLabel
          key={ability.id}
          control={
            <Checkbox
              checked={abilities.defensive[ability.id]}
              onChange={() => handleAbilityToggle(ability.id, 'defensive')}
            />
          }
          label={ability.name}
        />
      ))}

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1">Attack Profiles</Typography>
      {unit.attack_profiles.map(profile => (
        <FormControlLabel
          key={profile.name}
          control={
            <Checkbox
              checked={profiles[profile.name]}
              onChange={() => handleProfileToggle(profile.name)}
            />
          }
          label={profile.name}
        />
      ))}
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Combat Simulator</Typography>
      
      <Grid container spacing={2}>
        {/* Unidad A */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {allUnits[selectedUnitA].name}
            </Typography>
            <Button
              variant="contained"
              onClick={handleNextUnitA}
              size="small"
            >
              Next Unit
            </Button>
          </Box>
          <Grid container spacing={2}>
            {/* Stats básicos y daño */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="h6">{allUnits[selectedUnitA].name}</Typography>
                    <Typography>Models: {allUnits[selectedUnitA].models}</Typography>
                    <Typography>Wounds: {allUnits[selectedUnitA].wounds}</Typography>
                    <Typography>Save: {allUnits[selectedUnitA].save}+</Typography>
                    {allUnits[selectedUnitA].ward && 
                      <Typography>Ward: {allUnits[selectedUnitA].ward}+</Typography>
                    }
                  </Grid>
                  <Grid item xs={6}>
                    {/* Daño vs B */}
                    <Box sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                      <Typography variant="subtitle1">Damage vs Unit B</Typography>
                      <Typography>
                        Total: {damageAtoB.damage_final?.toFixed(2) || '0.00'}
                      </Typography>
                      <Typography>
                        Models killed: {Math.floor((damageAtoB.damage_final || 0) / allUnits[selectedUnitB].wounds)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Controles en tabs o accordion */}
            <Grid item xs={12}>
              <Paper>
                <Tabs value={tabValueA} onChange={(e, v) => setTabValueA(v)}>
                  <Tab label="Abilities" />
                  <Tab label="Profiles" />
                </Tabs>
                <Box sx={{ p: 2 }}>
                  {tabValueA === 0 && (
                    <Grid container spacing={1}>
                      {allUnits[selectedUnitA].abilities.map(ability => (
                        <Grid item xs={12} key={ability.id}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={unitAAbilities.offensive[ability.id]}
                                onChange={() => handleUnitAAbilityToggle(ability.id, 'offensive')}
                                size="small"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="subtitle2">{ability.name}</Typography>
                                <Typography variant="caption" display="block">
                                  {ability.description}
                                </Typography>
                              </Box>
                            }
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                  {tabValueA === 1 && (
                    <Grid container spacing={1}>
                      {allUnits[selectedUnitA].attack_profiles.map(profile => (
                        <Grid item xs={12} key={profile.name}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={unitAProfiles[profile.name]}
                                onChange={() => handleUnitAProfileToggle(profile.name)}
                                size="small"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="subtitle2">{profile.name}</Typography>
                                <Typography variant="caption">
                                  A:{profile.attacks} | H:{profile.hit}+ | W:{profile.wound}+ |
                                  R:{profile.rend} | D:{profile.damage}
                                </Typography>
                              </Box>
                            }
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Unidad B */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {allUnits[selectedUnitB].name}
            </Typography>
            <Button
              variant="contained"
              onClick={handleNextUnitB}
              size="small"
            >
              Next Unit
            </Button>
          </Box>
          <Grid container spacing={2}>
            {/* Stats básicos y daño */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="h6">{allUnits[selectedUnitB].name}</Typography>
                    <Typography>Models: {allUnits[selectedUnitB].models}</Typography>
                    <Typography>Wounds: {allUnits[selectedUnitB].wounds}</Typography>
                    <Typography>Save: {allUnits[selectedUnitB].save}+</Typography>
                    {allUnits[selectedUnitB].ward && 
                      <Typography>Ward: {allUnits[selectedUnitB].ward}+</Typography>
                    }
                  </Grid>
                  <Grid item xs={6}>
                    {/* Daño vs A */}
                    <Box sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                      <Typography variant="subtitle1">Damage vs Unit A</Typography>
                      <Typography>
                        Total: {damageBtoA.damage_final?.toFixed(2) || '0.00'}
                      </Typography>
                      <Typography>
                        Models killed: {Math.floor((damageBtoA.damage_final || 0) / allUnits[selectedUnitA].wounds)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Controles en tabs o accordion */}
            <Grid item xs={12}>
              <Paper>
                <Tabs value={tabValueB} onChange={(e, v) => setTabValueB(v)}>
                  <Tab label="Abilities" />
                  <Tab label="Profiles" />
                </Tabs>
                <Box sx={{ p: 2 }}>
                  {tabValueB === 0 && (
                    <Grid container spacing={1}>
                      {allUnits[selectedUnitB].abilities.map(ability => (
                        <Grid item xs={12} key={ability.id}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={unitBAbilities.offensive[ability.id]}
                                onChange={() => handleUnitBAbilityToggle(ability.id, 'offensive')}
                                size="small"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="subtitle2">{ability.name}</Typography>
                                <Typography variant="caption" display="block">
                                  {ability.description}
                                </Typography>
                              </Box>
                            }
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                  {tabValueB === 1 && (
                    <Grid container spacing={1}>
                      {allUnits[selectedUnitB].attack_profiles.map(profile => (
                        <Grid item xs={12} key={profile.name}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={unitBProfiles[profile.name]}
                                onChange={() => handleUnitBProfileToggle(profile.name)}
                                size="small"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="subtitle2">{profile.name}</Typography>
                                <Typography variant="caption">
                                  A:{profile.attacks} | H:{profile.hit}+ | W:{profile.wound}+ |
                                  R:{profile.rend} | D:{profile.damage}
                                </Typography>
                              </Box>
                            }
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AbilityTester; 