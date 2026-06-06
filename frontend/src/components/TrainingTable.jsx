import RiskBadge from './RiskBadge'

function TrainingTable({ treinos = [] }) {
  if (!treinos.length) {
    return <div className="empty-state">Nenhum treino registrado ainda.</div>
  }

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
            <tr key={treino.id}>
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
                <RiskBadge risco={treino.nivel_risco} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TrainingTable