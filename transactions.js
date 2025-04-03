const TAXA_APOSTAS = 0.125 // 12.5%

async function registerTransaction(description, value, isGain = false) {
  const user = await getCurrentUser()
  if (!user) {
    window.location.href = 'login.html'
    return
  }

  let netValue = value
  let tax = 0
  
  if (isGain && value > 0) {
    tax = value * TAXA_APOSTAS
    netValue = value - tax
    
    // Registra a taxa como transação separada
    await registerTransaction(`Taxa sobre ${description}`, -tax)
  }
  
  // Obtém saldo atual
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('saldo')
    .eq('id', user.id)
    .single()
    
  if (userError) throw userError
  
  const newBalance = userData.saldo + netValue
  
  // Atualiza saldo do usuário
  const { error: updateError } = await supabase
    .from('users')
    .update({ saldo: newBalance })
    .eq('id', user.id)
    
  if (updateError) throw updateError
  
  // Registra transação
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert([
      {
        user_id: user.id,
        description,
        value: netValue,
        tax: isGain ? tax : null,
        balance: newBalance
      }
    ])
    
  if (transactionError) throw transactionError
  
  return { netValue, tax }
}

async function getTransactions(limit = 50) {
  const user = await getCurrentUser()
  if (!user) {
    window.location.href = 'login.html'
    return []
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)
    
  if (error) throw error
  
  return data
}

async function getCurrentBalance() {
  const user = await getCurrentUser()
  if (!user) {
    window.location.href = 'login.html'
    return 0
  }

  const { data, error } = await supabase
    .from('users')
    .select('saldo')
    .eq('id', user.id)
    .single()
    
  if (error) throw error
  
  return data.saldo
}