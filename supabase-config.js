// Configuração do Supabase com suas credenciais
const supabaseUrl = "https://jdoxsqgkwnlljycibjhd.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkb3hzcWdrd25sbGp5Y2liamhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3MTQ2NDUsImV4cCI6MjA1OTI5MDY0NX0.qED8PJmpMPgMPXpaNGj8rbPLEj_S3wF63p4VQw_QpoE"

const supabaseClient  = supabase.createClient(supabaseUrl, supabaseKey);

// Funções de autenticação
async function signUp(email, password, username) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username
      }
    }
  })
  
  if (error) throw error
  
  // Cria perfil do usuário na tabela public.users
  const { error: profileError } = await supabase
    .from('users')
    .insert([
      { 
        id: data.user.id,
        email,
        username,
        saldo: 100.00
      }
    ])
  
  if (profileError) throw profileError
  
  return data.user
}

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  
  // Atualiza último login
  await supabase
    .from('users')
    .update({ last_login: new Date() })
    .eq('id', data.user.id)
  
  return data.user
}

async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Verifica se usuário está logado
async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}