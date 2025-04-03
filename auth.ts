// auth.js
import { supabaseClient } from './supabaseClient'; // Importa o cliente do Supabase

// Função para registrar um novo usuário
export async function signUp(email, password, username) {
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

// Função para login
export async function signIn(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithEmailAndPassword(email, password);

    if (error) throw error;

    // Atualiza último login
    await supabaseClient
        .from('users')
        .update({ last_login: new Date() })
        .eq('id', data.user.id);

    return data.user;
}

// Função para logout
export async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
}

// Função para obter o usuário atual
export async function getCurrentUser() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error) throw error;
    return user;
}
