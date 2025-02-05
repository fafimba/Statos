import React, { useState, useEffect } from 'react';
import '../styles/UnidadesComparacion.css';

const UNIDADES = {
  'Intercessors': {
    nombre: 'Intercessors',
    miniaturas: 5,
    ataques_por_miniatura: 2,
    hit: 3,
    wound: 3,
    damage: 1,
    perforacion: 0,
    tipo_critico: 'ninguno',
    guardia: 3,
    salvaguardia: 0
  },
  'Terminators': {
    nombre: 'Terminators',
    miniaturas: 5,
    ataques_por_miniatura: 3,
    hit: 3,
    wound: 3,
    damage: 2,
    perforacion: 2,
    tipo_critico: 'ninguno',
    guardia: 2,
    salvaguardia: 4
  },
  'Tyranid Warriors': {
    nombre: 'Tyranid Warriors',
    miniaturas: 3,
    ataques_por_miniatura: 4,
    hit: 3,
    wound: 4,
    damage: 1,
    perforacion: 1,
    tipo_critico: 'auto_wound',
    guardia: 4,
    salvaguardia: 5
  },
  'Necron Skorpekh Destroyers': {
    nombre: 'Necron Skorpekh Destroyers',
    miniaturas: 3,
    ataques_por_miniatura: 4,
    hit: 3,
    wound: 3,
    damage: 2,
    perforacion: 2,
    tipo_critico: 'mortal',
    guardia: 3,
    salvaguardia: 0
  },
  'Plague Marines': {
    nombre: 'Plague Marines',
    miniaturas: 5,
    ataques_por_miniatura: 2,
    hit: 3,
    wound: 3,
    damage: 1,
    perforacion: 1,
    tipo_critico: 'dos_hits',
    guardia: 3,
    salvaguardia: 5
  }
};

function UnidadesComparacion() {
  const [matrizDaño, setMatrizDaño] = useState({});
  const [cargando, setCargando] = useState(true);

  const calcularMatrizDaño = async () => {
    const nuevaMatriz = {};
    const unidades = Object.values(UNIDADES);

    for (const atacante of unidades) {
      nuevaMatriz[atacante.nombre] = {};
      
      for (const defensor of unidades) {
        try {
          const response = await fetch('http://127.0.0.1:5000/api/calcular-ataques', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...atacante,
              guardia: defensor.guardia,
              salvaguardia: defensor.salvaguardia
            }),
          });

          const data = await response.json();
          nuevaMatriz[atacante.nombre][defensor.nombre] = data.damage_final;
        } catch (error) {
          console.error('Error:', error);
          nuevaMatriz[atacante.nombre][defensor.nombre] = 'Error';
        }
      }
    }

    setMatrizDaño(nuevaMatriz);
    setCargando(false);
  };

  useEffect(() => {
    calcularMatrizDaño();
  }, []);

  if (cargando) {
    return <div className="cargando">Calculando daño entre unidades...</div>;
  }

  return (
    <div className="tabla-comparacion-container">
      <h2>Matriz de Daño entre Unidades</h2>
      <div className="tabla-scroll">
        <table className="tabla-comparacion">
          <thead>
            <tr>
              <th>Atacante ↓ / Defensor →</th>
              {Object.keys(UNIDADES).map(unidad => (
                <th key={unidad}>{unidad}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(UNIDADES).map(atacante => (
              <tr key={atacante}>
                <td className="nombre-unidad">{atacante}</td>
                {Object.keys(UNIDADES).map(defensor => (
                  <td key={`${atacante}-${defensor}`} className="celda-daño">
                    {matrizDaño[atacante]?.[defensor]?.toFixed(2) || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UnidadesComparacion; 