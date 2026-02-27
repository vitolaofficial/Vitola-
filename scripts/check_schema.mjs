import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zquypdnnyioxjokoknhp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CRco3eIgE2aB8CXdRut92g_lqIG308q';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkSchema() {
    const { data, error } = await supabase.from('cigars').select('*').limit(1);
    if (error) console.error(error);
    else {
        console.log("Cigar schema keys:", Object.keys(data[0]));
    }
}

checkSchema();
