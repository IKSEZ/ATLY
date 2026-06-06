import { useState } from 'react'
import api from '../services/api'
import Header from '../components/Header'

function Treino({ atletaId }) {
  const [form, setForm] = useState({
    tipo: '',
    intensidade: '',
    duracao_min: '',
    volume: '',
    observacoes: ''
  })

  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMensagem('')
    setErro('')
    setLoading(true)

    const carga = Number(form.intensidade) * Number(form.duracao_min)

    try {
      await api.post('/treinos', {
        atleta_id: atletaId,
        tipo: form.tipo,
        intensidade: Number(form.intensidade),
        duracao_min: Number(form.duracao_min),
        volume: Number(form.volume),
        observacoes: form.observacoes,
        carga
      })

      setMensagem('Treino registrado com sucesso.')

      setForm({
        tipo: '',
        intensidade: '',
        duracao_min: '',
        volume: '',
        observacoes: ''
      })
    } catch (error) {
      setErro('Erro ao registrar treino.')
    } finally {
      setLoading(false)
    }
  }

  const cargaPrevista =
    form.intensidade && form.duracao_min
      ? Number(form.intensidade) * Number(form.duracao_min)
      : 0

  return (
    <section>
      <Header
        titulo="Registrar Treino"
        subtitulo="Informe os dados do treino para calcular a carga automaticamente."
      />

      <div className="form-layout">
        <form className="card form-card" onSubmit={handleSubmit}>
          <label>Tipo de treino</label>
          <input
            name="tipo"
            placeholder="Ex: corrida, musculação, funcional"
            value={form.tipo}
            onChange={handleChange}
            required
          />

          <label>Intensidade</label>
          <input
            name="intensidade"
            type="number"
            min="1"
            max="10"
            placeholder="Escala de 1 a 10"
            value={form.intensidade}
            onChange={handleChange}
            required
          />

          <label>Duração em minutos</label>
          <input
            name="duracao_min"
            type="number"
            min="1"
            placeholder="Ex: 60"
            value={form.duracao_min}
            onChange={handleChange}
            required
          />

          <label>Volume</label>
          <input
            name="volume"
            type="number"
            min="0"
            placeholder="Ex: distância, séries ou volume total"
            value={form.volume}
            onChange={handleChange}
          />

          <label>Observações</label>
          <textarea
            name="observacoes"
            placeholder="Observações do treino"
            value={form.observacoes}
            onChange={handleChange}
          />

          {mensagem && <div className="success-message">{mensagem}</div>}
          {erro && <div className="error-message">{erro}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Treino'}
          </button>
        </form>

        <div className="card preview-card">
          <span>Carga calculada</span>
          <h2>{cargaPrevista}</h2>
          <p>Fórmula usada: intensidade × duração</p>
        </div>
      </div>
    </section>
  )
}

export default Treino