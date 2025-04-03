export async function signUp(email, password, username) {
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    });
    
    if (error) throw error;
    
    const { error: profileError } = await supabaseClient
      .from('users')
      .insert([
        { 
          id: data.user.id,
          email,
          username,
          saldo: 100.00
        }
      ]);
    
    if (profileError) throw profileError;
    
    return data.user;
  }
  
  export async function signIn(email, password) {
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    await supabaseClient
      .from('users')
      .update({ last_login: new Date() })
      .eq('id', data.user.id);
    
    return data.user;
  }
  
  export async function signOut() {
    const supabaseClient = getSupabaseClient();
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
  }
  
  export async function getCurrentUser() {
    const supabaseClient = getSupabaseClient();
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error) throw error;
    return user;
  }