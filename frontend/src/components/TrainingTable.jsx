import RiskBadge from './RiskBadge'

function TrainingTable({ treinos = [], riscoGeral = 'baixo' }) {
  if (!treinos.length) {
    return <div className="empty-state">Nenhum treino registrado ainda.</div>
  }

  // Garante que o risco seja uma string limpa (evita quebra se vier objeto do banco)
  const riscoDoAtleta = typeof riscoGeral === 'string' 
    ? riscoGeral 
    : (riscoGeral?.nivel_risco ?? riscoGeral?.risco ?? riscoGeral?.nivel ?? 'baixo');

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo</th>
            <th>Intensidade</th>
            <th>Duração</th>
            <th>Volume</th>
            <th>Carga</th>
            <th>Risco</th>
          </tr>
        </thead>
        <tbody>
          {treinos.map((treino) => (
            <tr key={treino.id || Math.random()}>
              <td>
                {treino.data_treino
                  ? new Date(treino.data_treino).toLocaleDateString('pt-BR')
                  : '-'}
              </td>
              <td>{treino.tipo || '-'}</td>
              <td>{treino.intensidade || '-'}</td>
              <td>{treino.duracao_min ? `${treino.duracao_min} min` : '-'}</td>
              <td>{treino.volume || '-'}</td>
              <td>{treino.carga || '-'}</td>
              <td>
                {/* Se o treino não tiver risco próprio no banco, herda o risco calculado da IA */}
                <RiskBadge risco={treino.nivel_risco ?? treino.risco ?? riscoDoAtleta} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TrainingTable