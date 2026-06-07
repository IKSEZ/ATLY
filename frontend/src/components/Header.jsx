function Header({ titulo, subtitulo }) {
  return (
    <div className="page-header">
      <div>
        <h1>{titulo}</h1>
        <p>{subtitulo}</p>
      </div>
    </div>
  )
}

export default Header