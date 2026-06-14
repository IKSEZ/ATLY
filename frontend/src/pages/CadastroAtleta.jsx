import { useState } from 'react'
import api from '../services/api'
import Header from '../components/Header'
<<<<<<< HEAD

function CadastroAtleta() {
=======
import { ArrowRight } from 'lucide-react'

function CadastroAtleta({ tecnicoId }) {
>>>>>>> 683d25ea749816f6f9fb72d2dfca7db1311976c0
  const [form, setForm] = useState({
    nome: '',
    email: '',
    idade: '',
    peso: '',
<<<<<<< HEAD
    modalidade: '',
    historico_lesoes: '',
=======
    historico_lesoes: ''
>>>>>>> 683d25ea749816f6f9fb72d2dfca7db1311976c0
  })

  const [mensagem, setMensagem] = useState('')
  const [senhaTemporaria, setSenhaTemporaria] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
<<<<<<< HEAD
    setForm({ ...form, [e.target.name]: e.target.value })
=======
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
>>>>>>> 683d25ea749816f6f9fb72d2dfca7db1311976c0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMensagem('')
    setSenhaTemporaria('')
    setErro('')
    setLoading(true)

    try {
      const response = await api.post('/atletas', {
        ...form,
        idade: form.idade ? Number(form.idade) : null,
<<<<<<< HEAD
        peso: form.peso ? Number(form.peso) : null,
=======
        peso: form.peso ? Number(form.peso) : null
>>>>>>> 683d25ea749816f6f9fb72d2dfca7db1311976c0
      })

      setMensagem('Atleta cadastrado e vinculado com sucesso.')
      setSenhaTemporaria(response.data?.senha_temporaria || '')

      setForm({
        nome: '',
        email: '',
        idade: '',
        peso: '',
<<<<<<< HEAD
        modalidade: '',
        historico_lesoes: '',
      })
    } catch (error) {
      const msg = error.response?.data?.erro || 'Erro ao cadastrar atleta.'
      setErro(msg)
=======
        historico_lesoes: ''
      })
    } catch (error) {
      setErro('Erro ao cadastrar atleta.')
>>>>>>> 683d25ea749816f6f9fb72d2dfca7db1311976c0
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <Header
        titulo="Cadastrar Atleta"
        subtitulo="Adicione um novo atleta para acompanhamento técnico."
      />

      <form className="card form-card" onSubmit={handleSubmit}>
        <label>Nome</label>
        <input
          name="nome"
          placeholder="Nome completo"
          value={form.nome}
          onChange={handleChange}
          required
        />

        <label>E-mail</label>
        <input
          name="email"
          type="email"
          placeholder="email@exemplo.com"
          value={form.email}
          onChange={handleChange}
          required
        />

<<<<<<< HEAD
        <label>Modalidade</label>
        <input
          name="modalidade"
          placeholder="Ex: Futebol, Natação, Corrida..."
          value={form.modalidade}
          onChange={handleChange}
        />

=======
>>>>>>> 683d25ea749816f6f9fb72d2dfca7db1311976c0
        <label>Idade</label>
        <input
          name="idade"
          type="number"
          min="0"
          placeholder="Ex: 24"
          value={form.idade}
          onChange={handleChange}
        />

<<<<<<< HEAD
        <label>Peso (kg)</label>
=======
        <label>Peso</label>
>>>>>>> 683d25ea749816f6f9fb72d2dfca7db1311976c0
        <input
          name="peso"
          type="number"
          min="0"
          step="0.01"
          placeholder="Ex: 72.5"
          value={form.peso}
          onChange={handleChange}
        />

        <label>Histórico de lesões</label>
        <textarea
          name="historico_lesoes"
          placeholder="Descreva lesões anteriores, cirurgias ou observações clínicas"
          value={form.historico_lesoes}
          onChange={handleChange}
        />

<<<<<<< HEAD
        {mensagem && (
          <div className="success-message">{mensagem}</div>
        )}

        {senhaTemporaria && (
          <div className="success-message">
            Senha temporária:{' '}
            <strong>{senhaTemporaria}</strong>
            <br />
            <small>
              Informe esta senha ao atleta. Ele será solicitado a trocá-la
              no primeiro acesso.
            </small>
          </div>
        )}

        {erro && <div className="error-message">{erro}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Cadastrar Atleta'}
=======
        {mensagem && <div className="success-message">{mensagem}</div>}
        {senhaTemporaria && (
          <div className="success-message">
            Senha temporária: <strong>{senhaTemporaria}</strong>
          </div>
        )}
        {erro && <div className="error-message">{erro}</div>}

        <button type="submit" className="login-main-button" disabled={loading}>
          {loading ? 'Salvando...' : 'Cadastrar Atleta'}
          {!loading && <ArrowRight size={19} />}
>>>>>>> 683d25ea749816f6f9fb72d2dfca7db1311976c0
        </button>
      </form>
    </section>
  )
}

export default CadastroAtleta