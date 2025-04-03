// supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from './supabase-config'; // Importa as configurações do Supabase

// Inicializa o cliente Supabase com as credenciais importadas
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Exporta o cliente para ser utilizado em outros arquivos
export { supabaseClient };
