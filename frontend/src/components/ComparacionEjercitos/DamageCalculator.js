import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShieldIcon from '@mui/icons-material/Shield';
import SecurityIcon from '@mui/icons-material/Security';
import LifeBar from './LifeBar';
import  AbilityButton  from './AbilityButton';
import  useAbilityToggle  from './hooks/useAbility';
import { calculateAttacks,
     calcularValorDado,
      calcularMortalesConDados 
    } from '../../utils/calculator';

import { weapon_abilities } from '../../data/weapon_abilities';  


 const DamageCalculator = React.memo(({ 
    unidadAtacante,
    unidadOponente,
    perfilesActivos,  
    onDanoCalculado
  }) => {
    // Convertir perfilesActivos (objeto) a un array de perfiles con comprobación de seguridad
    const perfilesParaCalcular = useMemo(() => {
      if (!unidadAtacante?.attack_profiles) return [];
      
      return unidadAtacante.attack_profiles.filter(perfil => 
        perfilesActivos[perfil.name]
      );
    }, [perfilesActivos, unidadAtacante?.attack_profiles]);
  
    // Estado para controlar la visibilidad de cada tooltip individualmente
    const [activeTooltip, setActiveTooltip] = useState(null);
    const tooltipTimeoutRef = useRef(null);
  
    // Preparar arrays de habilidades, filtrando por categoría y condiciones
    const habilidadesAtacante = [].concat(unidadAtacante.abilities)
      .filter(Boolean)
      .filter(hab => hab.category === 'offensive')
      .filter(hab => !hab.effect?.conditions || Object.entries(hab.effect.conditions).every(([key, value]) => {
        switch(key) {
          case 'attack_type':
            return perfilesParaCalcular.some(perfil => perfil.type === value);
          case 'target_tag':
            return unidadOponente.tags?.includes(value);
          case 'target_tag_exclude':
            return !unidadOponente.tags?.includes(value);
          case 'profile_name':
            return perfilesParaCalcular.some(perfil => perfil.name === value);
          case 'opponent_size':
            const { opponent_size } = hab.effect.conditions;
            const comparacion = opponent_size.substring(0,2);
            const valor = parseInt(opponent_size.substring(2));
            switch(comparacion) {
              case '>=':
                return unidadOponente.models >= valor;
              case '<=':
                return unidadOponente.models <= valor;
              default:
                return true;
            }
          default:
            return true;
        }
      }))
      .map(hab => ({
        ...hab,
        id: `${unidadAtacante.name}_${hab.name}`
      }));
  
      // Habilidades ofensivas de perfiles filtradas por condiciones
    const habilidadesPerfiles = [].concat(perfilesParaCalcular)
      .flatMap(perfil => {
        // Obtener las habilidades del arma desde el array de abilities del perfil
        const weaponAbilities = (perfil.abilities || [])
          .filter(Boolean)
          .map(abilityKey => {
            // Buscar la habilidad en weapons_abilities usando la key
            const weaponAbility = weapon_abilities[abilityKey];
            if (weaponAbility) {
              return {
                ...weaponAbility,
                id: `${perfil.name}_${weaponAbility.name}`,
                profile: perfil.name,
                description:  perfil.name + ": " + weaponAbility.description
              };
            }
            return null;
          })
          
          .filter(Boolean)
          .filter(hab => hab.effect != null)
          .filter(hab => !hab.effect?.conditions || Object.entries(hab.effect?.conditions).every(([key, value]) => {
            switch(key) {
              case 'target_tag':
                return unidadOponente.tags?.includes(value);
              default:
                return true;
            }
          }));
  
        return weaponAbilities;
      });
      // Habilidades defensivas filtradas por condiciones
    const habilidadesOponente = [].concat(unidadOponente.abilities)
      .filter(Boolean)
      .filter(hab => hab.category === 'defensive')
      .filter(hab => !hab.effect?.conditions || Object.entries(hab.effect.conditions).every(([key, value]) => {
        switch(key) {
          case 'attack_type':
            return perfilesParaCalcular.some(perfil => perfil.type === value);
          default:
            return true;
        }
      }))
      .map(hab => ({
        ...hab,
        id: `${unidadOponente.name}_${hab.name}`
      }));
  
    // Habilidades ofensivas y defensivas
    const habilidades = {
      ofensivas: [
        // Habilidades de unidad ofensivas
        ...habilidadesAtacante,
        ...habilidadesPerfiles
      ],
      // Habilidades defensivas de unidad oponente
      defensivas: [...habilidadesOponente]
    };
  
    const { habilidadesActivas, toggleHabilidadOfensiva, toggleHabilidadDefensiva } = useAbilityToggle(unidadAtacante, unidadOponente);
  
    // Recalcular el daño cuando cambien las habilidades
    const danoCalculado = useMemo(() => {
      let saveModificado = unidadOponente.save;
      let wardModificado = unidadOponente.ward;
      let woundsModificado = unidadOponente.wounds;
      let mortalesExtra = 0;
      
      // Generar una copia de cada perfil, asignando los efectos activados sin sobrescribir las habilidades originales.
      let perfilesModificados = perfilesParaCalcular.map(perfil => ({
        ...perfil
      }));
  
      // Luego se recorre para modificar los perfiles según las habilidades activadas:
      perfilesModificados = perfilesModificados.map(perfil => {
        const perfilModificado = { ...perfil };
        let activatedEffects = [];
        // Por cada habilidad ofensiva disponible en la unidad (basada en el objeto de habilidades)
        habilidades.ofensivas.filter(h => h.profile).forEach(habilidad => {
          const habilidadId = `${perfil.name}_${habilidad.name}`;
          const activa = habilidadesActivas.ofensivas[habilidadId];
  
          if (!activa) return;
          
          activatedEffects.push(habilidad.effect);
  
        });
  
        // Asignar la propiedad "abilityEffects" en la copia del perfil
        perfilModificado.abilityEffects = activatedEffects;
        return perfilModificado;
      });
  
      // Aplicar habilidades ofensivas 
      habilidades.ofensivas.filter(h => !h.profile).forEach(habilidad => {
        const habilidadId = `${unidadAtacante.name}_${habilidad.name}`;
        const activa = habilidadesActivas.ofensivas[habilidadId];
        if (habilidad.type === 'fixed' || activa) {
  
          // Si la habilidad tiene condiciones, y no se cumple, se salta
          if (habilidad.effect?.conditions) {
  
            switch(habilidad.effect.conditions) {
              case 'opponent_size':
                const { opponent_size } = habilidad.effect.conditions;
                const comparacion = opponent_size.substring(0,2);
                const valor = parseInt(opponent_size.substring(2));
                
              switch(comparacion) {
                case '>=':
                  if (unidadOponente.models < valor) return;
                  break;
                case '<=':
                  if (unidadOponente.models > valor) return;
                  break;
                }
                break;  
              default:
                break;
            }
          }
  
          const { type,target, value } = habilidad.effect;
          if(type === 'extra_mortal') {
            let cantidad = 0;
            if (typeof habilidad.effect.dice_amount === 'string') 
              {
              switch(habilidad.effect.dice_amount) {
                case 'unit_size':
                  cantidad = unidadAtacante.models;
                  break;
                case 'target_size':
                  cantidad = unidadOponente.models;
                  break;
                case 'target_wounds':
                  cantidad = woundsModificado;
                  break;
                default:
                  cantidad = parseInt(habilidad.effect.dice_amount);
              }
            }else{
              cantidad = parseInt(habilidad.effect.dice_amount);
            }
            let tipoDado = habilidad.effect.dice_type;
            let dificultad;
            switch(typeof habilidad.effect.difficulty) {
              case 'string':
                if (habilidad.effect.difficulty === 'target_wounds') {
                  dificultad = woundsModificado;
                }
                break;
              default:
                dificultad = parseInt(habilidad.effect.difficulty);
            }
            let salvaguardia = wardModificado;
  
            let damage =1;
            switch(habilidad.effect.damage) {
              case 'slain':
                damage = woundsModificado;
                break;
              default:
                 damage = calcularValorDado(habilidad.effect.damage || 1);
            }
          
            mortalesExtra += calcularMortalesConDados({ 
              cantidad, 
              tipoDado, 
              dificultad, 
              salvaguardia: habilidad.effect.models_slain ? 0 : salvaguardia, 
              multiplicador: damage
            });
          } else if(type === 'add_weapon_ability') {
            perfilesModificados = perfilesModificados.map(perfil => {
              const perfilMod = { ...perfil };
              let activatedEffects = perfilMod.abilityEffects || [];
  
              if(habilidad.effect.conditions?.profile_name && perfilMod.name != habilidad.effect.conditions.profile_name) return perfilMod;
              
              activatedEffects.push(weapon_abilities[habilidad.effect.ability].effect);
              perfilMod.abilityEffects = activatedEffects;
              return perfilMod;
            });
          } else if(type === 'double_fight') {
            perfilesModificados = [
              ...perfilesModificados,
              ...perfilesModificados.filter(perfil => perfil.type === "melee")
            ];
          } else if (type === 'modifier') {
            perfilesModificados = perfilesModificados.map(perfil => {
              const perfilMod = { ...perfil };
              if(habilidad.effect.conditions?.attack_type && perfilMod.type != habilidad.effect.conditions.attack_type) return perfilMod;
              if(habilidad.effect.conditions?.profile_name && perfilMod.name != habilidad.effect.conditions.profile_name) return perfilMod;
        
                // Si es un modificador, se suma o resta el valor dependiendo de si es un modificador de daño o de golpe
                perfilMod[target] = parseInt(perfilMod[target]) + (target === 'hit' || target === 'wound' ? -parseInt(value) : parseInt(value));
              return perfilMod;
            });
          }else if (type === 'dice_override') {
            perfilesModificados = perfilesModificados.map(perfil => {
              const perfilMod = { ...perfil };
              if(habilidad.effect.conditions?.attack_type && perfilMod.type != habilidad.effect.conditions.attack_type) return perfilMod;
              if(habilidad.effect.conditions?.profile_name && perfilMod.name != habilidad.effect.conditions.profile_name) return perfilMod;
              perfilMod[target] = parseInt(value);
              return perfilMod;
            });
          } else if (type === 'critical') {
            perfilesModificados = perfilesModificados.map(perfil => {
              const perfilMod = {...perfil};
  
              if(perfilMod.name != habilidad.effect.profile_name) return perfilMod;
  
              if (!perfilMod.abilities) {
                perfilMod.abilities = [];
              }
              let abilitiesMod = perfilMod.abilities.map(ability => {
               const abilityMod = {...ability,};
               return abilityMod;
              });
  
              switch(habilidad.effect.action) {
                case 'mortal_wound':
                  abilitiesMod.push('mortal_critical');
                  break;
                case 'auto_wound':
                  abilitiesMod.push('auto_wound_critical');
                  break;
                case 'extra_hit':
                  abilitiesMod.push('double_hit_critical');
                  break;
              }
              perfilMod.abilities = abilitiesMod;
              return perfilMod;
            });
          }
        }
      });
  
      // Aplicar habilidades defensivas
      habilidades.defensivas.forEach(habilidad => {
            const habilidadId = `${unidadOponente.name}_${habilidad.name}`;
            // Solo aplicar si cumple las condiciones y es fixed o está activa
            const debeAplicarse = (habilidad.type === 'fixed' || habilidadesActivas.defensivas[habilidadId]);
              if (debeAplicarse && habilidad.effect) {
                const { type, target, value, affects } = habilidad.effect;
                if (type === 'modifier') {
                  switch (target) {
                    case 'save':
                      saveModificado = saveModificado - parseInt(value);
                      break;
                    case 'ward':
                      if (!wardModificado || parseInt(value) < wardModificado) {
                        wardModificado = parseInt(value);
                      }
                      break;
                    case 'wounds':
                      woundsModificado = woundsModificado + parseInt(value);
                      break;
                    default:
                      break;
                  }
  
                  if (affects === 'enemy_attributes' || affects === 'enemy_atributes') 
                    {
                        perfilesModificados = perfilesModificados.map(perfil => {
                          let perfilMod = {...perfil};
                          if(habilidad.effect.conditions?.attack_type && perfilMod.type != habilidad.effect.conditions.attack_type) return perfilMod;
                         
                          if(habilidad.effect.type === 'modifier') {
                            perfilMod[target] = parseInt(perfilMod[target]) + parseInt(value);
                          } else if(habilidad.effect.type === 'ignore_modifier') {
                            perfilMod[target] = 0;
                          }
                          return perfilMod;
                        });
                    }
                }
              }
      });
      console.log("perfilesModificados precalculo", perfilesModificados);
      const resultadoAtaquesPerfiles = calculateAttacks({
        perfiles_ataque: perfilesModificados.map(perfil => ({
          ...perfil,
          models_override: perfil.models || unidadAtacante.models
        })),
        guardia: saveModificado,
        salvaguardia: wardModificado,
        enemy_wounds: woundsModificado,
        enemigo: unidadOponente
      });
  
      return {
        ...resultadoAtaquesPerfiles,
        mortales: mortalesExtra,
        damage_final: resultadoAtaquesPerfiles.damage_final + mortalesExtra
      };
    }, [habilidades,perfilesParaCalcular, unidadAtacante, unidadOponente]);
  
    const prevDanoRef = useRef();
  
    // Notificar al padre cuando se calcule el daño y evitar actualizaciones innecesarias
    useEffect(() => {
      const danoTotal = (danoCalculado?.damage_final || 0);
      if (danoTotal !== prevDanoRef.current) {
        prevDanoRef.current = danoTotal;
        onDanoCalculado?.(danoTotal);
      }
    }, [danoCalculado?.damage_final , onDanoCalculado]);
  
    // Actualizar los manejadores de eventos
    const handleToggleOfensiva = (habilidadId) => {
      toggleHabilidadOfensiva(habilidadId);
    };
  
    const handleToggleDefensiva = (habilidadId) => {
      toggleHabilidadDefensiva(habilidadId);
    };
  
    const handleMouseEnter = (habilidadId) => {
      // Limpiar cualquier timeout pendiente
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      // Establecer un timeout para mostrar el tooltip específico
      tooltipTimeoutRef.current = setTimeout(() => {
        setActiveTooltip(habilidadId);
      }, 1000);
    };
  
    const handleMouseLeave = () => {
      // Limpiar el timeout si existe
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      // Ocultar el tooltip
      setActiveTooltip(null);
    };
  
    useEffect(() => {
      return () => {
        if (tooltipTimeoutRef.current) {
          clearTimeout(tooltipTimeoutRef.current);
        }
      };
    }, []);
  
    // Usar el daño calculado en lugar del damage_final proporcionado
    const danoFinal = danoCalculado.damage_final;
    const vidaTotal = danoCalculado.enemy_wounds * unidadOponente.models;
    const porcentajeVidaTotal = Math.min((danoFinal / vidaTotal) * 100, 100);
  
    return (
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        gap: 0.5,
        p: 2,
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(255,255,255,0.02)'
        }
      }}>
        {/* Header con nombres */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          mb: -1
        }}>
          <Typography 
            sx={{ 
              color: theme => unidadAtacante.color,
              opacity: 0.9,
              fontSize: '1rem',
              fontWeight: 500
            }}>
            {unidadAtacante.name}
          </Typography>

          <Typography 
            sx={{ 
              color: theme => unidadOponente.color,
              fontSize: '1rem',
              fontWeight: 500
            }}>
            {unidadOponente.name}
          </Typography>
        </Box>

        {/* Fila de "Average damage vs" y stats defensivos */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          mb: 1
        }}>
          <Typography 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.8rem',
              opacity: 0.7,
              letterSpacing: '0.02em'
            }}>
            Average damage vs
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            gap: 1.5, 
            alignItems: 'center',
            opacity: 0.8,
            fontSize: '0.8rem'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', mr: 0.5 }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {unidadOponente.models}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FavoriteIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', mr: 0.5 }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {unidadOponente.wounds}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ShieldIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', mr: 0.5 }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {unidadOponente.save}+
              </Typography>
            </Box>

            {unidadOponente.ward && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SecurityIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', mr: 0.5 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {unidadOponente.ward}+
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Fila de daño y porcentaje */}
        <Box sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 2,
          width: '100%',
          mb: 1
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontSize: { xs: '2rem', sm: '2.5rem' },
              color: danoFinal >= 10 ? '#ff4d4d' : danoFinal >= 8 ? 'primary.main' : '#99ccff',
              fontWeight: 'bold',
              lineHeight: 1,
              cursor: 'help',
              textShadow: '0 0 10px rgba(0,0,0,0.5)',
              flex: 'none'
            }}>
            {danoFinal.toFixed(1)}
          </Typography>

          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 0.5,
            flex: 1
          }}>
            <Typography
              sx={{
                color: porcentajeVidaTotal >= 100 ? 'primary.main' : 'secondary.main', 
                fontWeight: 500,
                fontSize: '0.875rem',
              }}>
              {`${porcentajeVidaTotal.toFixed(0)}%`}
            </Typography>
            <Box sx={{ 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'flex-end' 
            }}>
              <LifeBar 
                unidadOponente={unidadOponente}
                porcentajeVidaTotal={porcentajeVidaTotal}
              />
            </Box>
          </Box>
        </Box>
  
        {/* Habilidades */}
        <Box sx={{ 
          display: 'flex',
          gap: 2,
          width: '100%',
          transition: 'height 0.2s ease',
          minHeight: 0,
        }}>
          {/* Columna habilidades ofensivas */}
          <Box sx={{
            display: 'flex', 
            flexDirection: 'column',
            gap: 0.5,
            flex: 1,
            transition: 'all 0.2s ease',
          }}>
            {habilidades.ofensivas.map((habilidad) => (
              <AbilityButton
                key={habilidad.id}
                habilidad={habilidad}
                active={habilidadesActivas.ofensivas[habilidad.id]}
                onToggle={handleToggleOfensiva}
                onMouseEnter={() => window.innerWidth >= 800 && handleMouseEnter(habilidad.id)}
                onMouseLeave={() => window.innerWidth >= 800 && handleMouseLeave()}
                activeTooltip={activeTooltip === habilidad.id}
                onTooltipClose={() => setActiveTooltip(null)}
                color="primary"
                activeBackgroundColor="rgba(0, 207, 200, 0.15)"
                hoverBackgroundColor="rgba(0, 207, 200, 0.25)"
                activeBorderColor="primary.main"
                hoverBorderColor="primary.light"
                activeTextColor="#e6f7ff"
                switchTrackColor="rgba(0, 207, 200, 0.3)"
                tabIndex={-1}
              />
            ))}
          </Box>
  
          {/* Columna habilidades defensivas */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column', 
            gap: 0.5,
            flex: 1,
            transition: 'all 0.2s ease',
          }}>
            {habilidades.defensivas.map((habilidad) => (
              <AbilityButton
                key={habilidad.id}
                habilidad={habilidad}
                active={habilidadesActivas.defensivas[habilidad.id]}
                onToggle={handleToggleDefensiva}
                onMouseEnter={() => window.innerWidth >= 800 && handleMouseEnter(habilidad.id)}
                onMouseLeave={() => window.innerWidth >= 800 && handleMouseLeave()}
                activeTooltip={activeTooltip === habilidad.id}
                onTooltipClose={() => setActiveTooltip(null)}
                color="secondary"
                activeBackgroundColor="rgba(255, 77, 130, 0.15)"
                hoverBackgroundColor="rgba(255, 77, 130, 0.25)"
                activeBorderColor="#ff9999"
                hoverBorderColor="#ff9999"
                activeTextColor="#e6f7ff"
                switchTrackColor="rgba(255, 77, 130, 0.3)"
                tabIndex={-1}
              />
            ))}
          </Box>
        </Box>
      </Box>
    );
  });

  export default DamageCalculator;