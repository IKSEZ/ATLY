import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts'

function PerformanceChart({ treinos = [] }) {
  const dados = treinos
    .slice()
    .reverse()
    .map((treino, index) => ({
      data: treino.data_treino
        ? new Date(treino.data_treino).toLocaleDateString('pt-BR')
        : `Treino ${index + 1}`,
      carga: Number(treino.carga || 0)
    }))

  return (
    <div className="card full-card">
      <h3>Evolução da Carga</h3>

      {!dados.length ? (
        <div className="empty-state">
          Registre treinos para gerar o gráfico.
        </div>
      ) : (
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dados}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="data" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="carga"
                stroke="#2563eb"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default PerformanceChart