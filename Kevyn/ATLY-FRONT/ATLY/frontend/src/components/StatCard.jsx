function StatCard({ titulo, valor, descricao, destaque }) {
  return (
    <div className={`card stat-card ${destaque ? 'card-highlight' : ''}`}>
      <span>{titulo}</span>
      <h2>{valor ?? '--'}</h2>
      {descricao && <p>{descricao}</p>}
    </div>
  )
}

export default StatCard