const {Pool} = require('pg');
const pool = new Pool({host:'localhost',port:5432,database:'atly_db',user:'postgres',password:'saory'});
(async ()=>{
  try{
    await pool.query('INSERT INTO atleta_perfil (usuario_id, idade, peso, historico_lesoes) VALUES ($1,$2,$3,$4)', [8, 25, 70, '']);
    console.log('atleta_perfil inserted for usuario 8');
  } catch(err){
    console.error('error inserting perfil:', err);
  } finally{
    await pool.end();
  }
})();
