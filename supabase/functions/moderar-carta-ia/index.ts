const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
    
    const prompt = `Analiza si el siguiente texto contiene insultos graves, amenazas o contenido explicito. Responde estrictamente en formato JSON como este ejemplo: {"aprobado": true, "motivo": ""} o {"aprobado": false, "motivo": "razon"}. Texto: "${content}"`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    })

    const data = await res.json()
    let txt = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    txt = txt.replace('```json', '').replace('```', '').trim()
    
    const obj = JSON.parse(txt)
    return new Response(
      JSON.stringify({ contieneLenguajeInadecuado: !obj.aprobado, motivo: obj.motivo || '' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})