function RiskBadge({ risco }) {
  const riscoFormatado = risco || 'sem dados'

  const classes = {
    seguro: 'risk-safe',
    baixo: 'risk-safe',
    atencao: 'risk-warning',
    atenção: 'risk-warning',
    alto: 'risk-danger',
    sem_dados: 'risk-neutral',
    'sem dados': 'risk-neutral'
  }

  return (
    <span className={`risk-badge ${classes[riscoFormatado] || 'risk-neutral'}`}>
      {riscoFormatado}
    </span>
  )
}

export default RiskBadge